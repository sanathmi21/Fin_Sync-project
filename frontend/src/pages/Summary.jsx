import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import YearlyView from '../components/YearlyView';
import MonthlyView from '../components/MonthlyView';

const DownloadIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const ChevronLeftIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRightIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

// Function to dynamically load external scripts
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};


//Main Summary Component
export default function Summary() {
  const [viewMode, setViewMode] = useState('monthly'); 
  const [isDownloading, setIsDownloading] = useState(false);
  const [libsLoaded, setLibsLoaded] = useState(false);
  const contentRef = useRef(null);

  // Load html-to-image and jsPDF libraries dynamically
  useEffect(() => {
    const loadLibs = async () => {
      try {
        await loadScript('https://unpkg.com/html-to-image@1.11.11/dist/html-to-image.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        setTimeout(() => {
            if (window.htmlToImage && window.jspdf) {
                setLibsLoaded(true);
            }
        }, 500);
      } catch (err) {
        console.error("Failed to load PDF libs", err);
      }
    };
    loadLibs();
  }, []);

  // PDF Download Handler
  const handleDownloadPDF = async () => {
    const element = contentRef.current;
    if (!element) return;
    setIsDownloading(true);
    try {
      if (!window.htmlToImage || !window.jspdf) throw new Error("Libraries not fully loaded yet.");

      const dataUrl = await window.htmlToImage.toPng(element, { 
        backgroundColor: '#1e1e1e', 
        pixelRatio: 2 
      });

      const { jsPDF } = window.jspdf; 
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => { img.onload = resolve; });

      const imgWidth = img.width;
      const imgHeight = img.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 20;

      pdf.setTextColor(0, 0, 0); 
      pdf.setFontSize(16);
      pdf.text(`My Financial Summary - ${viewMode.toUpperCase()}`, 14, 10);
      pdf.addImage(dataUrl, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${viewMode}_summary.pdf`);

    } catch (error) {
      alert(`Failed to download PDF: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111] text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans pb-10">

      <div className="w-full max-w-[1450px] mx-auto px-6 md:px-10 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6"> 
          <div>
            <h1 className="text-3xl font-bold mt-2 mb-1 text-gray-900 dark:text-white">Summary</h1>
            <h3 className="text-base text-gray-500 dark:text-gray-400">Your Financial Overview</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* View Toggle */}
            <div className="flex bg-white dark:bg-[#222] p-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <button onClick={() => setViewMode('monthly')} className={`px-6 py-2 rounded-md font-semibold text-sm transition-all ${viewMode === 'monthly' ? 'bg-yellow-500 text-black shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#333]'}`}>Monthly</button>
              <button onClick={() => setViewMode('yearly')} className={`px-6 py-2 rounded-md font-semibold text-sm transition-all ${viewMode === 'yearly' ? 'bg-yellow-500 text-black shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#333]'}`}>Yearly</button>
            </div>

            {/* Download Button */}
            <button 
              onClick={handleDownloadPDF} 
              disabled={!libsLoaded || isDownloading}
              className={`flex items-center justify-center gap-2 bg-green-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-green-700 transition-all shadow-md active:scale-95 ${(isDownloading || !libsLoaded) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {/* RepFiDownload with inline DownloadIcon */}
              <DownloadIcon className="w-5 h-5" /> 
              {isDownloading ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="w-full" ref={contentRef} id="summary-content-area">
          {viewMode === 'monthly' ? <MonthlyView /> : <YearlyView />}
        </div>
      </div>
    </div>
  );
}