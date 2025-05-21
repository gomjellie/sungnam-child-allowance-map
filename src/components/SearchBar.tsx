import { useState, ChangeEvent } from 'react';
import styled from 'styled-components';

const SearchContainer = styled.label`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  padding: 12px 36px 12px 26px; /* 오른쪽 패딩 수정 */
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
  color: black;  
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &:hover {
    color: #333;
  }
`;

const SearchBar = ({
  onSearchChange,
}: {
  onSearchChange: (value: string) => void;
}) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearchChange(value);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    onSearchChange('');
  };

  return (
    <SearchContainer>
      <SearchIcon>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"
            fill="currentColor"
          />
        </svg>
      </SearchIcon>
      <SearchInput
        type="text"
        placeholder="성남시 아동수당 가맹점 이름 또는 주소 검색..."
        value={searchValue}
        onChange={handleSearchChange}
      />
      {searchValue && (
        <ClearButton onClick={handleClearSearch} aria-label="검색어 지우기">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
              fill="currentColor"
            />
          </svg>
        </ClearButton>
      )}
    </SearchContainer>
  );
};

export default SearchBar;
