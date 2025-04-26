import { useState, useEffect, useRef, useMemo } from 'react';
import styled from 'styled-components';
import KakaoMap from './components/KakaoMap';
import StoreFilter from './components/StoreFilter';
import { fetchStores } from './services/storeService';
import './App.css';
import SearchBar from './components/SearchBar';

const AppContainer = styled.div`
  width: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  font-family: 'Noto Sans KR', sans-serif;
  position: relative;
  overflow: hidden;
`;

const MapSection = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
`;

const SearchBarContainer = styled.div`
  position: absolute;
  top: 8px;
  left: 16px;
  right: 16px;
  z-index: 10;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Footer = styled.footer`
  padding: 8px;
  height: 24px;
  text-align: center;
  line-height: 1;
  font-size: 12px;
  color: #666;
  background: white;
`;

const StoreListContainer = styled.div`
  position: relative;
  left: 0;
  right: 0;
  background: white;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: flex;
  flex-direction: column;
  touch-action: none;
  bottom: env(safe-area-inset-bottom);
  height: 40dvh;
  max-height: 90dvh;
`;

const DragHandle = styled.div`
  width: 100%;
  padding: 12px 0 28px 0;
  cursor: grabbing;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    width: 40px;
    height: 4px;
    background-color: #ddd;
    border-radius: 2px;
  }
`;

const StoreListHeader = styled.div`
  padding: 16px;
`;

const StoreCount = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const StoreListContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  align-content: start;
`;

const StoreCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const StoreName = styled.h3`
  margin: 0 0 10px 0;
  color: #333;
`;

const StoreInfo = styled.p`
  margin: 5px 0;
  color: #666;
  font-size: 14px;
`;

const StoreCategory = styled.span`
  display: inline-block;
  background-color: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 5px;
`;

function App() {
  const stores = useMemo(fetchStores, []);
  const categories = useMemo(
    () => [...new Set(fetchStores().map((store) => store.category))],
    []
  );
  const [map, setMap] = useState(/** @type {kakao.maps.Map | null} */ (null));
  const [filteredStores, setFilteredStores] = useState(fetchStores);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);
  const $bottomSheetRef = useRef(null);
  const containerHeightRef = useRef(40);

  useEffect(() => {
    const handleViewportResize = () => {
      containerHeightRef.current = Number(
        $bottomSheetRef.current.style.height.replace('dvh', '') || '40'
      );
    };
    window.visualViewport.addEventListener('resize', handleViewportResize);
    return () =>
      window.visualViewport.removeEventListener('resize', handleViewportResize);
  }, []);

  const handleDragStart = (e) => {
    const startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    const startHeight = containerHeightRef.current;
    const startTime = Date.now();
    const touchPoints = [{ y: startY, time: startTime }];
    const MAX_POINTS = 5; // 최대 기록할 포인트 수

    const handleDrag = (moveEvent) => {
      const currentY = moveEvent.type.includes('mouse')
        ? moveEvent.clientY
        : moveEvent.touches[0].clientY;
      const currentTime = Date.now();
      const deltaY = startY - currentY;
      const deltaPercent = (deltaY / window.visualViewport.height) * 100;
      const newHeight = Math.min(Math.max(startHeight + deltaPercent, 10), 90);

      /** @type {HTMLDivElement} */
      const $bottomSheet = $bottomSheetRef.current;
      $bottomSheet.style.height = `${newHeight}dvh`;
      containerHeightRef.current = newHeight;

      touchPoints.push({ y: currentY, time: currentTime });
      if (touchPoints.length > MAX_POINTS) {
        touchPoints.shift(); // 가장 오래된 포인트 제거
      }
    };

    const handleDragEnd = () => {
      /** @type {HTMLDivElement} */
      const $bottomSheet = $bottomSheetRef.current;
      const snapPoints = [10, 40, 90];
      const currentHeight = containerHeightRef.current;

      // 최근 터치 포인트들의 속도 계산
      const velocities = [];
      for (let i = 1; i < touchPoints.length; i++) {
        const deltaY = touchPoints[i].y - touchPoints[i - 1].y;
        const deltaTime = touchPoints[i].time - touchPoints[i - 1].time;
        velocities.push(deltaY / deltaTime); // px/ms
      }

      // 평균 속도 계산
      const avgVelocity =
        velocities.reduce((sum, v) => sum + v, 0) / velocities.length;

      let targetPoint;
      const VELOCITY_THRESHOLD = 0.3; // 속도 임계값 조정 (px/ms)

      if (Math.abs(avgVelocity) > VELOCITY_THRESHOLD) {
        // 빠른 속도로 드래그 했을 때
        const direction = avgVelocity > 0 ? -1 : 1; // 위로 드래그하면 -1, 아래로 드래그하면 1
        const currentIndex = snapPoints.findIndex(
          (point) => point >= currentHeight
        );
        const targetIndex = Math.max(
          0,
          Math.min(snapPoints.length - 1, currentIndex + direction)
        );
        targetPoint = snapPoints[targetIndex];
      } else {
        // 천천히 드래그 했을 때는 가장 가까운 스냅 포인트로
        targetPoint = snapPoints.reduce((prev, curr) =>
          Math.abs(curr - currentHeight) < Math.abs(prev - currentHeight)
            ? curr
            : prev
        );
      }

      // 속도에 따라 transition 시간 조정
      const transitionDuration =
        Math.abs(avgVelocity) > VELOCITY_THRESHOLD ? 0.2 : 0.3;
      $bottomSheet.style.transition = `height ${transitionDuration}s ease`;
      $bottomSheet.style.height = `${targetPoint}dvh`;
      containerHeightRef.current = targetPoint;

      setTimeout(() => {
        $bottomSheet.style.transition = 'none';
      }, transitionDuration * 1000);
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDrag);
      document.removeEventListener('touchend', handleDragEnd);
    };

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDrag, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
  };

  const handleFilter = (category, search) => {
    let result = stores;

    // 카테고리 필터링
    if (category !== '전체') {
      result = result.filter((store) => store.category === category);
    }

    // 검색어 필터링
    if (search) {
      result = result.filter(
        (store) =>
          store.name.toLowerCase().includes(search.toLowerCase()) ||
          store.address.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredStores(result);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    handleFilter(selectedCategory, value);
  };

  const handleCategoryChange = (category) => {
    handleFilter(category, searchTerm);
    setSelectedCategory(category);
    setSelectedStore(null);
    if (map) {
      // https://github.com/JaeSeoKim/react-kakao-maps-sdk/issues/77
      const little = 0.000001;
      // 지도를 살짝 이동시켜 마커 업데이트를 트리거
      map.panBy(-little, -little);
      setTimeout(() => {
        map.panBy(little, little);
      }, 500);
    }
  };

  return (
    <AppContainer>
      <MapSection>
        <SearchBarContainer>
          <SearchBar onSearchChange={handleSearchChange} />
        </SearchBarContainer>
        <KakaoMap
          map={map}
          onCreateMap={setMap}
          stores={filteredStores}
          selectedStore={selectedStore}
          onSelectStore={setSelectedStore}
        />
      </MapSection>
      <StoreListContainer ref={$bottomSheetRef}>
        <DragHandle
          onTouchStart={handleDragStart}
          onMouseDown={handleDragStart}
        />
        <StoreFilter
          categories={categories}
          onCategoryChange={handleCategoryChange}
        />
        <StoreListHeader
          onTouchStart={handleDragStart}
          onMouseDown={handleDragStart}
        >
          <StoreCount>가맹점 {filteredStores.length}개</StoreCount>
        </StoreListHeader>
        <StoreListContent>
          {filteredStores.map((store) => (
            <StoreCard
              key={store.id}
              onClick={() => {
                setSelectedStore(store);
                if (map) {
                  const moveLatLng = new window.kakao.maps.LatLng(
                    store.lat,
                    store.lng
                  );
                  // map.setLevel(3); // 지도 확대 레벨 설정
                  map.panTo(moveLatLng);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <StoreName>{store.name}</StoreName>
              <StoreCategory>{store.category}</StoreCategory>
              <StoreInfo>{store.address}</StoreInfo>
            </StoreCard>
          ))}
          <Footer>
            © 2025 성남시 아동수당 가맹점 지도 | 데이터 출처:{' '}
            <a href="https://www.shinhancard.com/mob/MOBFM204N/MOBFM204R11.shc">
              신한카드
            </a>
          </Footer>
        </StoreListContent>
      </StoreListContainer>
    </AppContainer>
  );
}

export default App;
