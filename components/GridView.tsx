import React, { useState, useEffect, useRef } from 'react';
import { useStoreMulti } from '@/lib/store';
import { File } from '@/lib/store';
import { FixedSizeGrid as Grid } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import FileItem from './FileItem';
import { useWindowSize } from '@/lib/hooks';


const GridView: React.FC = () => {
  let { files: unorderedFiles, loadMore, hasMore, currentZoom } = useStoreMulti('files', 'loadMore', 'hasMore', 'currentZoom')
  const [visibleFiles, setVisibleFiles] = useState<File[]>([]);

  const files = Array.from(new Set(unorderedFiles.map((file: File) => file.id)))
  .map(id => unorderedFiles.find(file => file.id === id));

  useEffect(() => {
    setVisibleFiles(files);
  }, [files]);

  const itemCount = hasMore ? visibleFiles.length + 1 : visibleFiles.length;
  const loadMoreItems = hasMore ? loadMore : () => {};
  const isItemLoaded = (index: number) => !hasMore || index < visibleFiles.length;

  // Calculate column count based on zoom
  const getColumnCount = (width: number) => {
    if (width < 600) return 2;
    if (width < 900) return 3;
    if (currentZoom < 1.1) return 6;
    if (currentZoom < 1.2) return 5;
    if (currentZoom < 1.3) return 4;
    if (currentZoom < 1.6) return 3;
    return 2;
  };

  // Calculate row height based on zoom
  const getRowHeight = () => {
    return currentZoom * 200;
  };

  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * getColumnCount(window.innerWidth) + columnIndex;
    if (!isItemLoaded(index)) {
      return <div style={style}>Loading...</div>;
    }
    const file = visibleFiles[index];
    if (!file) return null;
    return (
      <div style={style}>
        <FileItem file={file} view="grid" />
      </div>
    );
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <AutoSizer>
        {({ height, width }) => {
          const columnCount = getColumnCount(width);
          const rowHeight = getRowHeight();
          return (
            <InfiniteLoader
              isItemLoaded={isItemLoaded}
              itemCount={itemCount}
              loadMoreItems={loadMoreItems}
            >
              {({ onItemsRendered, ref }) => (
                <Grid
                  className="grid gap-4"
                  columnCount={columnCount}
                  columnWidth={width / columnCount}
                  height={height}
                  rowCount={Math.ceil(itemCount / columnCount)}
                  rowHeight={rowHeight}
                  width={width}
                  onItemsRendered={({ visibleRowStartIndex, visibleRowStopIndex, visibleColumnStartIndex, visibleColumnStopIndex }) => {
                    const visibleStartIndex = visibleRowStartIndex * columnCount + visibleColumnStartIndex;
                    const visibleStopIndex = visibleRowStopIndex * columnCount + visibleColumnStopIndex;
                    onItemsRendered({
                      visibleStartIndex,
                      visibleStopIndex,
                    });
                  }}
                  ref={ref}
                >
                  {Cell}
                </Grid>
              )}
            </InfiniteLoader>
          );
        }}
      </AutoSizer>
    </div>
  );
};

export default GridView;
