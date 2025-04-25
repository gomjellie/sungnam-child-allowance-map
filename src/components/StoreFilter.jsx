import { useState } from 'react';
import styled from 'styled-components';

const FilterContainer = styled.div`
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: transparent;
  padding: 16px;
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
  padding: 4px 0;
  scrollbar-width: none;
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

const StoreFilter = ({ categories, onCategoryChange, onSearchChange }) => {
  const [activeCategory, setActiveCategory] = useState('전체');
  const [searchValue, setSearchValue] = useState('');
  
  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    onCategoryChange(category);
  };
  
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearchChange(value);
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
      
      <FilterSection>
        <SectionTitle>검색</SectionTitle>
        <SearchContainer>
          <SearchIcon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
            </svg>
          </SearchIcon>
          <SearchInput 
            type="text" 
            placeholder="가맹점 이름 또는 주소 검색..."
            value={searchValue}
            onChange={handleSearchChange}
          />
        </SearchContainer>
      </FilterSection>
    </FilterContainer>
  );
};

export default StoreFilter;