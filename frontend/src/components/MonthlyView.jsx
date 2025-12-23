import React, { useState, useEffect } from "react";

const ChevronLeftIcon = () => (
  <svg
    stroke="currentColor"
    fill="none"
    strokeWidth="2"
    viewBox="0 0 24 24"
    strokeLinecap="round"
    strokeLinejoin="round"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    stroke="currentColor"
    fill="none"
    strokeWidth="2"
    viewBox="0 0 24 24"
    strokeLinecap="round"
    strokeLinejoin="round"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

//Main MonthlyView Component
export default function MonthlyView() {
  const [currentDate, setCurrentDate] = useState(new Date()); // Current date state
  const [monthlyData, setMonthlyData] = useState({}); // Data for the month
  const [loading, setLoading] = useState(false); // Loading state
  const [errorMsg, setErrorMsg] = useState(""); // Error message state

  const year = currentDate.getFullYear(); // Current year
  const month = currentDate.getMonth(); // Current month (0-11)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]; 

  const daysInMonth = new Date(year, month + 1, 0).getDate(); // Total days in month
  const firstDayIndex = new Date(year, month, 1).getDay(); // First day of month (0-6, Sun-Sat)
  const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Adjust to make Mon=0, Sun=6

  // Fetch monthly data when year or month changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        const token = localStorage.getItem("token"); // Get token from local storage
        if (!token) {
          setErrorMsg("Please login first.");
          setLoading(false);
          return;
        }

        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"; // Backend URL
       
        // Set up headers with authorization
        const headers = {
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}`, 
        };

        // Fetch monthly summary data
        const res = await fetch(
          `${API_URL}/api/summary/monthly?year=${year}&month=${month + 1}`,
          { headers }
        );

        const data = await res.json(); 
        console.log('Response data:', data);

        if (!res.ok) {
          throw new Error(data.error || "Backend error");
        }

        setMonthlyData(data);
      } catch (error) {
        console.error("Error fetching monthly data:", error);
        setErrorMsg("Failed to load monthly data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year, month]);

  const handlePrevMonth = () =>
    setCurrentDate(new Date(year, month - 1, 1)); // Go to previous month
  const handleNextMonth = () =>
    setCurrentDate(new Date(year, month + 1, 1)); // Go to next month

  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-8 border border-gray-200 dark:border-gray-800 shadow-md min-h-[600px] relative transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-center items-center gap-8 mb-10 ">
        <button
          onClick={handlePrevMonth}
          className="text-2xl hover:text-[#EFB506] transition cursor-pointer text-gray-900 dark:text-white"
        >
          <ChevronLeftIcon />
        </button>
        <h2 className="text-xl font-bold text-[#EFB506] uppercase tracking-wider w-[200px] text-center ">
          {monthNames[month]} {year}
        </h2>
        <button
          onClick={handleNextMonth}
          className="text-2xl hover:text-[#EFB506] transition cursor-pointer text-gray-900 dark:text-white"
        >
          <ChevronRightIcon />
        </button>
      </div>

      {loading && (
        <p className="text-center text-gray-300 mt-10">Loading summary...</p>
      )}
      {errorMsg && (
        <p className="text-center text-red-400 mt-10">{errorMsg}</p>
      )}

      {!loading && !errorMsg && (
        <div className="grid grid-cols-7 text-center">
          {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
            <div key={day} className=" font-bold mb-4 text-gray-900 dark:text-white">
              {day}
            </div>
          ))}

          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24"></div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const data = monthlyData[dayNum];

            return (
              <div
                key={dayNum}
                className="h-24 flex flex-col items-center relative group border-t border-transparent hover:border-[#555]"
              >
                <span className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">
                  {dayNum}
                </span>

                {data && (data.income > 0 || data.expense > 0) && (
                  <div className="bg-[#555] bg-opacity-80 rounded px-2 py-1 text-xs font-bold shadow-md border-l-2 border-[#EFB506]">
                    {data.income > 0 && (
                      <div className="text-[#00B600]">
                        +Rs. {data.income.toLocaleString()}
                      </div>
                    )}
                    {data.expense > 0 && (
                      <div className="text-red-500">
                        -Rs. {data.expense.toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
