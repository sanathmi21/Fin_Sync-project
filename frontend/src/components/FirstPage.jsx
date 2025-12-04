import React from "react";
import { useNavigate } from "react-router-dom";

export default function FirstPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-linear-to-b from-[#0a0f0a] via-[#0d140d] to-[#111a11] text-white flex flex-col items-center px-4 py-10">

      {/* Header Section */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-center">
        <span className="text-[#EFB506]">Penny</span>
        <span className="text-[#00B600]">Pal</span>
      </h1>

      <p className="text-center max-w-2xl text-base sm:text-lg text-gray-300 mb-8">
        Your personal finance companion that helps you track expenses, manage budgets, and achieve financial freedom.
      </p>

      {/* GET STARTED button → SignIn */}
      <button
        onClick={() => navigate("/signin")}
        className="bg-yellow-500 hover:bg-yellow-600 text-[#000000] font-semibold px-4 py-2 sm:px-6 sm:py-3 rounded-xl shadow-lg mb-14 transition-all duration-300 hover:scale-105 shrink-0 q"
      >
        GET STARTED
      </button>

      {/* Features Section */}
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-20">
        <div className="bg-[#1a1f1a] p-6 rounded-xl shadow-md border border-gray-700 flex flex-col transition-all duration-300 hover:scale-105 shrink-0">
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Track Expenses</h3>
          <p className="text-gray-400 text-sm sm:text-base">Record daily expenses and high-priority payments with ease.</p>
        </div>

        <div className="bg-[#1a1f1a] p-6 rounded-xl shadow-md border border-gray-700 flex flex-col transition-all duration-300 hover:scale-105 shrink-0">
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Smart Budgeting</h3>
          <p className="text-gray-400 text-sm sm:text-base">Set monthly income and track your spending against your budget.</p>
        </div>

        <div className="bg-[#1a1f1a] p-6 rounded-xl shadow-md border border-gray-700 flex flex-col transition-all duration-300 hover:scale-105 shrink-0">
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Visual Insights</h3>
          <p className="text-gray-400 text-sm sm:text-base">Beautiful charts and graphs to understand your spending patterns.</p>
        </div>

        <div className="bg-[#1a1f1a] p-6 rounded-xl shadow-md border border-gray-700 flex flex-col transition-all duration-300 hover:scale-105 shrink-0">
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Monthly & Yearly Views</h3>
          <p className="text-gray-400 text-sm sm:text-base">Review your financial journey with detailed monthly and yearly summaries.</p>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="text-center mb-6 px-2">
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">Take Control of Your Finances Today</h2>
        <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
          Join thousands of users who are already managing their money smarter with PennyPal.
        </p>
      </div>

      {/* Start Your Journey button → SignIn */}
      <button
        onClick={() => navigate("/signin")}
        className="bg-yellow-500 hover:bg-yellow-600 text-[#000000] font-semibold px-4 py-2 sm:px-6 sm:py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 shrink-0"
      >
        Start Your Journey
      </button>
    </div>
  );
}
