import React, { useState, useEffect } from 'react';
import { useStoreMulti } from '@/lib/store';
import { ReactPhotoEditor } from 'react-photo-editor';

const ImageEditor: React.FC = () => {
  const { selectedFiles } = useStoreMulti('selectedFiles');
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (selectedFiles.length > 0) {
      const fileUrl = selectedFiles[0].url;
      fetch(fileUrl)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = (e) => {
            setImage(e.target?.result as string);
          };
          reader.readAsDataURL(blob);
        })
        .catch(error => console.error('Error downloading the file:', error));
    }
  }, [selectedFiles]);
  return (
    <div className="fixed top-0 left-0 w-full h-full">
      {image && (
        <ReactPhotoEditor
          file={new File([image], "editedImage.png")}
          onSaveImage={(editedImage: File) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              setImage(e.target?.result as string);
            };
            reader.readAsDataURL(editedImage);
          }}
        />
      )}
    </div>
  );
};

export default ImageEditor;
