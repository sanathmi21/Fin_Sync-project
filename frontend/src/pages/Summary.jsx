import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';

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

// Monthly View Component
function MonthlyView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthlyData, setMonthlyData] = useState({}); 
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        try {
          const headers = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const res = await fetch(`${API_URL}/api/summary/monthly?year=${year}&month=${month}`, { headers });
          if (!res.ok) throw new Error("Backend unavailable");
          const data = await res.json();
          setMonthlyData(data);
        } catch (fetchErr) {
          setMonthlyData(generateMonthlyData(daysInMonth));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year, month]);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-md min-h-[600px] transition-colors duration-300">
      <div className="flex justify-center items-center gap-8 mb-10">
        <button onClick={handlePrevMonth} className="text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-500 transition cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#333]">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-gray-800 dark:text-yellow-500 uppercase tracking-wider w-[200px] text-center">
          {monthNames[month]} {year}
        </h2>
        <button onClick={handleNextMonth} className="text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-500 transition cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#333]">
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center">
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
          <div key={day} className="text-xs font-bold text-gray-400 mb-4 tracking-wider">{day}</div>
        ))}
        {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} className="h-28"></div>)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const data = monthlyData[dayNum]; 
          return (
            <div key={dayNum} className="h-28 flex flex-col items-center border border-gray-100 dark:border-[#2a2a2a] relative group hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2">{dayNum}</span>
              {!loading && data && (data.income > 0 || data.expense > 0) && (
                <div className="mt-2 w-full px-1 flex flex-col gap-1">
                  {data.income > 0 && <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold px-1 rounded py-0.5 truncate border border-green-200 dark:border-transparent">+ {data.income.toLocaleString()}</div>}
                  {data.expense > 0 && <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-bold px-1 rounded py-0.5 truncate border border-red-200 dark:border-transparent">- {data.expense.toLocaleString()}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

//Yearly View Componen
function YearlyView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [yearlyData, setYearlyData] = useState([]); 
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const yAxisLabels = [75000,70000, 65000,60000, 55000,50000, 45000, 40000, 35000, 30000, 25000, 20000, 15000, 10000, 5000];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        try {
          const headers = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const res = await fetch(`${API_URL}/api/summary/yearly?year=${year}`, { headers });
          if (!res.ok) throw new Error("Backend unavailable");
          const data = await res.json();
          setYearlyData(data.map((item, index) => ({
            ...item, monthName: monthNames[index], shortName: shortMonthNames[index]
          })));
        } catch (fetchErr) {
          const mocks = generateYearlyData();
          setYearlyData(mocks.map((item, index) => ({
            ...item, monthName: monthNames[index], shortName: shortMonthNames[index]
          })));
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchData();
  }, [year]);

  const handlePrevYear = () => setCurrentDate(new Date(year - 1, 0, 1));
  const handleNextYear = () => setCurrentDate(new Date(year + 1, 0, 1));
  const CHART_MAX_VALUE = 75000; 

  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-8 border border-gray-200 dark:border-gray-800 shadow-md min-h-[600px] relative transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-6">
          <button onClick={handlePrevYear} className="text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-500 transition cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#333]">
            {/* Replaced FiChevronLeft with inline ChevronLeftIcon */}
            <ChevronLeftIcon className="w-8 h-8" />
          </button>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-yellow-500 tracking-widest">{year}</h2>
          <button onClick={handleNextYear} className="text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-500 transition cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#333]">
            {/* Replaced FiChevronRight with inline ChevronRightIcon */}
            <ChevronRightIcon className="w-8 h-8" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-500"></div><span className="text-gray-700 dark:text-gray-300 font-medium">Total Balance</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-600"></div><span className="text-gray-700 dark:text-gray-300 font-medium">Total Expenses</span></div>
        </div>
      </div>

      <div className="flex mt-8 h-[400px] w-full pr-4">
        <div className="flex flex-col justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold pr-4 text-right h-full pb-8 w-20">
          <span className="text-base font-bold mb-2">Rs.</span>
          {yAxisLabels.map(label => (<span key={label}>{label.toLocaleString().replace(/,/g, ' ')}</span>))}
          <span>0</span>
        </div>
        <div className="flex-1 border-l border-b border-gray-300 dark:border-gray-600 flex items-end justify-between px-2 sm:px-6 relative">
          {!loading && yearlyData.map((data, index) => {
            const totalIncomeHeight = Math.min((data.income / CHART_MAX_VALUE) * 100, 100); 
            let expenseHeightPercent = (data.income > 0) ? (data.expense / data.income) * 100 : 0;
            if (expenseHeightPercent > 100) expenseHeightPercent = 100;
            return (
              <div key={index} className="flex flex-col items-center justify-end h-full w-full group relative">
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    <p className="font-bold mb-1">{data.monthName}</p>
                    <p className="text-green-400">Inc: {data.income.toLocaleString()}</p>
                    <p className="text-red-400">Exp: {data.expense.toLocaleString()}</p>
                </div>
                <div className="w-4 sm:w-8 md:w-10 bg-green-500 relative transition-all duration-300 hover:opacity-90 rounded-t-sm" style={{ height: `${totalIncomeHeight}%` }}>
                  <div className="absolute bottom-0 w-full bg-red-600" style={{ height: `${expenseHeightPercent}%` }}></div>
                </div>
                <span className="text-gray-500 dark:text-gray-400 font-medium mt-3 -rotate-90 text-xs tracking-wide absolute -bottom-10">{data.shortName}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- Main Summary Component ---
export default function Summary() {
  const [viewMode, setViewMode] = useState('monthly'); 
  const [isDownloading, setIsDownloading] = useState(false);
  const [libsLoaded, setLibsLoaded] = useState(false);
  const contentRef = useRef(null);

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
              {/* Replaced FiDownload with inline DownloadIcon */}
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