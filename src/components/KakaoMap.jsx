import { useEffect, useState } from 'react';
import { Map, MapMarker, MarkerClusterer, CustomOverlayMap } from 'react-kakao-maps-sdk';
import styled from 'styled-components';

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

const InfoWindow = styled.div`
  cursor: text;
  padding: 15px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  min-width: 220px;
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid white;
  }
`;

const InfoTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const InfoCategory = styled.span`
  display: inline-block;
  background-color: #f0f0f0;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 8px;
`;

const InfoAddress = styled.p`
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #666;
`;

const InfoTel = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 5px;
  }
`;

const KakaoMap = ({ stores, selectedCategory }) => {
  const [map, setMap] = useState(null);
  const [filteredStores, setFilteredStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);

  // 성남시 중심 좌표 (대략적인 위치)
  const defaultCenter = {
    lat: 37.4449168,
    lng: 127.1388684,
  };

  useEffect(() => {
    if (stores && stores.length > 0) {
      if (selectedCategory === '전체') {
        setFilteredStores(stores);
      } else {
        setFilteredStores(stores.filter(store => store.category === selectedCategory));
      }
    }
  }, [stores, selectedCategory]);

  return (
    <MapContainer>
      <Map
        center={defaultCenter}
        style={{ width: '100%', height: '100%' }}
        level={5} // 지도 확대 레벨
        onCreate={setMap}
        onClick={() => void setSelectedStore(null)}
      >
        {map && (
          <MarkerClusterer
            averageCenter={true}
            minLevel={5}
          >
            {filteredStores.map((store, index) => (
              <MapMarker
                key={`${store.name}-${index}`}
                position={{ lat: store.lat, lng: store.lng }}
                title={store.name}
                onClick={() => {
                  setSelectedStore(store);
                }}
                image={{
                  src: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                  size: { width: 24, height: 35 },
                }}
              />
            ))}
          </MarkerClusterer>
        )}
        
        {selectedStore && (
          <CustomOverlayMap
            position={{ lat: selectedStore.lat, lng: selectedStore.lng }}
            clickable={true}
            zIndex={10}
          >
              <InfoWindow onClick={(e) => {
                  e.stopPropagation();
                  // 인포윈도우 내부 클릭 시 이벤트 전파 중단
                }}>
                <InfoTitle>{selectedStore.name}</InfoTitle>
                <InfoCategory>{selectedStore.category}</InfoCategory>
                <InfoAddress>{selectedStore.address}</InfoAddress>
                {selectedStore.tel && (
                  <InfoTel>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" fill="currentColor"/>
                    </svg>
                    {selectedStore.tel}
                  </InfoTel>
                )}
                <button 
                  style={{ 
                    position: 'absolute', 
                    top: '5px', 
                    right: '5px', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: '#999'
                  }} 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStore(null);
                  }}
                >
                  ✕
                </button>
              </InfoWindow>
          </CustomOverlayMap>
        )}
      </Map>
    </MapContainer>
  );
};

export default KakaoMap;