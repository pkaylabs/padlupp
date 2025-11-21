import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import logo from '@/assets/frame.png';

const ImageLoader: React.FC = () => {
  return (
    <div className="fixed z-40 inset-0 flex items-center justify-center h-screen bg-white bg-opacity-50 transition-opacity">
      <div className="flex flex-col items-center">
        <img src={logo} alt="Logo" className="w-10 h-8 mb-2 " />
        <FaSpinner className="text-2xl text-primary animate-spin" />
      </div>
    </div>
  );
};

export default ImageLoader;