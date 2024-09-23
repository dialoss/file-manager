import React from 'react';
import { useStoreMulti } from '@/lib/store';
import { Button } from "@nextui-org/react";
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

import { File } from '@/lib/store';

const Sort: React.FC = () => {
  const { sortBy, setSortBy, sortOrder, setSortOrder, refreshFiles } = useStoreMulti('sortBy', 'setSortBy', 'sortOrder', 'setSortOrder', 'refreshFiles')
  const handleSortByChange = (value: keyof File) => {
    setSortBy(value);
    refreshFiles();
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    refreshFiles();
  };

  const sortOptions: Array<{ key: keyof File; label: string }> = [
    { key: 'name', label: 'Имя' },
    { key: 'createdAt', label: 'Дата изменения' },
    { key: 'type', label: 'Тип' },
    { key: 'size', label: 'Размер' },
  ];

  return (
    <div className="flex items-center rounded flex-wrap">
      {sortOptions.map(({ key, label }) => (
        <Button
          key={key}
          size="sm"
          className="rounded-none"
          variant={sortBy === key ? 'solid' : 'ghost'}
          onClick={() => {
            handleSortByChange(key);
            toggleSortOrder();
          }}
        >
          {label} {sortBy === key && (sortOrder === 'asc' ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />)}
        </Button>
      ))}
    </div>
  );
};

export default Sort;
