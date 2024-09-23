import React from 'react';
import { useStoreMulti } from '@/lib/store';
import { Slider, Button } from "@nextui-org/react";
import { FaList, FaThLarge } from 'react-icons/fa';
import { useWindowSize } from '@/lib/hooks';

const Zoom: React.FC = () => {
  const { currentZoom, setCurrentZoom } = useStoreMulti('currentZoom', 'setCurrentZoom')
  const handleZoomChange = (value: number | number[]) => {
    setCurrentZoom(Array.isArray(value) ? value[0] : value);
  };

  const setListView = () => {
    setCurrentZoom(0.25); // Default zoom for list view
  };

  const setGridView = () => {
    setCurrentZoom(1); // Default zoom for grid view
  };

  const isListView = currentZoom < 1;
  const isGridView = currentZoom >= 1;

  const w = useWindowSize();
  const size = w.width > 600 ? 'md' : 'sm';
  return (
    <div className="flex items-center sm:gap-1 gap-4 ">
      <Slider
        aria-label="Zoom"
        step={0.05}
        maxValue={2}
        minValue={0.1}
        value={currentZoom}
        onChange={handleZoomChange}
        className="w-40" // Increased width
        size={size}
        />
      <Button 
        onClick={setListView} 
        startContent={<FaList />} 
        isIconOnly
        size={size}
        color={isListView ? "primary" : "default"}
      />
      <Button 
        onClick={setGridView} 
        startContent={<FaThLarge />} 
        isIconOnly
        size={size}
        color={isGridView ? "primary" : "default"}
      />
    </div>
  );
};

export default Zoom;
