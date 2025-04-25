# 성남시 아동수당 가맹점 지도

성남시 내 아동수당을 사용할 수 있는 가맹점들을 지도에서 확인할 수 있는 웹 애플리케이션입니다. 카카오맵 API를 활용하여 가맹점의 위치를 시각적으로 표시하고, 카테고리별 필터링 및 검색 기능을 제공합니다.

## 주요 기능

- 카카오맵을 활용한 가맹점 위치 표시
- 카테고리별 가맹점 필터링
- 가맹점 이름 및 주소 검색
- 마커 클러스터링을 통한 효율적인 지도 표시
- 가맹점 상세 정보 확인

## 설치 및 실행 방법

### 필수 요구사항

- Node.js 14.0.0 이상
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone https://github.com/gomjellie/maps.git
cd maps

# 의존성 설치
npm install
```

### 카카오맵 API 키 설정

1. [Kakao Developers](https://developers.kakao.com/)에서 애플리케이션을 등록하고 JavaScript 키를 발급받습니다.
2. `index.html` 파일에서 `KAKAO_APP_KEY` 부분을 발급받은 API 키로 교체합니다.

```html
<script
  type="text/javascript"
  src="//dapi.kakao.com/v2/maps/sdk.js?appkey=발급받은_API_키&libraries=services,clusterer"
></script>
```

### 개발 서버 실행

```bash
npm run dev
```

## 데이터 소스

현재 이 애플리케이션은 샘플 데이터를 사용하고 있습니다. 실제 운영 환경에서는 `src/services/storeService.js` 파일을 수정하여 실제 API 엔드포인트에서 데이터를 가져오도록 구현해야 합니다.

## 기술 스택

- React
- Vite
- Styled Components
- Kakao Maps SDK
- React Kakao Maps SDK

## 라이센스

MIT

## 기여 방법

1. 이 저장소를 포크합니다.
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다.
