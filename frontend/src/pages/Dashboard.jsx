import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Dashboard = () => {
  const [currentMonth] = useState('January');
  const [showCongrats, setShowCongrats] = useState(true);
  
  // Sample data - replace with your API calls
  const [financialData] = useState({
    totalIncome: 8500,
    totalExpenses: 5200,
    totalBalance: 3300,
    expenses: [
      { name: 'Factory Rent', value: 1560, color: '#00441B', percentage: 30 },
      { name: 'Employees Salary', value: 780, color: '#006D2C', percentage: 15 },
      { name: 'Investment', value: 780, color: '#238845', percentage: 15 },
      { name: 'Material Procurement', value: 520, color: '#41AB5D', percentage: 10 },
      { name: 'Training', value: 520, color: '#74C476', percentage: 10 },
      { name: 'Maintainence', value: 520, color: '#A1D99B', percentage: 10 }
    ]
  });

  const formatCurrency = (amount) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{currentMonth}</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Income Card */}
        <div className="bg-zinc-900 rounded-lg p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 text-sm font-medium">Total Income</h3>
            <TrendingUp className="text-green-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-500">
            {formatCurrency(financialData.totalIncome)}
          </p>
          <div className="absolute top-4 right-4 opacity-20">
            <TrendingUp size={80} className="text-green-500" />
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-zinc-900 rounded-lg p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 text-sm font-medium">Total Expenses</h3>
            <TrendingDown className="text-yellow-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-yellow-500">
            {formatCurrency(financialData.totalExpenses)}
          </p>
          <div className="absolute top-4 right-4 opacity-20">
            <TrendingDown size={80} className="text-yellow-500" />
          </div>
        </div>

        {/* Total Balance Card */}
        <div className="bg-zinc-900 rounded-lg p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 text-sm font-medium">Total Balance</h3>
            <Wallet className="text-green-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-500">
            {formatCurrency(financialData.totalBalance)}
          </p>
          <div className="absolute top-4 right-4 opacity-20">
            <Wallet size={80} className="text-green-500" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Distribution Pie Chart */}
        <div className="bg-zinc-900 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-6 text-center">Pie Chart Layer Presenting Business Expenses</h3>
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
                stroke="#1f1f1f"
              >
                {financialData.expenses.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke={entry.color === '#FFFFFF' ? '#000000' : entry.color}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: '#27272a', 
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
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
                    backgroundColor: expense.color,
                    border: expense.color === '#FFFFFF' ? '1px solid #666' : 'none'
                  }}
                />
                <span className="text-sm text-zinc-300">{expense.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Expenses */}
        <div className="bg-zinc-900 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-6">Top Expenses</h3>
          <div className="space-y-4">
            {financialData.expenses.map((expense, index) => {
              const percentage = (expense.value / financialData.totalExpenses * 100).toFixed(1);
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-300">{expense.name}</span>
                    <span className="text-sm text-zinc-400">{percentage}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: expense.color
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