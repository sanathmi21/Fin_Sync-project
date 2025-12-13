import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = ({ type, isDarkMode = true }) => {
  const [dashboardType, setDashboardType] = useState(type || "personal");
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [financialSummary, setFinancialSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalBalance: 0
  });
  const [expensesByCategory, setExpensesByCategory] = useState([]);

  const currentMonthYear = (() => {
    const now = new Date();
    return {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      monthName: now.toLocaleString('default', { month: 'long' })
    };
  })();

  const [currentMonth] = useState(currentMonthYear.monthName);

  useEffect(() => {
    if (type) {
      setDashboardType(type);
      sessionStorage.setItem("dashboardType", type);
    }
  }, [type]);

  useEffect(() => {
    fetchAllData();
  }, [dashboardType]);

  // ✅ FIXED VERSION - Matches your controller exactly
  const fetchAllData = async () => {
    setLoading(true);

    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      // ✅ Get token from localStorage
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("No token found. Please login.");
        setLoading(false);
        return;
      }

      // ✅ Correct URL format: /api/dashboard?year=2025&month=12&type=personal
      const url = `${API_BASE_URL}/dashboard?year=${year}&month=${month}&type=${dashboardType}`;
      
      console.log("📡 Fetching from:", url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log("📥 Response status:", response.status);

      const result = await response.json();
      console.log("📦 Response data:", result);

      if (!response.ok || !result.success) {
        console.error("❌ API Error:", result);
        setLoading(false);
        return;
      }

      const d = result.data;

      // ✅ Set expenses (for counting)
      setExpenses(d.expenses || []);
      setIncomes(d.incomes || []);

      // ✅ Set financial summary
      setFinancialSummary({
        totalIncome: d.totals?.totalIncome || 0,
        totalExpenses: d.totals?.totalExpenses || 0,
        totalBalance: d.totals?.totalBalance || 0
      });

      // ✅ Set categories for pie chart
      setExpensesByCategory(d.categories || []);

      console.log("✅ Dashboard loaded successfully");

    } catch (error) {
      console.error("❌ Dashboard error:", error);
    }

    setLoading(false);
  };

  const formatCurrency = (amount) => {
    return `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const dashboardTitle =
    dashboardType === "business" ? "Business Dashboard" : "Personal Dashboard";

  const pieChartTitle =
    dashboardType === "business"
      ? "Business Expense Distribution"
      : "Personal Expense Distribution";

  const themeColors = {
    bg: isDarkMode ? "bg-black" : "bg-gray-50",
    text: isDarkMode ? "text-white" : "text-gray-900",
    textSecondary: isDarkMode ? "text-zinc-400" : "text-gray-600",
    textTertiary: isDarkMode ? "text-zinc-300" : "text-gray-700",
    cardBg: isDarkMode ? "bg-zinc-900" : "bg-white",
    chartBg: isDarkMode ? "#27272a" : "#ffffff",
    progressBg: isDarkMode ? "bg-zinc-800" : "bg-gray-200",
    pieStroke: isDarkMode ? "#1f1f1f" : "#f3f4f6",
    tooltipBg: isDarkMode ? "#27272a" : "#ffffff",
    tooltipBorder: isDarkMode ? "none" : "1px solid #e5e7eb"
  };



  return (
    <div className={`min-h-screen ${themeColors.bg} ${themeColors.text} p-6 transition-colors duration-300`}>
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{currentMonth}</h1>
        <p className={`${themeColors.textSecondary} mt-2 text-sm`}>{dashboardTitle}</p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Income */}
        <div className={`${themeColors.cardBg} rounded-lg p-6 relative overflow-hidden shadow-lg`}>
          <div className="flex justify-between mb-4">
            <h3 className={`${themeColors.textSecondary}`}>Total Income</h3>
            <TrendingUp className="text-green-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-500">
            {formatCurrency(financialSummary.totalIncome)}
          </p>
          <p className={`${themeColors.textSecondary} text-xs mt-2`}>
            {incomes.length} income entries
          </p>
        </div>

        {/* Expenses */}
        <div className={`${themeColors.cardBg} rounded-lg p-6 relative overflow-hidden shadow-lg`}>
          <div className="flex justify-between mb-4">
            <h3 className={`${themeColors.textSecondary}`}>Total Expenses</h3>
            <TrendingDown className="text-yellow-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-yellow-500">
            {formatCurrency(financialSummary.totalExpenses)}
          </p>
          <p className={`${themeColors.textSecondary} text-xs mt-2`}>
            {expenses.length} expense entries
          </p>
        </div>

        {/* Balance */}
        <div className={`${themeColors.cardBg} rounded-lg p-6 relative overflow-hidden shadow-lg`}>
          <div className="flex justify-between mb-4">
            <h3 className={`${themeColors.textSecondary}`}>Total Balance</h3>
            <Wallet
              className={financialSummary.totalBalance >= 0 ? "text-green-500" : "text-red-500"}
              size={24}
            />
          </div>
          <p
            className={`text-3xl font-bold ${
              financialSummary.totalBalance >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {formatCurrency(financialSummary.totalBalance)}
          </p>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PIE CHART */}
        <div className={`${themeColors.cardBg} rounded-lg p-6 shadow-lg`}>
          <h3 className="text-xl font-bold mb-6 text-center">{pieChartTitle}</h3>

          {expensesByCategory.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={2}
                    stroke={themeColors.pieStroke}
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: themeColors.tooltipBg,
                      border: themeColors.tooltipBorder,
                      borderRadius: "8px",
                      color: isDarkMode ? "#fff" : "#000"
                    }}
                    labelStyle={{ color: isDarkMode ? '#ffffff' : '#000000' }}
                    itemStyle={{ color: isDarkMode ? '#ffffff' : '#000000' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 gap-3 mt-6">
                {expensesByCategory.map((expense, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: expense.color }}
                    />
                    <span className={`text-sm ${themeColors.textTertiary}`}>
                      {expense.name}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-96">
              <p className={themeColors.textSecondary}>No expense data</p>
            </div>
          )}
        </div>

        {/* TOP EXPENSES */}
        <div className={`${themeColors.cardBg} rounded-lg p-6 shadow-lg`}>
          <h3 className="text-xl font-bold mb-6">Top Expenses by Category</h3>

          {expensesByCategory.length > 0 ? (
            <div className="space-y-4">
              {expensesByCategory.map((expense, index) => (
                <div key={index}>
                  <div className="flex justify-between">
                    <span>{expense.name}</span>
                    <span>
                      {formatCurrency(expense.value)} ({expense.percentage}%)
                    </span>
                  </div>

                  <div className={`${themeColors.progressBg} rounded-full h-3 mt-2`}>
                    <div
                      className="h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${expense.percentage}%`,
                        backgroundColor: expense.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <p className={themeColors.textSecondary}>No data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
