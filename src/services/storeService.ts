// 환경 변수를 통한 API 키 관리 (보안을 위해 권장)
// const API_KEY = import.meta.env.VITE_API_KEY;
import enrichedStores from '../../data/filteredMerchants.json';

export type Store = {
  name: string;
  type: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
};

export const fetchStores = (): Store[] => {
  try {
    return enrichedStores;
  } catch (error) {
    console.error('가맹점 데이터를 가져오는 중 오류가 발생했습니다:', error);
    return [];
  }
};

export const fetchStoresByCategory = (category: string) => {
  try {
    const stores = fetchStores();
    if (category === '전체') return stores;
    return stores.filter((store) => store.category === category);
  } catch (error) {
    console.error(
      '카테고리별 가맹점 데이터를 가져오는 중 오류가 발생했습니다:',
      error
    );
    return [];
  }
};
