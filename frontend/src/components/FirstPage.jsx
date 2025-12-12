import React from "react";
import { useNavigate } from "react-router-dom";
import { FaMoneyBillWave, FaCheckCircle, FaChartPie, FaCalendarAlt } from "react-icons/fa";

export default function FirstPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full text-white flex flex-col items-center px-4 py-10"
      style={{
        background: `
          linear-gradient(
            135deg,
            #EFB506 0%,      /* upper left - dark yellow */
            #000000 20%,     /* upper middle - black */
            #003300 40%,     /* upper right - dark green */
            #000000 60%,     /* middle area - black */
            #003300 80%,     /* footer left - dark green */
            #000000 90%,     /* footer middle - black */
            #EFB506 100%     /* footer right - dark yellow */
          )
        `,
      }}
    >

      {/* Header Section */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-center">
        <span className="text-[#EFB506]">Penny</span>
        <span className="text-[#00B600]">Pal</span>
      </h1>

      <p className="text-center max-w-2xl text-base sm:text-lg text-gray-300 mb-8">
        Your personal finance companion that helps you track expenses,
        manage budgets, and achieve financial freedom.
      </p>

      {/* Get Started Button to SignIn */}
      <button
        onClick={() => navigate("/signin")}
        className="bg-[#EFB506] hover:bg-[#d7a004] text-black font-semibold px-4 py-2 sm:px-6 sm:py-3 rounded-xl shadow-lg mb-14 transition-all duration-300 hover:scale-105"
      >
        GET STARTED
      </button>

      {/* Features Section - with black rectangle behind cards */}
      <div className="w-full max-w-5xl mb-20 relative">
        {/* Black Rectangle */}
        <div className="absolute top-0 left-0 w-full h-full bg-black rounded-xl z-0"></div>

        {/* Cards Grid */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-8 z-10">

          {/* Track Expenses */}
          <div className="bg-[#1a1f1a] p-6 rounded-xl shadow-md border border-gray-700 flex flex-col transition-all duration-300 hover:scale-105">
            <FaMoneyBillWave className="text-[#EFB506] text-3xl mb-3" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Track Expenses</h3>
            <p className="text-gray-400 text-sm sm:text-base">
              Record daily expenses and high-priority payments with ease.
            </p>
          </div>

          {/* Smart Budgeting */}
          <div className="bg-[#1a1f1a] p-6 rounded-xl shadow-md border border-gray-700 flex flex-col transition-all duration-300 hover:scale-105">
            <FaCheckCircle className="text-[#00B600] text-3xl mb-3" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Smart Budgeting</h3>
            <p className="text-gray-400 text-sm sm:text-base">
              Set monthly income and track your spending against your budget.
            </p>
          </div>

          {/* Visual Insights */}
          <div className="bg-[#1a1f1a] p-6 rounded-xl shadow-md border border-gray-700 flex flex-col transition-all duration-300 hover:scale-105">
            <FaChartPie className="text-[#EFB506] text-3xl mb-3" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Visual Insights</h3>
            <p className="text-gray-400 text-sm sm:text-base">
              Beautiful charts and graphs to understand your spending patterns.
            </p>
          </div>

          {/* Monthly & Yearly Views */}
          <div className="bg-[#1a1f1a] p-6 rounded-xl shadow-md border border-gray-700 flex flex-col transition-all duration-300 hover:scale-105">
            <FaCalendarAlt className="text-[#00B600] text-3xl mb-3" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Monthly & Yearly Views</h3>
            <p className="text-gray-400 text-sm sm:text-base">
              Review your financial journey with detailed monthly and yearly summaries.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="text-center mb-6 px-2">
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">
          Take Control of Your Finances Today
        </h2>
        <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
          Join thousands of users who are already managing their money smarter with PennyPal.
        </p>
      </div>

      {/* Start Your Journey to SignIn */}
      <button
        onClick={() => navigate("/signin")}
        className="bg-[#EFB506] hover:bg-[#d7a004] text-black font-semibold px-4 py-2 sm:px-6 sm:py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
      >
        Start Your Journey
      </button>
    </div>
  );
}