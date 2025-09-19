import styled from 'styled-components';
import { Store } from '../services/storeService';
import { useAutoAnimate } from '@formkit/auto-animate/react';

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

const CategoryButton = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  border: none;
  border-radius: 16px;
  background-color: ${(props) => (props.$active ? '#2D64BC' : '#f5f7fa')};
  color: ${(props) => (props.$active ? 'white' : '#666')};
  font-size: 13px;
  font-weight: ${(props) => (props.$active ? '500' : 'normal')};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: ${(props) => (props.$active ? '#2D64BC' : '#eef1f5')};
  }
`;

const StoreFilter = ({
  storesInBound,
  selectedCategory,
  categories,
  onCategoryChange,
}: {
  storesInBound: Store[];
  selectedCategory: string;
  categories: string[];
  onCategoryChange: (category: string) => void;
}) => {
  const [animateParent] = useAutoAnimate();
  
  const handleCategoryClick = (category: string) => {
    onCategoryChange(category);
  };

  const categoriesInStores = storesInBound.map((store) => store.category);

  return (
    <FilterContainer>
      <FilterSection>
        <SectionTitle>카테고리</SectionTitle>
        <CategoryContainer ref={animateParent}>
          <CategoryButton
            $active={selectedCategory === '전체'}
            onClick={() => handleCategoryClick('전체')}
          >
            전체
          </CategoryButton>
          {selectedCategory !== '전체' && !storesInBound.some((s) => s.category === selectedCategory) && (
            <CategoryButton
              $active={true}
              onClick={() => handleCategoryClick('전체')}
            >
              {(() => {
                const count = storesInBound.filter(
                  (store) => store.category === selectedCategory
                ).length;
                return `${selectedCategory}(${count})`;
              })()}
            </CategoryButton>
          )}
          {categories
            .filter((category) => categoriesInStores.includes(category))
            .sort((a, b) => {
              return (
                storesInBound.filter((store) => store.category === b).length -
                storesInBound.filter((store) => store.category === a).length
              );
            })
            .map((category) => (
              <CategoryButton
                key={category}
                $active={selectedCategory === category}
                onClick={() => handleCategoryClick(category)}
                title={category}
              >
                {(() => {
                  const count = storesInBound.filter(
                    (store) => store.category === category
                  ).length;
                  return `${category}(${count})`;
                })()}
                {/* {category}({filteredStores.filter((store) => store.category === category).length > 0 && filteredStores.filter((store) => store.category === category).length}) */}
              </CategoryButton>
            ))}
        </CategoryContainer>
      </FilterSection>
    </FilterContainer>
  );
};

export default StoreFilter;
