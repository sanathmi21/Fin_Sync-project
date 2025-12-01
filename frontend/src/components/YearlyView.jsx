import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function YearlyView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [yearlyData, setYearlyData] = useState([]); 
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // --- FETCH REAL DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
           console.error("No token found.");
           return;
        }

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        // ADDED AUTH HEADER
        const res = await fetch(`${API_URL}/api/summary/yearly?year=${year}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) throw new Error("Failed to fetch data");

        const data = await res.json();
        
        // Merge DB data with month names
        const formattedData = data.map((item, index) => ({
          ...item,
          monthName: monthNames[index],
          shortName: shortMonthNames[index]
        }));
        setYearlyData(formattedData);
      } catch (error) {
        console.error("Error fetching yearly data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]);

  const handlePrevYear = () => setCurrentDate(new Date(year - 1, 0, 1));
  const handleNextYear = () => setCurrentDate(new Date(year + 1, 0, 1));

  const CHART_MAX_VALUE = 75000; 
  const yAxisLabels = [75000,70000, 65000,60000, 55000,50000, 45000, 40000, 35000, 30000, 25000, 20000, 15000, 10000, 5000];

  return (
    <div className="bg-[#444] rounded-lg p-8 border border-[#555] shadow-lg min-h-[600px] relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2 top-8">
          <button onClick={handlePrevYear} className="text-3xl text-white hover:text-[#EFB506] transition cursor-pointer"><FiChevronLeft /></button>
          <h2 className="text-3xl font-bold text-[#EFB506] tracking-widest">{year}</h2>
          <button onClick={handleNextYear} className="text-3xl text-white hover:text-[#EFB506] transition cursor-pointer"><FiChevronRight /></button>
        </div>
        <div className="ml-auto flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#00B600]"></div>
            <span className="text-white font-bold text-lg">Total Balance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#D80000]"></div>
            <span className="text-white font-bold text-lg">Total Expenses</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex mt-16 h-[400px] w-full pr-10">
        <div className="flex flex-col justify-between text-white font-semibold text-sm pr-4 text-right h-full pb-10 w-[80px]">
          <span className="text-base font-bold mb-2">Rs.</span>
          {yAxisLabels.map(label => (
            <span key={label}>{label.toLocaleString().replace(/,/g, ' ')}</span>
          ))}
          <span></span>
        </div>

        <div className="flex-1 border-l border-b border-gray-500 flex items-end justify-between px-6 relative">
          {!loading && yearlyData.map((data, index) => {
            const totalIncomeHeight = Math.min((data.income / CHART_MAX_VALUE) * 100, 100); 
            let expenseHeightPercent = 0;
            if (data.income > 0) {
                expenseHeightPercent = (data.expense / data.income) * 100;
                if (expenseHeightPercent > 100) expenseHeightPercent = 100;
            }
            
            return (
              <div key={index} className="flex flex-col items-center justify-end h-full w-full group relative">
                <div 
                  className="w-8 md:w-12 bg-[#00B600] relative transition-all duration-300 hover:opacity-90"
                  style={{ height: `${totalIncomeHeight}%` }}
                >
                  <div 
                    className="absolute bottom-0 w-full bg-[#D80000]"
                    style={{ height: `${expenseHeightPercent}%` }}
                  ></div>
                  {data.income > 0 && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-[#222] text-white text-sm rounded p-3 shadow-xl border border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                      <h4 className="font-bold text-lg mb-1">{data.monthName}</h4>
                      <div className="text-[#00B600] font-bold">+Rs. {(data.income - data.expense).toLocaleString()}</div>
                      <div className="text-[#D80000] font-bold">-Rs. {data.expense.toLocaleString()}</div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#222]"></div>
                    </div>
                  )}
                </div>
                <span className="text-white font-bold mt-4 -rotate-90 text-sm md:text-base tracking-wide absolute -bottom-8">
                  {data.shortName}
                </span>
              </div>
            );
          })}
          <span className="absolute -bottom-8 right-0 text-white font-bold text-lg">Month</span>
        </div>
      </div>
    </div>
  );
}