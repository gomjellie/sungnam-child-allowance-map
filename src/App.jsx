import { useState, useEffect, useRef } from 'react';
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
  top: 24px;
  left: 16px;
  right: 16px;
  z-index: 10;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Footer = styled.footer`
  padding: 15px;
  text-align: center;
  font-size: 14px;
  color: #666;
  background: white;
`;

const StoreListContainer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  background: white;
  border-radius: 20px 20px 0 0;
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
  padding: 0 20px;
  margin-bottom: 12px;
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
  padding: 0 20px 20px;
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
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const $bottomSheetRef = useRef(null);
  const containerHeightRef = useRef(40);

  useEffect(() => {
    const handleViewportResize = () => {
      containerHeightRef.current = Number($bottomSheetRef.current.style.height.replace('dvh', '') || '40');
    };
    window.visualViewport.addEventListener('resize', handleViewportResize);
    return () => window.visualViewport.removeEventListener('resize', handleViewportResize);
  }, []);

  const handleDragStart = (e) => {
    const startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    const startHeight = containerHeightRef.current;
    
    const handleDrag = (moveEvent) => {
      const currentY = moveEvent.type.includes('mouse') ? moveEvent.clientY : moveEvent.touches[0].clientY;
      const deltaY = startY - currentY;
      const deltaPercent = (deltaY / window.visualViewport.height) * 100;
      const newHeight = Math.min(Math.max(startHeight + deltaPercent, 10), 90);

      /** @type {HTMLDivElement} */
      const $bottomSheet = $bottomSheetRef.current;
      $bottomSheet.style.height = `${newHeight}dvh`;
      containerHeightRef.current = newHeight;
    };
    
    const handleDragEnd = () => {
      /** @type {HTMLDivElement} */
      const $bottomSheet = $bottomSheetRef.current;
      $bottomSheet.style.transition = 'height 0.3s ease';
      setTimeout(() => {
        $bottomSheet.style.transition = 'none';
      }, 300);
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDrag);
      document.removeEventListener('touchend', handleDragEnd);
  
      const snapPoints = [10, 40, 90];
      const closestPoint = snapPoints.reduce((prev, curr) => 
        Math.abs(curr - containerHeightRef.current) < Math.abs(prev - containerHeightRef.current) ? curr : prev
      );
      $bottomSheet.style.height = `${closestPoint}dvh`;
      containerHeightRef.current = closestPoint;
    };
    
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDrag, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
  };
  
  // 가맹점 데이터 가져오기
  const getStores = async () => {
    try {
      const storeData = await fetchStores();
      setStores(storeData);
      
      // 카테고리 추출
      const uniqueCategories = [...new Set(storeData.map(store => store.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('가맹점 데이터를 가져오는 중 오류가 발생했습니다:', error);
    }
  };

  useEffect(() => {
    getStores();
  }, []);

  useEffect(() => {
    let result = stores;
    
    // 카테고리 필터링
    if (selectedCategory !== '전체') {
      result = result.filter(store => store.category === selectedCategory);
    }
    
    // 검색어 필터링
    if (searchTerm) {
      result = result.filter(store => 
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredStores(result);
  }, [stores, selectedCategory, searchTerm]);

  return (
    <AppContainer>
      <MapSection>
        <SearchBarContainer>
          <SearchBar onSearchChange={setSearchTerm} />
        </SearchBarContainer>
        <KakaoMap 
          stores={stores} 
          selectedCategory={selectedCategory} 
        />
      </MapSection>
      <StoreListContainer ref={$bottomSheetRef} >
        <DragHandle onTouchStart={handleDragStart} onMouseDown={handleDragStart} />
        <StoreFilter 
          categories={categories}
          onCategoryChange={setSelectedCategory}
        />
        <StoreListHeader onTouchStart={handleDragStart} onMouseDown={handleDragStart}>
          <StoreCount>가맹점 {filteredStores.length}개</StoreCount>
        </StoreListHeader>
        <StoreListContent>
          {filteredStores.map(store => (
            <StoreCard key={store.id}>
              <StoreName>{store.name}</StoreName>
              <StoreCategory>{store.category}</StoreCategory>
              <StoreInfo>{store.address}</StoreInfo>
            </StoreCard>
          ))}
        </StoreListContent>
        <Footer>
          © 2025 성남시 아동수당 가맹점 지도 | 데이터 출처: 신한카드
        </Footer>
      </StoreListContainer>
    </AppContainer>
  )
}

export default App
