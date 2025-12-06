import { useState } from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Dashboard = ({ type = 'personal', isDarkMode = true }) => {
  const [currentMonth] = useState('January');
  
  // Personal Dashboard Data
  const personalFinancialData = {
    totalIncome: 8500,
    totalExpenses: 5200,
    totalBalance: 3300,
    expenses: [
      { name: 'Factory Rent', value: 1560, color: '#00441B', colorLight: '#4ADE80', percentage: 30 },
      { name: 'Employees Salary', value: 780, color: '#006D2C', colorLight: '#34D399', percentage: 15 },
      { name: 'Investment', value: 780, color: '#238845', colorLight: '#10B981', percentage: 15 },
      { name: 'Material Procurement', value: 520, color: '#41AB5D', colorLight: '#059669', percentage: 10 },
      { name: 'Training', value: 520, color: '#74C476', colorLight: '#047857', percentage: 10 },
      { name: 'Maintainence', value: 520, color: '#A1D99B', colorLight: '#065F46', percentage: 10 }
    ]
  };

  // Business Dashboard Data
  const businessFinancialData = {
    totalIncome: 8500,
    totalExpenses: 5200,
    totalBalance: 3300,
    expenses: [
      { name: 'Marketing & Advertising', value: 1040, color: '#1E3A8A', colorLight: '#3B82F6', percentage: 20 },
      { name: 'Office Supplies', value: 780, color: '#7C3AED', colorLight: '#A78BFA', percentage: 15 },
      { name: 'Utilities & Internet', value: 780, color: '#DC2626', colorLight: '#F87171', percentage: 15 },
      { name: 'Software & Subscriptions', value: 780, color: '#EA580C', colorLight: '#FB923C', percentage: 15 },
      { name: 'Travel & Transport', value: 520, color: '#CA8A04', colorLight: '#FDE047', percentage: 10 },
      { name: 'Professional Services', value: 520, color: '#16A34A', colorLight: '#4ADE80', percentage: 10 },
      { name: 'Insurance', value: 520, color: '#0891B2', colorLight: '#22D3EE', percentage: 10 },
      { name: 'Miscellaneous', value: 260, color: '#DB2777', colorLight: '#F472B6', percentage: 5 }
    ]
  };

  // Select data based on type
  const financialData = type === 'business' ? businessFinancialData : personalFinancialData;
  const dashboardTitle = type === 'business' ? 'Business Dashboard' : 'Personal Dashboard';
  const pieChartTitle = type === 'business' 
    ? 'Business Expense Distribution' 
    : 'Pie Chart Layer Presenting Business Expenses';

  const formatCurrency = (amount) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  // Theme colors
  const themeColors = {
    bg: isDarkMode ? 'bg-black' : 'bg-gray-50',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-zinc-400' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-zinc-300' : 'text-gray-700',
    cardBg: isDarkMode ? 'bg-zinc-900' : 'bg-white',
    chartBg: isDarkMode ? '#27272a' : '#ffffff',
    progressBg: isDarkMode ? 'bg-zinc-800' : 'bg-gray-200',
    pieStroke: isDarkMode ? '#1f1f1f' : '#f3f4f6',
    tooltipBg: isDarkMode ? '#27272a' : '#ffffff',
    tooltipBorder: isDarkMode ? 'none' : '1px solid #e5e7eb'
  };

  return (
    <div className={`min-h-screen ${themeColors.bg} ${themeColors.text} p-6 transition-colors duration-300`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{currentMonth}</h1>
        <p className={`${themeColors.textSecondary} mt-2 text-sm`}>{dashboardTitle}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Income Card */}
        <div className={`${themeColors.cardBg} rounded-lg p-6 relative overflow-hidden shadow-lg transition-colors duration-300`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className={`${themeColors.textSecondary} text-sm font-medium`}>Total Income</h3>
            <TrendingUp className="text-green-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-500">
            {formatCurrency(financialData.totalIncome)}
          </p>
          <div className="absolute top-4 right-4 opacity-10">
            <TrendingUp size={80} className="text-green-500" />
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className={`${themeColors.cardBg} rounded-lg p-6 relative overflow-hidden shadow-lg transition-colors duration-300`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className={`${themeColors.textSecondary} text-sm font-medium`}>Total Expenses</h3>
            <TrendingDown className="text-yellow-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-yellow-500">
            {formatCurrency(financialData.totalExpenses)}
          </p>
          <div className="absolute top-4 right-4 opacity-10">
            <TrendingDown size={80} className="text-yellow-500" />
          </div>
        </div>

        {/* Total Balance Card */}
        <div className={`${themeColors.cardBg} rounded-lg p-6 relative overflow-hidden shadow-lg transition-colors duration-300`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className={`${themeColors.textSecondary} text-sm font-medium`}>Total Balance</h3>
            <Wallet className="text-green-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-500">
            {formatCurrency(financialData.totalBalance)}
          </p>
          <div className="absolute top-4 right-4 opacity-10">
            <Wallet size={80} className="text-green-500" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Distribution Pie Chart */}
        <div className={`${themeColors.cardBg} rounded-lg p-6 shadow-lg transition-colors duration-300`}>
          <h3 className="text-xl font-bold mb-6 text-center">{pieChartTitle}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={financialData.expenses}
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
                {financialData.expenses.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={isDarkMode ? entry.color : entry.colorLight}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: themeColors.tooltipBg,
                  border: themeColors.tooltipBorder,
                  borderRadius: '8px',
                  color: isDarkMode ? '#fff' : '#000'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Custom Legend */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            {financialData.expenses.map((expense, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ 
                    backgroundColor: isDarkMode ? expense.color : expense.colorLight
                  }}
                />
                <span className={`text-sm ${themeColors.textTertiary}`}>{expense.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Expenses */}
        <div className={`${themeColors.cardBg} rounded-lg p-6 shadow-lg transition-colors duration-300`}>
          <h3 className="text-xl font-bold mb-6">Top Expenses</h3>
          <div className="space-y-4">
            {financialData.expenses.map((expense, index) => {
              const percentage = (expense.value / financialData.totalExpenses * 100).toFixed(1);
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={themeColors.textTertiary}>{expense.name}</span>
                    <span className={`text-sm ${themeColors.textSecondary}`}>{percentage}%</span>
                  </div>
                  <div className={`w-full ${themeColors.progressBg} rounded-full h-3`}>
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: isDarkMode ? expense.color : expense.colorLight
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;