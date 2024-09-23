import React from 'react';
import { Card, CardBody, CardFooter, Image, Checkbox } from "@nextui-org/react";
import { File } from '@/lib/store';
import { format } from 'date-fns';
import prettyBytes from 'pretty-bytes';
import { useStore } from '@/lib/store';
import { useStoreMulti } from '@/lib/store';
import { FaFolder } from 'react-icons/fa';
import { FileIcon, defaultStyles } from 'react-file-icon';
import { COLUMN_SIZES } from './TableView';

interface FileItemProps {
  file: File;
  view: 'grid' | 'list';
}

const renderFilePreview = (file: File, zoom: number, zoomScale?: number) => {
  let size = Math.max(100, Math.floor(100 * zoom)) * (zoomScale || 1);
  const [thumbnailError, setThumbnailError] = React.useState(false);
  let sizeY = size;
  if (zoom > 1) sizeY += 40;
  if (zoom < 0.4) sizeY -= 50;
  return (
    <div className="w-full h-full">
      {(!file.thumbnail || thumbnailError) && (
        <div className="w-full h-full flex items-center justify-center">
          <div style={{ height: `${sizeY}px`, width: `${size}px` }}>{getFileIcon(file)}</div>
        </div>
      )}
      {file.thumbnail && !thumbnailError && (
        <img
          onDragStart={(e) => e.preventDefault()}
          style={{ height: `${sizeY}px` }}
          src={file.thumbnail}
          alt={file.name}
          className="w-full h-full object-cover bg-white"
          onError={() => setThumbnailError(true)}
        />
      )}
    </div>
  );
};

const formatDate = (date: Date | null) => {
  if (!date) return '';
  return format(date, 'dd.MM.yyyy HH:mm');
};

const formatSize = (size: number) => {
    if (size === 0) return '';
  return prettyBytes(size);
};

const GridItem: React.FC<{ file: File }> = ({ file }) => {
  const { isSelected, handleSelection, handleClick, searchQuery, currentZoom } = useFileItem(file);

  const renderFileDetails = () => (
    <>
      {/* <p className="text-small text-default-500 truncate">{file.type}</p> */}
      <p className="text-small text-default-500 truncate">{formatSize(file.size)}</p>
      <p className="text-small text-default-500 truncate">{formatDate(file.createdAt)}</p>
      {searchQuery && <p className="text-small text-default-500 truncate">{file.path}</p>}
    </>
  );

  return (
    <div className="sm:text-sm  h-full hover:cursor-pointer border" onClick={handleClick}>
      <div className="p-0">
        {renderFilePreview(file, currentZoom, 1.2)}
      </div>
      <div className="p-1 flex flex-wrap gap-1 items-start">
        <div className="flex items-center w-full">
          <Checkbox
            isSelected={isSelected}
            onChange={handleSelection}
            aria-label={`Select ${file.name}`}
            className=""
          />
          <p className="text-md truncate">{file.name}</p>
        </div>
        {renderFileDetails()}
      </div>
    </div>
  );
};

function navigate(file: File) {
    const { setCurrentPath, refreshFiles } = useStore.getState();
    setCurrentPath(file.path === '/' ? '/' + file.name : file.path + '/' + file.name);
    refreshFiles();
}

const useFileItem = (file: File) => {
  const { selectedFiles, toggleSelectedFile, searchQuery, currentZoom } = 
  useStoreMulti('selectedFiles', 'toggleSelectedFile', 'searchQuery', 'currentZoom');
  const isSelected = selectedFiles.some((f: File) => f.id === file.id);

  const handleSelection = (event: React.MouseEvent | React.ChangeEvent<HTMLInputElement>) => {
    if (event.type === 'click') {
    //   if ((event as React.MouseEvent).shiftKey) {
    //     const lastSelectedIndex = selectedFiles.findIndex(f => f.id === selectedFiles[selectedFiles.length - 1]?.id);
    //     const currentIndex = files.findIndex(f => f.id === file.id);
    //     const start = Math.min(lastSelectedIndex, currentIndex);
    //     const end = Math.max(lastSelectedIndex, currentIndex);
    //     const newSelection = selectedFiles.slice(start, end + 1);
    //     newSelection.forEach(f => toggleSelectedFile(f));
    //   }
    }
    if (event.type === 'change') {
      toggleSelectedFile(file);
    }
  };

  const handleClick = (event: React.MouseEvent) => {
    if (file.type === 'folder') {
        event.preventDefault();
        navigate(file);
    } else {
        if ((event as React.MouseEvent).ctrlKey) {
          handleSelection(event);
        } else {
            
        }
    }
  };

  return { isSelected, handleSelection, handleClick, searchQuery, currentZoom };
};
import { FaEllipsisV } from 'react-icons/fa';
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import { FaEdit, FaTrash, FaDownload } from 'react-icons/fa';
import { Button } from "@nextui-org/react";

function removeFile(file: File) {
  const { deleteFile } = useStore.getState();
  deleteFile('/' + file.id);
}

function renameFile(file: File) {
  const { updateFile } = useStore.getState();
  const newName = prompt("Enter new name for the file:", file.name);
  if (newName) {
    updateFile(file.id, { name: newName });
  }
}

function downloadFile(file: File) {
  const link = document.createElement('a');
  link.href = file.url;
  link.download = file.name;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const ListItem: React.FC<{ file: File }> = ({ file }) => {
  const { isSelected, handleSelection, handleClick, searchQuery, currentZoom } = useFileItem(file);
  
  const actions = [
    { icon: <FaEdit />, color: "primary", callback: () => renameFile(file) },
    ...(file.type !== 'folder' ? [{ icon: <FaDownload />, color: "primary", callback: () => downloadFile(file) }] : []),
    { icon: <FaTrash />, color: "danger", callback: () => removeFile(file) }
  ];

  return (
    <div className="sm:text-sm h-full flex items-center p-2 hover:bg-gray-100 hover:cursor-pointer" onClick={handleClick}>
      <Checkbox
        isSelected={isSelected}
        onChange={handleSelection}
        aria-label={`Select ${file.name}`}
        className="mr-2"
      />
      <div className="flex-1 h-full flex items-center overflow-hidden" style={{ width: COLUMN_SIZES.NAME }}>
        <div className="mr-2 flex-shrink-0 relative" style={{ height: `${150 * currentZoom}px`, width: `${150 * currentZoom}px` }}>
          {renderFilePreview(file, currentZoom)}
        </div>
        <div className="flex flex-col">
          <span className="truncate">{file.name}</span>
          {searchQuery && <span className="text-xs text-gray-500 truncate">{file.path}</span>}
        </div>
      </div>
      <div className="truncate px-1" style={{ width: COLUMN_SIZES.SIZE }}>{formatSize(file.size)}</div>
      <div className="truncate px-1" style={{ width: COLUMN_SIZES.CREATED_AT }}>{formatDate(file.createdAt)}</div>
      <div className="relative" style={{ width: COLUMN_SIZES.ACTIONS }}>
        <Popover>
          <PopoverTrigger>
            <Button isIconOnly color="secondary" variant="light" size="md">
              <FaEllipsisV />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex flex-col gap-1">
              {actions.map((action, index) => (
                <Button key={index} className="w-full" isIconOnly color={action.color} variant="light" size="md" onClick={action.callback}>
                  {action.icon}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

const getFileIcon = (file: File) => {
  if (file.type === 'folder') {
    return <FaFolder size="100%" color="orange" />;
  } else {
    const extension = file.name.split('.').pop() || '';
    return <FileIcon extension={extension} {...defaultStyles[extension as keyof typeof defaultStyles]} />;
  }
};
const FileItem: React.FC<FileItemProps> = ({ file, view }) => {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('text/plain', JSON.stringify(file));
  };

  return (
    <div draggable onDragStart={handleDragStart} className="h-full">
      {view === 'grid' ? <GridItem file={file} /> : <ListItem file={file} />}
    </div>
  );
};

export default FileItem;
