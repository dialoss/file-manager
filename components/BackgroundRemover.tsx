import React, { useState, useEffect } from 'react';
import { useStoreMulti } from '@/lib/store';
import imglyRemoveBackground, { preload, Config } from '@imgly/background-removal';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const modelPath = path.join(process.cwd(), 'public', 'ai-models');
const modelUrl = 'https://staticimgly.com/@imgly/background-removal-data/latest/dist/';

const downloadModel = async () => {
  try {
    const response = await axios.get(modelUrl, { responseType: 'arraybuffer' });
    if (!fs.existsSync(modelPath)) {
      fs.mkdirSync(modelPath, { recursive: true });
    }
    fs.writeFileSync(path.join(modelPath, 'model.bin'), response.data);
    console.log('Model downloaded successfully');
  } catch (error) {
    console.error('Error downloading the model:', error);
  }
};

const config: Config = {
  publicPath: '/ai-models/',
  debug: true,
  device: 'gpu',
  proxyToWorker: true,
  model: 'isnet_fp16',
  output: {
    format: 'image/png',
    quality: 0.8,
  },
  progress: (key, current, total) => {
    console.log(`Downloading ${key}: ${current} of ${total}`);
  }
};

const BackgroundRemover: React.FC = () => {
  const { selectedFiles } = useStoreMulti('selectedFiles');
  const [image, setImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  useEffect(() => {
    downloadModel().then(() => {
      preload(config).then(() => {
        console.log("Asset preloading succeeded");
      }).catch(error => {
        console.error("Error preloading assets:", error);
      });
    });

    if (selectedFiles.length > 0) {
      const fileUrl = selectedFiles[0].url;
      fetch(fileUrl)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            setImage(result);
            setOriginalImage(result);
          };
          reader.readAsDataURL(blob);
        })
        .catch(error => console.error('Error downloading the file:', error));
    }
  }, [selectedFiles]);

  const handleRemoveBackground = async () => {
    if (image) {
      try {
        const resultBlob = await imglyRemoveBackground(image, config);
        const resultUrl = URL.createObjectURL(resultBlob);
        setImage(resultUrl);
      } catch (error) {
        console.error('Error removing background:', error);
      }
    }
  };

  const handleRevertChanges = () => {
    setImage(originalImage);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex flex-col items-center justify-center">
      {image && <img src={image} alt="Selected" className="max-w-full max-h-full" />}
      <div className="mt-4">
        <button onClick={handleRemoveBackground} className="mr-2 p-2 bg-blue-500 text-white rounded">Remove Background</button>
        <button onClick={handleRevertChanges} className="p-2 bg-gray-500 text-white rounded">Revert Changes</button>
      </div>
    </div>
  );
};

export default BackgroundRemover;
