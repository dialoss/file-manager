import React, { useCallback } from 'react';
import { Input, Checkbox } from "@nextui-org/react";
import debounce from 'lodash/debounce';
import { useStoreMulti } from '@/lib/store';
import { useWindowSize } from '@/lib/hooks';
const Search = () => {
  const { searchQuery, setSearchQuery, refreshFiles, searchInCurrentFolder, setSearchInCurrentFolder } = useStoreMulti(
    'searchQuery', 'setSearchQuery', 'refreshFiles', 'searchInCurrentFolder', 'setSearchInCurrentFolder'
  );

  const debouncedSetSearchQuery = debounce((value: string) => {
    setSearchQuery(value);
    refreshFiles();
  }, 300);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    debouncedSetSearchQuery(value);
  };

  const handleCheckboxChange = (isSelected: boolean) => {
    setSearchInCurrentFolder(isSelected);
    refreshFiles();
  };

  const w = useWindowSize();
  const size = w.width > 600 ? 'md' : 'sm';

  return (
    <div className="flex items-center gap-2">
      <Input
        className="w-full max-w-[150px]"
        type="text"
        placeholder="Поиск файлов..."
        value={searchQuery}
        size={size}
        onChange={handleSearchChange}
        aria-label="Поиск"
        isClearable
        onClear={() => {
          setSearchQuery('');
          refreshFiles();
        }}
      />
      <Checkbox
        isSelected={searchInCurrentFolder}
        onValueChange={handleCheckboxChange}
      >
        Текущая
      </Checkbox>
    </div>
  );
};

export default Search;