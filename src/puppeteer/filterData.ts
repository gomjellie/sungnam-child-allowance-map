import { Store } from '../services/storeService';

/**
 * enrichedMerchants.json 파일에서 좌표 정보(lat, lng)가 없거나 0인 데이터를 제거하고
 * 이름과 좌표가 동일한 중복 데이터를 제거하는 함수
 * @returns 좌표 정보가 있고 중복이 제거된 가맹점 정보 배열
 */
export const run = async (): Promise<Store[]> => {
  try {
    // enrichedMerchants.json 파일 읽기
    const data = await import('../../data/enrichedMerchants.json');
    const stores: Store[] = JSON.parse(JSON.stringify(data.default));

    console.log(`원본 데이터: 총 ${stores.length}개의 가맹점 데이터`);

    // 좌표 정보가 있는 데이터만 필터링
    const filteredByCoords = stores.filter((store) => {
      // lat, lng가 모두 존재하고 0이 아닌 경우만 포함
      return (
        store.lat !== undefined &&
        store.lng !== undefined &&
        store.lat !== 0 &&
        store.lng !== 0
      );
    });

    console.log(
      `좌표 필터링 후 데이터: 총 ${filteredByCoords.length}개의 가맹점 데이터`
    );
    console.log(
      `좌표 없는 제거된 데이터: 총 ${stores.length - filteredByCoords.length}개`
    );

    // 중복 데이터 제거 (name, lat, lng가 모두 동일한 경우 중복으로 판단)
    const uniqueMap = new Map<string, Store>();

    filteredByCoords.forEach((store) => {
      // name, lat, lng를 조합한 고유 키 생성
      const key = `${store.name}_${store.lat}_${store.lng}`;

      // 중복되지 않은 경우에만 Map에 추가
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, store);
      }
    });

    // Map의 값들을 배열로 변환
    const uniqueStores = Array.from(uniqueMap.values());

    console.log(
      `중복 제거 후 데이터: 총 ${uniqueStores.length}개의 가맹점 데이터`
    );
    console.log(
      `중복 제거된 데이터: 총 ${
        filteredByCoords.length - uniqueStores.length
      }개`
    );

    // 필터링된 데이터를 파일에 저장
    const fs = await import('fs/promises');
    const path = await import('path');
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });

    // 필터링된 가맹점 데이터를 JSON 파일로 저장
    const filePath = path.join(dataDir, 'filteredMerchants.json');

    await fs.writeFile(filePath, JSON.stringify(uniqueStores, null, 2), 'utf8');
    console.log(
      '좌표 정보가 있고 중복이 제거된 데이터만 filteredMerchants.json 파일에 저장되었습니다.'
    );

    return uniqueStores;
  } catch (error) {
    console.error('데이터 필터링 중 오류가 발생했습니다:', error);
    throw error;
  }
};

// 스크립트 실행
run();
