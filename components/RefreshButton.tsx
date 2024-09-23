'use client'
import React from 'react';
import { Button } from "@nextui-org/react";
import { IoMdRefresh } from "react-icons/io";
import { useStoreMulti } from '@/lib/store';
import { useWindowSize } from '@/lib/hooks';

export default function RefreshButton() {
    const { refreshFiles } = useStoreMulti('refreshFiles');
    const w = useWindowSize();
    const size = w.width > 600 ? 'md' : 'sm';
  return (
    <Button
      isIconOnly
      color="primary"
      aria-label="Обновить"
      size={size}
      onClick={refreshFiles}
    >
      <IoMdRefresh size={20}/>
    </Button>
  );
}