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

export default function MonthlyView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthlyData, setMonthlyData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
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

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setErrorMsg("Please login first.");
          setLoading(false);
          return;
        }

        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const res = await fetch(
          `${API_URL}/api/summary/monthly?year=${year}&month=${month}`,
          { headers }
        );

        const data = await res.json();

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
    setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () =>
    setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="bg-[#444] rounded-lg p-6 border border-[#555] shadow-lg min-h-[600px]">
      {/* Header */}
      <div className="flex justify-center items-center gap-8 mb-10">
        <button
          onClick={handlePrevMonth}
          className="text-2xl text-white hover:text-[#EFB506] transition cursor-pointer"
        >
          <ChevronLeftIcon />
        </button>
        <h2 className="text-xl font-bold text-[#EFB506] uppercase tracking-wider w-[200px] text-center">
          {monthNames[month]} {year}
        </h2>
        <button
          onClick={handleNextMonth}
          className="text-2xl text-white hover:text-[#EFB506] transition cursor-pointer"
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
            <div key={day} className="text-white font-bold mb-4">
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
                <span className="text-white font-semibold text-lg mb-1">
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
