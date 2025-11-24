import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function YearlyView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();

  const handlePrevYear = () => setCurrentDate(new Date(year - 1, 0, 1));
  const handleNextYear = () => setCurrentDate(new Date(year + 1, 0, 1));

  const yearlyData = [
    { month: 'Jan', income: 0, expense: 0 },
    { month: 'Feb', income: 0, expense: 0 },
    { month: 'Mar', income: 0, expense: 0 },
    { month: 'Apr', income: 0, expense: 0 },
    { month: 'May', income: 0, expense: 0 },
    { month: 'Jun', income: 42000, expense: 38550 },
    { month: 'Jul', income: 0, expense: 0 },
    { month: 'Aug', income: 0, expense: 0 },
    { month: 'Sep', income: 25000, expense: 20000 },
    { month: 'Oct', income: 17000, expense: 15500 },
    { month: 'Nov', income: 0, expense: 0 },
    { month: 'Dec', income: 0, expense: 0 },
  ];

  const CHART_MAX_VALUE = 50000; 
  const yAxisLabels = [50000, 45000, 40000, 35000, 30000, 25000, 20000, 15000, 10000, 5000];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="bg-[#444] rounded-lg p-8 border border-[#555] shadow-lg min-h-[600px] relative">
      
      {/* Chart Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2 top-8">
          <button onClick={handlePrevYear} className="text-3xl text-white hover:text-[#EFB506] transition cursor-pointer"><FiChevronLeft /></button>
          <h2 className="text-3xl font-bold text-[#EFB506] tracking-widest">{year}</h2>
          <button onClick={handleNextYear} className="text-3xl text-white hover:text-[#EFB506] transition cursor-pointer"><FiChevronRight /></button>
        </div>

        {/* Legend */}
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

      {/* Chart Area */}
      <div className="flex mt-16 h-[400px] w-full pr-10">
        {/* Y-Axis */}
        <div className="flex flex-col justify-between text-white font-semibold text-sm pr-4 text-right h-full pb-10 w-[80px]">
          <span className="text-base font-bold mb-2">Rs.</span>
          {yAxisLabels.map(label => (
            <span key={label}>{label.toLocaleString().replace(/,/g, ' ')}</span>
          ))}
          <span></span>
        </div>

        {/* Bars */}
        <div className="flex-1 border-l border-b border-gray-500 flex items-end justify-between px-6 relative">
          {yearlyData.map((data, index) => {
            const totalIncomeHeight = (data.income / CHART_MAX_VALUE) * 100;
            const expenseHeightPercent = data.income > 0 ? (data.expense / data.income) * 100 : 0;
            
            return (
              <div key={index} className="flex flex-col items-center justify-end h-full w-full group relative">
                {/* Bar */}
                <div 
                  className="w-8 md:w-12 bg-[#00B600] relative transition-all duration-300 hover:opacity-90"
                  style={{ height: `${totalIncomeHeight}%` }}
                >
                  {/* Red Overlay */}
                  <div 
                    className="absolute bottom-0 w-full bg-[#D80000]"
                    style={{ height: `${expenseHeightPercent}%` }}
                  ></div>

                  {/* Tooltip */}
                  {data.income > 0 && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-[#222] text-white text-sm rounded p-3 shadow-xl border border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                      <h4 className="font-bold text-lg mb-1">{monthNames[index]}</h4>
                      <div className="text-[#00B600] font-bold">+Rs. {(data.income - data.expense)}</div>
                      <div className="text-[#D80000] font-bold">-Rs. {data.expense}</div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#222]"></div>
                    </div>
                  )}
                </div>
                {/* X-Label */}
                <span className="text-white font-bold mt-4 -rotate-90 text-sm md:text-base tracking-wide absolute -bottom-8">
                  {data.month}
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