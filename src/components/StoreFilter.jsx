import { useState } from 'react';
import styled from 'styled-components';

const FilterContainer = styled.div`
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: transparent;
  padding: 0 16px;
`;

const Title = styled.h2`
  margin: 0;
  color: #333;
  backdrop-filter: blur(2px);
  width: fit-content;
  font-size: 1.1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SectionTitle = styled.h3`
  display: none;
`;

const CategoryContainer = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  touch-action: pan-x;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const CategoryButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 16px;
  background-color: ${props => props.active ? '#2D64BC' : '#f5f7fa'};
  color: ${props => props.active ? 'white' : '#666'};
  font-size: 13px;
  font-weight: ${props => props.active ? '500' : 'normal'};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background-color: ${props => props.active ? '#2D64BC' : '#eef1f5'};
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  padding: 10px 15px 10px 35px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
  background-color: #f5f7fa;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StoreFilter = ({ categories, onCategoryChange }) => {
  const [activeCategory, setActiveCategory] = useState('전체');
  
  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    onCategoryChange(category);
  };

  return (
    <FilterContainer>
      <FilterSection>
        <SectionTitle>카테고리</SectionTitle>
        <CategoryContainer>
          <CategoryButton 
            active={activeCategory === '전체'}
            onClick={() => handleCategoryClick('전체')}
          >
            전체
          </CategoryButton>
          {categories.map((category) => (
            <CategoryButton 
              key={category}
              active={activeCategory === category}
              onClick={() => handleCategoryClick(category)}
              title={category}
            >
              {category}
            </CategoryButton>
          ))}
        </CategoryContainer>
      </FilterSection>
    </FilterContainer>
  );
};

export default StoreFilter;