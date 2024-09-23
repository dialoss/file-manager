import React, { useState } from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, useDisclosure } from "@nextui-org/react";
import { FaEllipsisV, FaCopy, FaTrash, FaDownload, FaShare, FaFolder, FaUpload } from 'react-icons/fa';
import { useStoreMulti } from '@/lib/store';

import { useWindowSize } from '@/lib/hooks';
const ActionsMenu: React.FC = () => {
  const { selectedFiles, deleteFile, addFile, currentPath, refreshFiles } = useStoreMulti(
    'selectedFiles', 'deleteFile', 'addFile', 'currentPath', 'refreshFiles'
  );
  const [folderName, setFolderName] = useState('Новая папка');
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handle = (action: string) => {
    if (action === 'delete') {
      selectedFiles.forEach(file => deleteFile(file.id));
    }
    if (action === 'create-folder') {
      onOpen();
    }   
  }

  const handleCreateFolder = () => {
    addFile({ name: folderName, type: 'folder', path: currentPath.substring(1) + '/' + folderName }).then(refreshFiles);
    onClose();
    setFolderName('Новая папка');
  }

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = () => {
      let files = Array.from(input.files);
      // upload(files).then(() => setTimeout(refreshFiles, 1000));
    };
    input.click();
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleCreateFolder();
    }
  }

  const w = useWindowSize();
  const size = w.width > 600 ? 'md' : 'sm';

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly aria-label="Действия" size={size}>
            <FaEllipsisV />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Действия">
          <DropdownItem key="upload" startContent={<FaUpload />} onClick={() => handleUpload()} color="primary">
            Загрузить
          </DropdownItem>
          <DropdownItem key="create-folder" startContent={<FaFolder />} onClick={() => handle('create-folder')}>
            Создать папку
          </DropdownItem>
       
          <DropdownItem key="delete" startContent={<FaTrash />} onClick={() => handle('delete')} className="text-danger" color="danger">
            Удалить
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Modal isOpen={isOpen} onClose={onClose} placement="center">
        <ModalContent>
          <ModalHeader>Создать новую папку</ModalHeader>
          <ModalBody>
            <Input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Имя папки"
              onKeyDown={handleKeyDown}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Отмена
            </Button>
            <Button color="primary" onPress={handleCreateFolder}>
              Создать
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ActionsMenu;