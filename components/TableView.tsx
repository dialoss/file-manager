import React, { useEffect, useRef } from 'react';
import { useStoreMulti } from '@/lib/store';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import FileItem from './FileItem';
import { Checkbox } from "@nextui-org/react";

export const COLUMN_SIZES = {
  CHECKBOX: '5%',
  NAME: '45%',
  TYPE: '15%',
  SIZE: '15%',
  CREATED_AT: '30%',
  ACTIONS: '5%',
};

const BASE_ROW_HEIGHT = 200;

const TableView: React.FC = () => {
  let { files: unorderedFiles, loadMore, hasMore, currentZoom, selectedFiles, setSelectedFiles, currentPath } = useStoreMulti('files', 'loadMore', 'hasMore', 'currentZoom', 'selectedFiles', 'setSelectedFiles', 'currentPath')
  const listRef = useRef<List>(null);
  const files = Array.from(new Set(unorderedFiles.map((file: File) => file.id)))
  .map(id => unorderedFiles.find(file => file.id === id));

  const itemCount = hasMore ? files.length + 1 : files.length;
  const isItemLoaded = (index: number) => !hasMore || index < files.length;

  const getRowHeight = () => {
    return currentZoom * BASE_ROW_HEIGHT;
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isSelected = event.target.checked;
    if (isSelected) {
      setSelectedFiles(files);
    } else {
      setSelectedFiles([]);
    }
  };

  const Row = ({ index, style }: any) => {
    const file = files[index];
    if (!file) return null;
    return (
      <div style={style}>
        <FileItem file={file} view="list" />
      </div>
    );
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo(0);
    }
  }, [currentPath]);
  
  return (
    <div className="w-full h-full flex flex-col min-w-[500px]">
      <div className="flex font-medium bg-gray-100 p-2 sticky top-0 z-10 items-center ">
        <div style={{ width: COLUMN_SIZES.CHECKBOX }}>
          <Checkbox
            isSelected={selectedFiles.length === files.length}
            onChange={handleSelectAll}
            aria-label="Select all files"
          />
        </div>
        <div style={{ width: COLUMN_SIZES.NAME }} className="text-left capitalize">Имя</div>
        {/* <div style={{ width: COLUMN_SIZES.TYPE }} className="text-left capitalize">type</div> */}
        <div style={{ width: COLUMN_SIZES.SIZE }} className="text-left capitalize">Размер</div>
        <div style={{ width: COLUMN_SIZES.CREATED_AT }} className="text-left capitalize">Дата создания</div>
      </div>
      <div className="flex-grow">
        <AutoSizer>
          {({ height, width }) => (
            <InfiniteLoader
              isItemLoaded={isItemLoaded}
              itemCount={itemCount}
              loadMoreItems={loadMore}
            >
              {({ onItemsRendered, ref }: { onItemsRendered: (params: any) => void, ref: React.Ref<any> }) => (
                <List
                  height={height}
                  itemCount={itemCount}
                  itemSize={getRowHeight()}
                  onItemsRendered={onItemsRendered}
                  ref={(listInstance) => {
                    ref(listInstance);
                    listRef.current = listInstance;
                  }}
                  width={width}
                >
                  {({ index, style }) => <Row index={index} style={style} />}
                </List>
              )}
            </InfiniteLoader>
          )}
        </AutoSizer>
      </div>
    </div>
  );
};

export default TableView;
