import React, { useState, useRef, useEffect } from 'react';
import { useStoreMulti } from '@/lib/store';
import { Divider, Image, Button, ScrollShadow } from "@nextui-org/react";
import prettyBytes from 'pretty-bytes';
import { FaTimes } from 'react-icons/fa';

const Sidebar: React.FC = () => {
  const { selectedFiles } = useStoreMulti('selectedFiles')
  const [isOpen, setIsOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getTotalSize = () => {
    return selectedFiles.reduce((total, file) => total + file.size, 0);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [selectedFiles]);

  if (!isOpen) {
    return (
      <Button
        onClick={toggleSidebar}
        size="sm"
        className="fixed right-0 top-0 m-1 sm:hidden"
      >
        Open Sidebar
      </Button>
    );
  }

  return (
    <div className='min-w-[250px] max-w-[250px]'>
    <div className="w-full h-full relative flex flex-col">
      <Button
        isIconOnly
        startContent={<FaTimes />}
        onClick={toggleSidebar}
        className="absolute right-0 top-0 m-2 z-10"
      />
      <div className="p-4">
        <h2 className="font-bold text-lg">Selected Items</h2>
      </div>
      <Divider />
      <ScrollShadow ref={scrollContainerRef} className="flex-grow overflow-y-auto">
        <div className="p-4">
          {selectedFiles.length === 0 ? (
            <p>No items selected</p>
          ) : (
            <>
              <p>Items selected: {selectedFiles.length}</p>
              <p>Total size: {prettyBytes(getTotalSize())}</p>
              <Divider className="my-2" />
              {selectedFiles.map(file => (
                <div key={file.id} className="mb-2 flex items-center">
                  <Image
                    src={file.thumbnail}
                    alt={file.name}
                    width={40}
                    height={40}
                    className="mr-2 object-cover"
                  />
                  <div>
                    <p className="font-semibold">{file.name}</p>
                    <p className="text-sm text-gray-500">{file.type}</p>
                    <p className="text-sm text-gray-500">{prettyBytes(file.size)}</p>
                    <p className="text-sm text-gray-500">{JSON.stringify(file.context || {})}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </ScrollShadow>
    </div>
  </div>
  );
};

export default Sidebar;
