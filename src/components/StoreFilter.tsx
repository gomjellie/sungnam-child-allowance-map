import styled from 'styled-components';

const FilterContainer = styled.div`
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: transparent;
  padding: 0 16px;
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

const CategoryButton = styled.button<{ active: boolean }>`
  padding: 6px 12px;
  border: none;
  border-radius: 16px;
  background-color: ${(props) => (props.active ? '#2D64BC' : '#f5f7fa')};
  color: ${(props) => (props.active ? 'white' : '#666')};
  font-size: 13px;
  font-weight: ${(props) => (props.active ? '500' : 'normal')};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: ${(props) => (props.active ? '#2D64BC' : '#eef1f5')};
  }
`;

const StoreFilter = ({
  selectedCategory,
  categories,
  onCategoryChange,
}: {
  selectedCategory: string;
  categories: string[];
  onCategoryChange: (category: string) => void;
}) => {
  const handleCategoryClick = (category: string) => {
    onCategoryChange(category);
  };

  return (
    <FilterContainer>
      <FilterSection>
        <SectionTitle>카테고리</SectionTitle>
        <CategoryContainer>
          <CategoryButton
            active={selectedCategory === '전체'}
            onClick={() => handleCategoryClick('전체')}
          >
            전체
          </CategoryButton>
          {categories.map((category) => (
            <CategoryButton
              key={category}
              active={selectedCategory === category}
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
