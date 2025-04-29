import axios from 'axios';
import { Store } from '../services/storeService';

/**
 * @see https://developers.kakao.com/docs/latest/ko/local/dev-guide#search-by-keyword
 */
interface KakaoAddressResponse {
  documents: {
    address_name: string;
    x: string; // longitude
    y: string; // latitude
  }[];
}

/**
 * Kakao API를 사용하여 주소를 좌표로 변환하고 지도 URL을 생성하는 함수
 * @param store 가맹점 정보
 * @returns 좌표와 지도 URL이 추가된 가맹점 정보
 */
export const enrichStoreData = async (store: Store): Promise<Store> => {
  const API_KEY = '0152873fd80592f7dd0388fa3d6db69b';
  const url = 'https://dapi.kakao.com/v2/local/search/address.json';

  try {
    const coordResponse = await axios.get<KakaoAddressResponse>(url, {
      headers: { Authorization: `KakaoAK ${API_KEY}` },
      params: { query: store.address.split(',')[0] },
    });

    if (coordResponse.data.documents.length > 0) {
      const { x, y } = coordResponse.data.documents[0];

      return {
        ...store,
        lat: parseFloat(y),
        lng: parseFloat(x),
      };
    }

    return {
      ...store,
    };
  } catch (error) {
    console.error('주소 좌표 변환 중 오류가 발생했습니다:', error);
    return {
      ...store,
      lat: 0,
      lng: 0,
    };
  }
};

/**
 * merchants.json 파일을 읽어서 가맹점 데이터를 업데이트하고 저장하는 함수
 * @returns 업데이트된 가맹점 정보 배열
 */
export const run = async (): Promise<Store[]> => {
  try {
    // merchants.json 파일 읽기
    const data = await import('../../data/merchants.json');
    const stores: Store[] = JSON.parse(JSON.stringify(data.default));

    // 가맹점 데이터 업데이트
    console.log('가맹점 데이터 업데이트를 시작합니다...');
    const enrichedStores = await enrichStoresData(stores.slice(500, 520));
    console.log(
      `총 ${enrichedStores.length}개의 가맹점 데이터가 업데이트되었습니다.`
    );

    // 업데이트된 데이터를 파일에 저장
    const fs = await import('fs/promises');
    const path = await import('path');
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });

    // 가맹점 데이터를 JSON 파일로 저장
    const filePath = path.join(dataDir, 'enrichedMerchants.json');

    await fs.writeFile(
      filePath,
      JSON.stringify(enrichedStores, null, 2),
      'utf8'
    );
    console.log('업데이트된 데이터가 merchants.json 파일에 저장되었습니다.');

    return enrichedStores;
  } catch (error) {
    console.error('데이터 업데이트 중 오류가 발생했습니다:', error);
    throw error;
  }
};

/**
 * 여러 가맹점의 데이터를 한 번에 처리하는 함수
 * @param stores 가맹점 정보 배열
 * @returns 좌표와 지도 URL이 추가된 가맹점 정보 배열
 */
export const enrichStoresData = async (stores: Store[]): Promise<Store[]> => {
  try {
    // API 호출 제한을 고려하여 순차적으로 처리
    const enrichedStores = [];
    for (const store of stores) {
      const enrichedStore = await enrichStoreData(store);
      enrichedStores.push(enrichedStore);
      // API 호출 간격 조절 (429 Too Many Requests 방지)
      // await new Promise((resolve) => setTimeout(resolve, 10));
    }
    return enrichedStores;
  } catch (error) {
    console.error('가맹점 데이터 처리 중 오류가 발생했습니다:', error);
    return stores.map((store) => ({
      ...store,
      kakao_map_url: '',
      naver_map_url: '',
    }));
  }
};

run();
