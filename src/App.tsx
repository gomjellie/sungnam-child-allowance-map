import {
  useState,
  useEffect,
  useRef,
  useMemo,
  TouchEvent,
  MouseEvent,
  startTransition,
} from 'react';
import styled from 'styled-components';
import KakaoMap from './components/KakaoMap';
import StoreFilter from './components/StoreFilter';
import { fetchStores } from './services/storeService';
import { chain, debounce } from 'lodash-es';
import './App.css';
import SearchBar from './components/SearchBar';
import { ToastContainer } from 'react-toastify';

interface Store {
  name: string;
  type: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
}

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
  @media (display-mode: fullscreen) {
    top: env(safe-area-inset-top);
  }
  left: 8px;
  right: 8px;
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
  height: 45dvh;
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
  padding-bottom: 8px;
`;

const StoreCount = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  cursor: grab;
`;

const StoreListContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 4px;
  align-content: start;
  padding-bottom: env(safe-area-inset-bottom);
`;

const StoreCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &[data-selected='true'] {
    background-color: #f0f7ff;
    border-color: #2d64bc;
    box-shadow: 0 2px 8px rgba(45, 100, 188, 0.15);
  }
`;

const StoreName = styled.h3`
  margin: 0;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
`;

const StoreInfo = styled.p`
  color: #666;
  font-size: 11px;
`;

const StoreCategory = styled.span`
  display: inline-block;
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
`;

function App() {
  const stores = useMemo(fetchStores, []);
  const categories = useMemo(
    () => [...new Set(fetchStores().map((store) => store.category))],
    []
  );
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const [storesInBound, setStoresInBound] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStores, setSelectedStores] = useState<Store[] | null>(null);
  const $bottomSheetRef = useRef<HTMLDivElement | null>(null);
  const $storeListRef = useRef<HTMLDivElement | null>(null);
  const containerHeightRef = useRef(45);

  useEffect(() => {
    const handleViewportResize = () => {
      containerHeightRef.current = Number(
        ($bottomSheetRef.current &&
          $bottomSheetRef.current.style.height.replace('dvh', '')) ||
          '45'
      );
    };
    window.visualViewport?.addEventListener('resize', handleViewportResize);
    return () =>
      window.visualViewport?.removeEventListener(
        'resize',
        handleViewportResize
      );
  }, []);

  const handleDragStart = (e: TouchEvent | MouseEvent) => {
    const snapPoints = [10, 45, 90];
    const startY = e.type.includes('mouse')
      ? (e as MouseEvent).clientY
      : (e as TouchEvent).touches[0].clientY;
    // 아래에서 몇 퍼센트에 위치하는지

    const startHeight = containerHeightRef.current;
    const startTime = Date.now();
    const touchPoints = [{ y: startY, time: startTime }];
    const MAX_POINTS = 5; // 최대 기록할 포인트 수

    const handleDrag = (
      moveEvent:
        | MouseEvent
        | TouchEvent
        | globalThis.MouseEvent
        | globalThis.TouchEvent
    ) => {
      const currentY = moveEvent.type.includes('mouse')
        ? (moveEvent as MouseEvent).clientY
        : (moveEvent as TouchEvent).touches[0].clientY;
      const currentTime = Date.now();
      const deltaY = startY - currentY;
      const deltaPercent = (deltaY / window.visualViewport!.height) * 100;
      const newHeight = Math.min(Math.max(startHeight + deltaPercent, 10), 90);

      const $bottomSheet = $bottomSheetRef.current;
      $bottomSheet && ($bottomSheet.style.height = `${newHeight}dvh`);
      containerHeightRef.current = newHeight;

      touchPoints.push({ y: currentY, time: currentTime });
      if (touchPoints.length > MAX_POINTS) {
        touchPoints.shift(); // 가장 오래된 포인트 제거
      }
    };

    const handleDragEnd = () => {
      const $bottomSheet = $bottomSheetRef.current;

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
        // find the closest snap point

        const currentIndex = (() => {
          if (currentHeight < 45) {
            return 0.5;
          }
          return 1.5;
        })();
        const targetIndex = Math.max(
          0,
          Math.min(snapPoints.length - 1, currentIndex + direction * 0.5)
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
      if (!$bottomSheet) return;
      $bottomSheet.style.transition = `height ${transitionDuration}s ease`;
      $bottomSheet.style.height = `${targetPoint}dvh`;
      containerHeightRef.current = targetPoint;

      setTimeout(() => {
        $bottomSheet.style.transition = 'none';
        map?.relayout();
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

  const handleBoundChange = (edges: kakao.maps.LatLngBounds) => {
    const sw = edges.getSouthWest();
    const ne = edges.getNorthEast();

    const bounds = new kakao.maps.LatLngBounds(sw, ne);

    if ($bottomSheetRef.current?.style.height === '90dvh') {
      // 바텀시트가 화면을 가득 채우고 있을때는 이전의 값을 그대로 사용
      return;
    }

    const filtered = chain(stores)
      .filter((store) =>
        bounds.contain(new kakao.maps.LatLng(store.lat, store.lng))
      )
      .sort((a, b) => {
        const centerLat = sw.getLat() + (ne.getLat() - sw.getLat()) / 2;
        const centerLng = sw.getLng() + (ne.getLng() - sw.getLng()) / 2;

        // 거리 계산
        const aDistance =
          Math.pow(centerLat - a.lat, 2) + Math.pow(centerLng - a.lng, 2);
        const bDistance =
          Math.pow(centerLat - b.lat, 2) + Math.pow(centerLng - b.lng, 2);
        return aDistance - bDistance;
      })
      .take(499)
      .value();

    startTransition(() => {
      setStoresInBound(filtered ?? []);
      handleFilter(selectedCategory, searchTerm, filtered);
    });
  };

  const handleFilter = (
    category: string,
    search: string,
    sourceStores?: Store[]
  ) => {
    let result = search ? stores : sourceStores ?? storesInBound;

    // 카테고리 필터링
    if (category !== '전체') {
      result = result.filter((store) => store.category === category);
    }

    // 검색어 필터링
    if (search && search.length > 0) {
      result = result.filter((store) =>
        store.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    startTransition(() => {
      setFilteredStores(result ?? []);
    });
  };

  const _handleSearchChange = (value: string) => {
    startTransition(() => {
      setSearchTerm(value);
      handleFilter(selectedCategory, value);
    });
  };
  const handleSearchChange = debounce(_handleSearchChange, 300);

  const handleCategoryChange = (category: string) => {
    startTransition(() => {
      handleFilter(category, searchTerm);
      setSelectedCategory(category);
      setSelectedStores(null);
    });

    if (map) {
      // https://github.com/JaeSeoKim/react-kakao-maps-sdk/issues/77
      const little = 0.000001;
      // 지도를 살짝 이동시켜 마커 업데이트를 트리거
      map.panBy(0, -little);
    }
    $storeListRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppContainer>
      <ToastContainer position="top-center" autoClose={1000} />
      <MapSection>
        <SearchBarContainer>
          <SearchBar onSearchChange={handleSearchChange} />
        </SearchBarContainer>
        <KakaoMap
          map={map}
          onCreateMap={setMap}
          onBoundChange={handleBoundChange}
          stores={filteredStores}
          selectedStores={selectedStores}
          onSelectStore={(stores) => setSelectedStores(stores)}
        />
      </MapSection>
      <StoreListContainer ref={$bottomSheetRef}>
        <DragHandle
          onTouchStart={handleDragStart}
          onMouseDown={handleDragStart}
        />
        <StoreFilter
          storesInBound={storesInBound}
          selectedCategory={selectedCategory}
          categories={categories}
          onCategoryChange={handleCategoryChange}
        />
        <StoreListHeader
          onTouchStart={handleDragStart}
          onMouseDown={handleDragStart}
        >
          <StoreCount>
            가맹점 {filteredStores.length}개
            {filteredStores.length === 499 ? '+' : ''}
          </StoreCount>
        </StoreListHeader>
        <StoreListContent ref={$storeListRef}>
          {filteredStores.map((store) => (
            <StoreCard
              id={store.name.replace(/[^a-zA-Z0-9가-힣]/g, '_')}
              key={`${store.name}-${store.lat}-${store.lng}`}
              data-selected={selectedStores?.includes(store)}
              onClick={() => {
                setSelectedStores([store]);
                if (map) {
                  const moveLatLng = new window.kakao.maps.LatLng(
                    store.lat,
                    store.lng
                  );
                  // map.setLevel(3); // 지도 확대 레벨 설정
                  map.panTo(moveLatLng);
                }
                const observer = new MutationObserver((_mutations) => {
                  const targetElement = $storeListRef.current?.querySelector(
                    `#${store.name.replace(/[^a-zA-Z0-9가-힣]/g, '_')}`
                  );
                  if (targetElement) {
                    targetElement.scrollIntoView({
                      behavior: 'smooth',
                    });
                    observer.disconnect();
                  }
                });

                if ($storeListRef.current) {
                  observer.observe($storeListRef.current, {
                    childList: true,
                    subtree: true,
                  });
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <StoreName>{store.name}</StoreName>
                <StoreCategory>{store.category}</StoreCategory>
              </div>
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
