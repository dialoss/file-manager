import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import prettyBytes from 'pretty-bytes';
import { getAvailableStorage } from '@/lib/api/google';

const Total: React.FC = () => {
  const total = useStore(state => state.total);
  const files = useStore(state => state.files);
  const [availableStorage, setAvailableStorage] = useState({ limit: 0, usage: 0 });

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  useEffect(() => {
    const fetchStorage = async () => {
      try {
        const storage = await getAvailableStorage();
        setAvailableStorage(storage);
      } catch (error) {
        console.error('Failed to fetch available storage', error);
      }
    };

    fetchStorage();
  }, []);

  return (
    <div className="w-full fixed bottom-0 left-0 p-1 shadow-lg bg-white overflow-x-auto">
        <div className="sm:text-sm flex gap-2 items-center flex-nowrap">
          <p className='whitespace-nowrap'>Folders: {total.folders}</p>
          <p className='whitespace-nowrap'>Files: {total.files}</p>
          <p className='whitespace-nowrap'>Total: {total.folders + total.files}</p>
          <p className='whitespace-nowrap'>Total Size: {prettyBytes(totalSize)}</p>
          <p className='text-red-500 ml-auto whitespace-nowrap'>Used: {prettyBytes(availableStorage.usage)}</p>
          <p className='text-green-500 whitespace-nowrap'>Remaining: {prettyBytes(availableStorage.limit - availableStorage.usage)}</p>
      </div>
    </div>
  );
};

export default Total;
