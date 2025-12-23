import React, { useState, useEffect, useRef } from 'react';

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

export default function YearlyView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [yearlyData, setYearlyData] = useState([]);
  const [loading, setLoading] = useState(false);

  const chartHeight = 400; 
  const steps = 5;
 
  const year = currentDate.getFullYear();
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const shortMonthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // Fetch yearly data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/api/summary/yearly?year=${year}`, { headers });
        if (!res.ok) throw new Error("Backend unavailable");
        const data = await res.json();
        setYearlyData(data.map((item, index) => ({
          ...item,
          monthName: monthNames[index],
          shortName: shortMonthNames[index],
          balance: item.income - item.expense
        })));
      } catch (err) {
        console.error("Failed to fetch yearly data:", err);
        setYearlyData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]);

  const handlePrevYear = () => setCurrentDate(new Date(year - 1, 0, 1));
  const handleNextYear = () => setCurrentDate(new Date(year + 1, 0, 1));

  // Y-axis scaling
  const maxValue = Math.max(...yearlyData.map(d => Math.max(d.income || 0, d.expense || 0)), 1);
  const stepValue = Math.ceil(maxValue / steps / 1000) * 1000; 
  const yAxisLabels = Array.from({ length: steps + 1 }, (_, i) => stepValue * i);

  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-8 border border-gray-200 dark:border-gray-800 shadow-md min-h-[600px] relative transition-colors duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-6">
          <button onClick={handlePrevYear} className="text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-500 transition cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#333]">
            <ChevronLeftIcon className="w-8 h-8" />
          </button>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-yellow-500 tracking-widest">{year}</h2>
          <button onClick={handleNextYear} className="text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-500 transition cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#333]">
            <ChevronRightIcon className="w-8 h-8" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-500"></div><span className="text-gray-700 dark:text-gray-300 font-medium">Total Balance</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-600"></div><span className="text-gray-700 dark:text-gray-300 font-medium">Total Expenses</span></div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex mt-8 pt-4 relative">
        {/* Y-axis */}
        <div className="relative w-20 h-[400px] flex flex-col justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold">
          <span className="text-base font-bold mb-2">Rs.</span>
          {yAxisLabels.map((label, index) => (
            <span 
              key={label} 
              className="absolute right-0 text-gray-500 dark:text-gray-400 text-xs font-semibold"
              style={{ bottom: `${(index / steps) * chartHeight}px` }} 
            >
              {label.toLocaleString().replace(/,/g,' ')}
            </span>
          ))}
        </div>

        {/* Bars */}
        <div className="flex-1 border-l border-b border-gray-300 dark:border-gray-600 flex items-end justify-between px-2 sm:px-6 relative h-[400px]">
          {!loading && yearlyData.map((data, index) => {
            const incomeHeightPx = (data.income / maxValue) * chartHeight;
            const expenseHeightPx = (data.expense / maxValue) * chartHeight;
            const balanceHeightPx = incomeHeightPx - expenseHeightPx;

            return (
              <div key={index} className="flex flex-col items-center justify-end h-full w-full group relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  <p className="font-bold mb-1">{data.monthName}</p>
                  <p className="text-green-400">Bal: {data.balance.toLocaleString()}</p>
                  <p className="text-red-400">Exp: {data.expense.toLocaleString()}</p>
                </div>

                {/* Expense */}
                <div className="w-4 sm:w-8 md:w-10 bg-red-600" style={{ height: `${expenseHeightPx}px` }}></div>

                {/* Balance */}
                <div className="w-4 sm:w-8 md:w-10 bg-green-500 -mt-[1px]" style={{ height: `${balanceHeightPx}px` }}></div>

                <span className="text-gray-500 dark:text-gray-400 font-medium mt-3 -rotate-90 text-xs tracking-wide absolute -bottom-10">
                  {data.shortName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
