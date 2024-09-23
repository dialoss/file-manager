'use client'
import React, { useEffect } from 'react';
import { Card, CardBody } from "@nextui-org/react";
import Total from './Total';
import View from './View';
import Zoom from './Zoom';
import Search from './Search';
import Sort from './Sort';
import BreadCrumbs from './BreadCrumbs';
import RefreshButton from './RefreshButton';
import Sidebar from './Sidebar';
import "@/lib/mock"
import InsertButton from './Insert';
import ActionsMenu from './ActionsMenu';
import { authAutodesk } from '@/lib/api/autodesk';

import { useStoreMulti } from '@/lib/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Suspense } from 'react';
import ImageEditor from './ImageEditor';
declare global {
  interface Window {
    fileManager: {
      refreshFiles: () => void;
      upload: (files: File[]) => Promise<File[]>;
    };
  }
}

export default function FileManager() {
  const { initializeFromUrl, refreshFiles } = useStoreMulti('initializeFromUrl', 'refreshFiles');

  useEffect(() => {
    initializeFromUrl();
    refreshFiles();
  }, [initializeFromUrl, refreshFiles]);

  useEffect(() => {
    authAutodesk();

    window.fileManager = {
      refreshFiles: refreshFiles,
      upload: () => new Promise(async resolve => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.oncancel = () => resolve([]);
        input.onchange = () => {
            let files = Array.from(input.files);
            // upload(files).then(uploaded => resolve(uploaded));
        };
        input.click();
    })
    }
}, []);

  return (
    <div className="flex w-full h-full overflow-hidden">
        {/* <ImageEditor /> */}
        <ToastContainer />
      <Sidebar />
      <div className="flex-grow mb-[30px]">
        <div className="flex flex-col h-full w-full">
          <Total />
          <Suspense>
            <BreadCrumbs />
          </Suspense>
          <div className="flex items-center sm:gap-1 gap-4 flex-wrap p-1">
            <Search />
            <InsertButton />
            <Sort />
            <RefreshButton />
            <Zoom />
            <ActionsMenu />
          </div>
          <div className="flex-grow w-full">
            <View />
          </div>
        </div>
      </div>
    </div>
  );
}
