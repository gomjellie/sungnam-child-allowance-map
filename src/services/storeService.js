// 실제 API 엔드포인트로 대체해야 함
// 예: 성남시 공공데이터 포털 또는 자체 백엔드 서버
const API_BASE_URL = 'https://example.com/api';

// 환경 변수를 통한 API 키 관리 (보안을 위해 권장)
// const API_KEY = import.meta.env.VITE_API_KEY;

/**
 * 가맹점 데이터를 가져오는 함수
 *
 * 실제 API 연동 방법:
 * 1. API_BASE_URL을 실제 엔드포인트로 변경
 * 2. 아래 주석 처리된 API 호출 코드의 주석을 해제
 * 3. 샘플 데이터 반환 코드를 주석 처리
 *
 * @returns {Promise<Array>} 가맹점 데이터 배열
 */
export const fetchStores = async () => {
  try {
    // 실제 API 호출 코드 (현재는 주석 처리)
    // const response = await axios.get(`${API_BASE_URL}/stores`, {
    //   params: {
    //     // 필요한 파라미터 추가 (예: API 키, 지역 코드 등)
    //     // apiKey: API_KEY,
    //     // region: '성남시'
    //   }
    // });
    // return response.data;

    // 데이터 형식 변환이 필요한 경우 (API 응답 구조에 따라 조정)
    // return response.data.map(item => ({
    //   id: item.id,
    //   name: item.storeName,
    //   category: item.category,
    //   address: item.address,
    //   lat: parseFloat(item.latitude),
    //   lng: parseFloat(item.longitude)
    // }));

    // 샘플 데이터 반환 (실제 API 연동 전까지 사용)
    return sampleStores;
  } catch (error) {
    console.error('가맹점 데이터를 가져오는 중 오류가 발생했습니다:', error);
    return [];
  }
};

/**
 * 카테고리별 가맹점 데이터를 가져오는 함수
 *
 * @param {string} category - 가맹점 카테고리
 * @returns {Promise<Array>} 필터링된 가맹점 데이터 배열
 */
export const fetchStoresByCategory = async (category) => {
  try {
    const stores = await fetchStores();
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

// 샘플 데이터 - 실제 API 연동 전까지 사용
const sampleStores = [
  {
    id: 1,
    name: '분당 문구점',
    category: '문구/완구',
    address: '경기도 성남시 분당구 서현동 123-45',
    lat: 37.3860521,
    lng: 127.1214038,
    tel: '031-123-4567',
  },
  {
    id: 2,
    name: '판교 장난감 가게',
    category: '문구/완구',
    address: '경기도 성남시 분당구 판교동 345-67',
    lat: 37.4020952,
    lng: 127.1086228,
    tel: '031-234-5678',
  },
  {
    id: 3,
    name: '수정구 마트',
    category: '마트/슈퍼마켓',
    address: '경기도 성남시 수정구 신흥동 456-78',
    lat: 37.4449168,
    lng: 127.1388684,
    tel: '031-345-6789',
  },
  {
    id: 4,
    name: '중원구 서점',
    category: '교육/서점',
    address: '경기도 성남시 중원구 성남동 789-12',
    lat: 37.43007,
    lng: 127.152245,
    tel: '031-456-7890',
  },
  {
    id: 5,
    name: '분당 스포츠샵',
    category: '레저/스포츠',
    address: '경기도 성남시 분당구 정자동 234-56',
    lat: 37.366804,
    lng: 127.1095589,
    tel: '031-567-8901',
  },
  {
    id: 6,
    name: '성남 약국',
    category: '병원/약국',
    address: '경기도 성남시 수정구 태평동 567-89',
    lat: 37.45023,
    lng: 127.12694,
    tel: '031-678-9012',
  },
  {
    id: 7,
    name: '중원 식품점',
    category: '식품',
    address: '경기도 성남시 중원구 상대원동 678-90',
    lat: 37.43312,
    lng: 127.16953,
    tel: '031-789-0123',
  },
  {
    id: 8,
    name: '분당 의류매장',
    category: '의류/직물',
    address: '경기도 성남시 분당구 야탑동 789-01',
    lat: 37.41103,
    lng: 127.128,
    tel: '031-890-1234',
  },
  {
    id: 9,
    name: '수정구 문화센터',
    category: '문화/예술',
    address: '경기도 성남시 수정구 복정동 890-12',
    lat: 37.46,
    lng: 127.14,
    tel: '031-901-2345',
  },
  {
    id: 10,
    name: '판교 PC방',
    category: '사무기기/PC',
    address: '경기도 성남시 분당구 판교동 901-23',
    lat: 37.398,
    lng: 127.112,
    tel: '031-012-3456',
  },
  {
    id: 11,
    name: '서현 어린이 도서관',
    category: '교육/서점',
    address: '경기도 성남시 분당구 서현동 234-56',
    lat: 37.384,
    lng: 127.123,
    tel: '031-321-4321',
  },
  {
    id: 12,
    name: '정자동 키즈카페',
    category: '문화/예술',
    address: '경기도 성남시 분당구 정자동 345-67',
    lat: 37.37,
    lng: 127.11,
    tel: '031-432-5432',
  },
  {
    id: 13,
    name: '태평동 문구점',
    category: '문구/완구',
    address: '경기도 성남시 수정구 태평동 456-78',
    lat: 37.452,
    lng: 127.127,
    tel: '031-543-6543',
  },
  {
    id: 14,
    name: '야탑 장난감 할인점',
    category: '문구/완구',
    address: '경기도 성남시 분당구 야탑동 567-89',
    lat: 37.411,
    lng: 127.13,
    tel: '031-654-7654',
  },
  {
    id: 15,
    name: '성남동 아동복 매장',
    category: '의류/직물',
    address: '경기도 성남시 중원구 성남동 678-90',
    lat: 37.432,
    lng: 127.15,
    tel: '031-765-8765',
  },
  {
    id: 16,
    name: '신흥동 어린이 병원',
    category: '병원/약국',
    address: '경기도 성남시 수정구 신흥동 789-01',
    lat: 37.445,
    lng: 127.14,
    tel: '031-876-9876',
  },
  {
    id: 17,
    name: '판교 아동 체육센터',
    category: '레저/스포츠',
    address: '경기도 성남시 분당구 판교동 890-12',
    lat: 37.4,
    lng: 127.11,
    tel: '031-987-0987',
  },
  {
    id: 18,
    name: '상대원 식품마트',
    category: '마트/슈퍼마켓',
    address: '경기도 성남시 중원구 상대원동 901-23',
    lat: 37.434,
    lng: 127.17,
    tel: '031-098-1098',
  },
  {
    id: 19,
    name: '복정동 컴퓨터 학원',
    category: '사무기기/PC',
    address: '경기도 성남시 수정구 복정동 123-45',
    lat: 37.462,
    lng: 127.142,
    tel: '031-109-2109',
  },
  {
    id: 20,
    name: '정자 키즈 마트',
    category: '마트/슈퍼마켓',
    address: '경기도 성남시 분당구 정자동 234-56',
    lat: 37.368,
    lng: 127.108,
    tel: '031-210-3210',
  },
];
