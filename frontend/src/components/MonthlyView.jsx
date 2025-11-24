import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function MonthlyView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Helpers
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Mock Data
  const dummyMonthlyData = {
    13: { income: 4500, expense: 2550 },
    14: { income: 0, expense: 1300 },
  };

  return (
    <div className="bg-[#444] rounded-lg p-6 border border-[#555] shadow-lg min-h-[600px]">
      {/* Calendar Header */}
      <div className="flex justify-center items-center gap-8 mb-10">
        <button onClick={handlePrevMonth} className="text-2xl text-white hover:text-[#EFB506] transition cursor-pointer">
          <FiChevronLeft />
        </button>
        <h2 className="text-xl font-bold text-[#EFB506] uppercase tracking-wider w-[200px] text-center">
          {monthNames[month]} {year}
        </h2>
        <button onClick={handleNextMonth} className="text-2xl text-white hover:text-[#EFB506] transition cursor-pointer">
          <FiChevronRight />
        </button>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 text-center">
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
          <div key={day} className="text-white font-bold mb-4">{day}</div>
        ))}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-24"></div>
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const data = dummyMonthlyData[dayNum];
          return (
            <div key={dayNum} className="h-24 flex flex-col items-center relative group border-t border-transparent hover:border-[#555]">
              <span className="text-white font-semibold text-lg mb-1">{dayNum}</span>
              {data && (
                <div className="bg-[#555] bg-opacity-80 rounded px-2 py-1 text-xs font-bold shadow-md border-l-2 border-[#EFB506]">
                  <div className="text-[#00B600]">+Rs. {data.income}</div>
                  <div className="text-red-500">-Rs. {data.expense}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}