import React, { useState } from 'react';
import { useStoreMulti } from '@/lib/store';
import GridView from './GridView';
import TableView from './TableView';
import { Spinner } from "@nextui-org/react";


const View: React.FC = () => {
  const { currentZoom, isLoading, refreshFiles } = useStoreMulti('currentZoom', 'isLoading', 'refreshFiles')
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files);
    // upload(files).then(() => setTimeout(refreshFiles, 1000))
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className={`w-screen h-full z-10 relative overflow-x-auto ${isDragging ? 'bg-gray-200' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center z-[1]">
          <div className="bg-white p-4 rounded shadow-md">
            Отпустите чтобы загрузить
          </div>
        </div>
      )}
      {currentZoom < 1 ? (
        <TableView />
      ) : (
        <GridView />
      )}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      )}
    </div>
  );
};

export default View;
