import React, { useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import MonthlyView from '../components/MonthlyView';
import YearlyView from '../components/YearlyView';

export default function Summary() {
  const [viewMode, setViewMode] = useState('monthly'); 

  const handleDownloadPDF = () => {
    console.log(`Downloading ${viewMode} summary...`);
  };

  return (
    <div className="w-full max-w-[1450px] mx-auto px-6 md:px-10 py-6">
      
      {/*Header Section*/}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6"> 
        <div>
          <h1 className="text-3xl font-bold mt-2 mb-1">Summary</h1>
          <h3 className="text-lg text-gray-300">Your Financial Overview</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
          {/* Toggle Buttons */}
          <div className="flex rounded-md overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.5)] w-full sm:w-auto justify-center">
            <button 
              onClick={() => setViewMode('monthly')} 
              className={`px-6 py-2 font-semibold transition-colors cursor-pointer 
                ${viewMode === 'monthly' ? 'bg-[#EFB506] text-[#111]' : 'bg-[#444] text-[#ccc]'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setViewMode('yearly')} 
              className={`px-6 py-2 font-semibold transition-colors cursor-pointer 
                ${viewMode === 'yearly' ? 'bg-[#EFB506] text-[#111]' : 'bg-[#444] text-[#ccc]'}`}
            >
              Yearly
            </button>
          </div>

          {/* Download Button */}
          <button 
            onClick={handleDownloadPDF} 
            className="flex items-center justify-center gap-2 bg-[#00B600] text-white font-semibold px-[18px] py-2 rounded-[7px] w-full sm:w-auto hover:bg-[#125607] cursor-pointer shadow-lg transition-all duration-300 hover:scale-105"
          >
            <FiDownload className="text-xl" /> Download PDF
          </button>
        </div>
      </div>
      
      {/*Conditional Content*/}
      <div className="w-full">
        {viewMode === 'monthly' ? <MonthlyView /> : <YearlyView />}
      </div>

    </div>
  );
}