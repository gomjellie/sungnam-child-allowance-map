// JSON 데이터 직접 import
import storeData from '../../data/filteredMerchants.json';

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
    return storeData as Store[];
  } catch (error) {
    console.error('가맹점 데이터를 가져오는 중 오류가 발생했습니다:', error);
    return [];
  }
};

export const fetchStoresByCategory = (category: string): Store[] => {
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
