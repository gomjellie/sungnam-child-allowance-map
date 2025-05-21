import { Map, MapMarker, CustomOverlayMap, MarkerClusterer, MarkerClustererProps } from 'react-kakao-maps-sdk';
import styled from 'styled-components';
import { useFloating, offset, flip, shift, arrow, useInteractions, useClick, useDismiss, FloatingArrow } from '@floating-ui/react';

interface Store {
  name: string;
  type: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
}

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

const LocationButton = styled.button`
  position: absolute;
  right: 16px;
  bottom: 8px;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: white;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s ease;
  color: black;

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const InfoWindow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: text;
  padding: 8px;
  background-color: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  width: 220px;
  overflow-y: auto;
  max-height: 300px;
  z-index: 10;
`;

const MarkerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const MarkerLabel = styled.div`
  background-color: transparent;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  font-size: 12px;
  color: white;
  text-align: center;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  & + & {
    border-top: 1px solid #e0e0e0; // 다음 형제가 InfoItem인 경우에만 상단 경계선 표시
    padding-top: 4px;
  }
`;

const InfoTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-right: 8px;
`;

const InfoCategory = styled.span`
  display: inline-block;
  background-color: #f0f0f0;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 10px;
`;

const InfoAddress = styled.div`
  display: -webkit-box;
  margin: 0;
  font-size: 14px;
  color: #666;
  max-width: 200px;
  max-height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
`;

import { useEffect, useState, useRef } from 'react';
import { chain } from 'lodash-es';

// 두 지점 간의 거리를 계산하는 함수 (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // 지구의 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000; // 미터 단위로 변환
};

interface KakaoMapProps {
  map: kakao.maps.Map | null;
  onCreateMap: (map: kakao.maps.Map) => void;
  stores: Store[];
  onBoundChange: (edges: kakao.maps.LatLngBounds) => void;
  selectedStores: Store[] | null;
  onSelectStore: (stores: Store[] | null) => void;
}

const KakaoMap = ({
  map,
  onCreateMap,
  stores,
  selectedStores,
  onSelectStore,
  onBoundChange,
}: KakaoMapProps) => {
  const [zoomLevel, setZoomLevel] = useState<number>(5);
  // 네이버 좌표를 기본으로
  const defaultCenter = {
    lat: 37.3595191509133,
    lng: 127.105220574005,
  };
  const [currentPosition, setCurrentPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Promise로 래핑된 getCurrentPosition 함수
  const getCurrentPositionAsync = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    });
  };

  const makeMeAtCenter = async () => {
    if (!map) return;

    try {
      const position = await getCurrentPositionAsync();
      const moveLatLng = new window.kakao.maps.LatLng(
        position.coords.latitude,
        position.coords.longitude
      );
      setCurrentPosition({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      map.panTo(moveLatLng);
    } catch (error) {
      console.error('위치 정보를 가져오는데 실패했습니다:', error);
      alert('위치 정보를 가져오는데 실패했습니다.');
      // 실패 시 기본 위치로 이동
      map.panTo(
        new window.kakao.maps.LatLng(defaultCenter.lat, defaultCenter.lng)
      );
    }
  };

  const handleLocationClick = async () => {
    if (!map || !navigator.geolocation) return;

    makeMeAtCenter();
  };

  useEffect(() => {
    if (!map) return;
    // 현재 위치를 가져와서 지도 중심으로 설정
    makeMeAtCenter();
  }, [map]); // map이 변경될 때마다 실행

  return (
    <MapContainer>
      <Map
        center={defaultCenter}
        style={{ width: '100%', height: '100%' }}
        level={5} // 지도 확대 레벨
        onCreate={(map) => {
          onCreateMap(map);
        }}
        onIdle={(target) => {
          onBoundChange(target.getBounds());
        }}
        onZoomChanged={(target) => {
          setZoomLevel(target.getLevel());
        }}
        title='map'
        onClick={() => void onSelectStore(null)}
      >
        <LocationButton onClick={handleLocationClick} title="현재 위치로 이동">
          <svg viewBox="0 0 24 24" fill="none" xmlns="//www.w3.org/2000/svg">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="white"
            />
            <circle cx="12" cy="12" r="4" fill="currentColor" />
            <line
              x1="12"
              y1="2"
              x2="12"
              y2="6"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="12"
              y1="18"
              x2="12"
              y2="22"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="2"
              y1="12"
              x2="6"
              y2="12"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="18"
              y1="12"
              x2="22"
              y2="12"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </LocationButton>
        {currentPosition && (
          <MapMarker
            position={currentPosition}
            image={{
              src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI4IiBmaWxsPSIjMzg4MEZGIiBmaWxsLW9wYWNpdHk9IjAuNiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPg==',
              size: { width: 24, height: 24 },
            }}
            // zIndex={20}
          />
        )}
        <Clusterer minLevel={4} zoomLevel={zoomLevel}>
        {chain(stores)
          .thru(stores => {
            const groups: Store[][] = [];
            const processed = new Set<Store>();

            stores.forEach(store => {
              if (processed.has(store)) return;

              const group = [store];
              processed.add(store);

              stores.forEach(otherStore => {
                if (processed.has(otherStore)) return;
                
                const distance = calculateDistance(
                  store.lat, store.lng,
                  otherStore.lat, otherStore.lng
                );

                if (distance <= 15) { // 15미터 이내의 가게들을 그룹화
                  group.push(otherStore);
                  processed.add(otherStore);
                }
              });

              groups.push(group);
            });

            return groups;
          })
          .map((groupedStores) => {
            const representativeStore = groupedStores[0];
            const storeNames = groupedStores
              .map((s) => s.name)
              .join(', ');
            return (
              <CustomOverlayMap
                key={`${representativeStore.name}-${representativeStore.lat}-${representativeStore.lng}`}
                position={{ lat: representativeStore.lat, lng: representativeStore.lng }}
                zIndex={10}
              >
                <MarkerContainer onClick={() => void onSelectStore(groupedStores)}>
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="8" fill="#FFD300" stroke="#FFF" strokeWidth="2"/>
                  </svg>
                  <MarkerLabel title={storeNames}>
                    {representativeStore.name.length > 8 ? `${representativeStore.name.slice(0, 8)}...` : representativeStore.name} {groupedStores.length > 1 ? `외 ${groupedStores.length - 1}개`: ''}
                  </MarkerLabel>
                </MarkerContainer>
              </CustomOverlayMap>
            );
          })
          .value()}
        </Clusterer>

        {selectedStores && selectedStores.length > 0 && (
          <CustomOverlayMap
            position={{
              lat: selectedStores[0].lat,
              lng: selectedStores[0].lng,
            }}
            clickable={true}
            zIndex={11}
          >
            <FloatingInfoWindow 
              selectedStores={selectedStores} 
              onClose={() => onSelectStore(null)} 
            />
          </CustomOverlayMap>
        )}
      </Map>
    </MapContainer>
  );
};

// Floating UI를 사용한 InfoWindow 컴포넌트
const FloatingInfoWindow = ({ selectedStores, onClose }: { selectedStores: Store[], onClose: () => void }) => {
  const arrowRef = useRef(null);
  const { refs, floatingStyles, context } = useFloating({
    middleware: [
      offset(10),
      flip(),
      shift(),
      arrow({ element: arrowRef })
    ]
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context)
  ]);

  return (
    <div ref={refs.setReference} {...getReferenceProps()}>
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        {...getFloatingProps()}
      >
        <InfoWindow onClick={(e) => e.stopPropagation()}>
          <button
            style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#999',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            ✕
          </button>
          {selectedStores.map((selectedStore, index) => (
            <InfoItem key={index}>
              <div style={{ display: 'flex', alignItems: 'center', maxWidth: '200px', overflowX: 'hidden' }}>
                <InfoTitle>{selectedStore.name}</InfoTitle>
                <InfoCategory>{selectedStore.category}</InfoCategory>
              </div>
              <InfoAddress>{selectedStore.address}</InfoAddress>
            </InfoItem>
          ))}
          <FloatingArrow ref={arrowRef} context={context} fill="#FFFFFF" />
        </InfoWindow>
      </div>
    </div>
  );
};

/**
 * MarkerClusterer에 버그가 있어서 확대가 많이 된 경우, MarkerClusterer를 덮지 않고 렌더링함
 */
const Clusterer = ({ children, zoomLevel, ...clustererProps }: { children: React.ReactNode, zoomLevel: number } & MarkerClustererProps) => {
  if (zoomLevel < (clustererProps?.minLevel ?? 4)) {
    return children;
  }

  return <MarkerClusterer {...clustererProps}>{children}</MarkerClusterer>
}

export default KakaoMap;
