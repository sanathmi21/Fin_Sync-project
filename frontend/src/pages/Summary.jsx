import React, { useState } from 'react';
import { FiDownload } from 'react-icons/fi';

export default function Summary() {
  const [viewMode, setViewMode] = useState('monthly'); 

  const handleDownloadPDF = () => {
    alert(`Initiating download for ${viewMode} summary...`);
    console.log(`Downloading ${viewMode} summary...`);
  };

  const handleViewChange = (mode) => {
    setViewMode(mode);
  };

  return (
    <div className="w-full max-w-[1450px] mx-auto px-6 md:px-10 py-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6"> 
        
        {/* Title Block */}
        <div>
          <h1 className="text-3xl font-bold mt-2 mb-1">Summary</h1>
          <h3 className="text-lg text-gray-300">Your Financial Overview</h3>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
          
          {/* Toggle Buttons */}
          <div className="flex rounded-md overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.5)] w-full sm:w-auto justify-center">
            <button
              onClick={() => handleViewChange('monthly')}
              className={`px-6 py-2 text-base font-semibold border-none cursor-pointer transition-colors duration-300 w-1/2 sm:w-auto
                ${viewMode === 'monthly' 
                  ? 'bg-[#EFB506] text-[#111]' 
                  : 'bg-[#444] text-[#ccc] hover:bg-[#555]'
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => handleViewChange('yearly')}
              className={`px-6 py-2 text-base font-semibold border-none cursor-pointer transition-colors duration-300 w-1/2 sm:w-auto
                ${viewMode === 'yearly' 
                  ? 'bg-[#EFB506] text-[#111]' 
                  : 'bg-[#444] text-[#ccc] hover:bg-[#555]'
                }`}
            >
              Yearly
            </button>
          </div>

          {/* Download Button */}
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-2 bg-[#00B600] text-white text-base font-semibold px-[18px] py-2 
                       rounded-[7px] shadow-[0_2px_4px_rgba(0,0,0,0.5)] border-none cursor-pointer 
                       transition-all duration-300 hover:bg-[#125607] hover:scale-105 w-full sm:w-auto"
          >
            <FiDownload className="text-xl" /> Download PDF
          </button>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="bg-[#1a1a1a] rounded-lg p-6 min-h-[300px] flex items-center justify-center border border-[#333]">
        {viewMode === 'monthly' ? (
          <p className="text-gray-400 text-lg">Monthly Calendar View (Placeholder)</p>
        ) : (
          <p className="text-gray-400 text-lg">Yearly Chart View (Placeholder)</p>
        )}
      </div>
      
    </div>
  );
}