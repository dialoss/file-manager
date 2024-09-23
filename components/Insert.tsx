import React from 'react';
import { Button } from "@nextui-org/react";
import { useStore, useStoreMulti } from "@/lib/store";
import { FaPlus } from 'react-icons/fa';


const InsertButton: React.FC = () => {
    const {selectedFiles} = useStoreMulti('selectedFiles')
    
  const handleInsert = () => {
    console.log(selectedFiles);
  };

  return (
    <>
      <Button onClick={handleInsert} size="sm" color="secondary" isIconOnly aria-label="Добавить" startContent={<FaPlus />}>
      </Button>
    </>
  );
};

export default InsertButton;
