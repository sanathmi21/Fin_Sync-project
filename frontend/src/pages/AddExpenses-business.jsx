// frontend/src/pages/AddExpenses-business.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  X,
  CheckCircle
} from 'lucide-react';

// Helper function to get current month/year
const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    month: now.getMonth(), 
    year: now.getFullYear(),
    monthName: now.toLocaleString('default', { month: 'long' })
  };
};

// Check if two month/year objects are equal
const isSameMonthYear = (a, b) => {
  return a.month === b.month && a.year === b.year;
};

// Format currency function
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2
  }).format(amount || 0);
};


const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6"></path>
    <path d="M1 20v-6h6"></path>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const TrendingDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
    <polyline points="17 18 23 18 23 12"></polyline>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

export default function AddExpenses() {
  // Get ACTUAL current month/year
  const actualCurrentMonthYear = getCurrentMonthYear();

  // Track current viewing month - START with actual current month
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCurrentMonth, setIsCurrentMonth] = useState(true);

  // Add month navigation state
  const [currentView, setCurrentView] = useState({
    month: actualCurrentMonthYear.month,
    year: actualCurrentMonthYear.year,
    monthName: actualCurrentMonthYear.monthName
  });

  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [incForm, setIncForm] = useState({ date: '', unitAmount: '', quantity: '1' });
  const [expForm, setExpForm] = useState({ date: '', category: '', name: '', amount: '' });

  const [loading, setLoading] = useState(false);

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  // Add search states
  const [incomeSearchTerm, setIncomeSearchTerm] = useState('');
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('');

  // Add reset state
  const [resetting, setResetting] = useState(false);

  const totalIncAmount = (Number(incForm.unitAmount) || 0) * (Number(incForm.quantity) || 0);

  const API_URL = import.meta.env.VITE_API_URL;

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    // Use template literal or concatenation so token is inserted correctly
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // helper to read error responses
  const parseJsonSafe = async (res) => {
    try { return await res.json(); } catch { return null; }
  };

  // ------------------ FETCH DATA ------------------
  const fetchData = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth(); // server expects 0-based + 1 internally
      const res = await fetch(`${API_URL}/api/transactions/monthly?year=${year}&month=${month}`, {
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        const err = await parseJsonSafe(res);
        console.error("Failed fetch monthly:", res.status, err);
        setIncomes([]);
        setExpenses([]);
        return;
      }

      const data = await res.json();
      if (data.incomes) setIncomes(data.incomes);
      if (data.expenses) setExpenses(data.expenses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ------------------ FETCH TOTALS ------------------
  const fetchTotals = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth(); // 0-based
      const res = await fetch(`${API_URL}/api/transactions/totals?year=${year}&month=${month}`, { headers: getAuthHeaders() });

      if (!res.ok) {
        const err = await parseJsonSafe(res);
        console.error("Failed fetch totals:", res.status, err);
        setTotalIncome(0);
        setTotalExpense(0);
        return;
      }
      const data = await res.json();
      setTotalIncome(Number(data.totalIncome) || 0);
      setTotalExpense(Number(data.totalExpense) || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchTotals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  // ------------------ INCOME ------------------
  const handleAddIncome = async () => {
    if (!incForm.date || !incForm.unitAmount) return;

    const payload = {
      date: incForm.date,
      unitAmount: Number(incForm.unitAmount),
      quantity: Number(incForm.quantity) || 1
    };

    try {
      const res = await fetch(`${API_URL}/api/transactions/income`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const body = await parseJsonSafe(res);

      if (!res.ok) {
        console.error("Add income failed:", res.status, body);
        return;
      }

      // backend responds with inserted object having id, date, unit, qty, amount
      if (body && body.id) {
        setIncomes(prev => [body, ...prev]);
        setIncForm({ date: '', unitAmount: '', quantity: '1' });
        fetchData();
        fetchTotals();
      }
    } catch (err) {
      console.error("Add Income Failed", err);
    }
  };

  // ------------------ EXPENSE ------------------
  const handleAddExpense = async () => {
    if (!expForm.date || !expForm.amount || !expForm.name) return;

    const payload = {
      date: expForm.date,
      category: expForm.category || null,
      name: expForm.name,
      amount: Number(expForm.amount)
    };

    try {
      const res = await fetch(`${API_URL}/api/transactions/expense`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const body = await parseJsonSafe(res);

      if (!res.ok) {
        console.error("Add expense failed:", res.status, body);
        return;
      }

      if (body && body.id) {
        setExpenses(prev => [body, ...prev]);
        setExpForm({ date: '', category: '', name: '', amount: '' });
        fetchData();
        fetchTotals();
      }
    } catch (err) {
      console.error("Add Expense Failed", err);
    }
  };

  // ------------------ DELETE ------------------
  const handleDelete = async (type, id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/api/transactions/${type}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        const body = await parseJsonSafe(res);
        console.error("Delete failed:", res.status, body);
        return;
      }

      if (type === 'income') setIncomes(prev => prev.filter(i => i.id !== id));
      else setExpenses(prev => prev.filter(e => e.id !== id));
      fetchTotals();
    } catch (err) {
      console.error("Delete Failed", err);
    }
  };

  // Navigate to previous month  
  const goToPreviousMonth = () => {
    const current = new Date(currentView.year, currentView.month - 1);
    const newMonthYear = {
      month: current.getMonth(),
      year: current.getFullYear(),
      monthName: current.toLocaleString('default', { month: 'long' })
    };
    setCurrentView(newMonthYear);
    setCurrentDate(current);
  };

  // Navigate to next month (up to current month)
  const goToNextMonth = () => {
    const now = new Date();
    const nextMonth = new Date(currentView.year, currentView.month + 1);
    
    // Check if next month would be beyond current month
    if (nextMonth > now) return;
    
    const newMonthYear = {
      month: nextMonth.getMonth(),
      year: nextMonth.getFullYear(),
      monthName: nextMonth.toLocaleString('default', { month: 'long' })
    };
    setCurrentView(newMonthYear);
    setCurrentDate(nextMonth);
  };

  // Open reset confirmation
  const openResetModal = () => {
    if (window.confirm(`Reset to current month (${actualCurrentMonthYear.monthName} ${actualCurrentMonthYear.year})? This will update all data to show current month.`)) {
      handleResetMonth();
    }
  };

  // Handle month reset
  const handleResetMonth = () => {
    setResetting(true);
    
    setTimeout(() => {
      setCurrentView(actualCurrentMonthYear);
      setCurrentDate(new Date());
      setIsCurrentMonth(true);
      setResetting(false);
      
      // Reset data
      setIncomes([]);
      setExpenses([]);
      
      // Fetch new month data
      fetchData();
      fetchTotals();
    }, 500);
  };

  // Filter incomes based on search term
  const filteredIncomes = useMemo(() => {
    if (!incomeSearchTerm) return incomes;
    
    return incomes.filter(income => {
      // Search in date or amount
      const dateStr = new Date(income.date).toLocaleDateString();
      const amountStr = Number(income.amount).toString();
      return dateStr.includes(incomeSearchTerm) || 
             amountStr.includes(incomeSearchTerm);
    });
  }, [incomes, incomeSearchTerm]);

  // Filter expenses based on search term
  const filteredExpenses = useMemo(() => {
    if (!expenseSearchTerm) return expenses;
    
    return expenses.filter(expense => {
      // Search in date, category, name, or amount
      const dateStr = new Date(expense.date).toLocaleDateString();
      const amountStr = Number(expense.amount).toString();
      return dateStr.includes(expenseSearchTerm) || 
             (expense.category && expense.category.toLowerCase().includes(expenseSearchTerm.toLowerCase())) ||
             (expense.name && expense.name.toLowerCase().includes(expenseSearchTerm.toLowerCase())) ||
             amountStr.includes(expenseSearchTerm);
    });
  }, [expenses, expenseSearchTerm]);



  

  // Update isCurrentMonth when currentView changes
  useEffect(() => {
    const isCurrent = isSameMonthYear(currentView, actualCurrentMonthYear);
    setIsCurrentMonth(isCurrent);
  }, [currentDate, currentView, actualCurrentMonthYear]);

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  




  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111] text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans pb-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 mt-8 flex flex-col gap-8">
        {/* SUMMARY */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-md relative">
          
          <div className="flex justify-between items-center mb-6">
            {/* Prev Button */}
            <button
              onClick={goToPreviousMonth}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333] transition-all duration-300 group"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Prev</span>
            </button>

            {/* Next Button */}
            <button
              onClick={goToNextMonth}
              disabled={isCurrentMonth}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-all duration-300 group ${
                isCurrentMonth
                  ? 'bg-gray-100 dark:bg-[#222] text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333]'
              }`}
              title={isCurrentMonth ? "Already at current month" : "Next month"}
            >
              <span className="text-sm font-medium">Next</span>
              <ChevronRight className={`w-4 h-4 ${!isCurrentMonth ? 'group-hover:translate-x-0.5 transition-transform' : ''}`} />
            </button>
          </div>

          <div className="flex flex-col items-center mb-6">
            <div className="flex flex-col items-center mb-2">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
                  {currentView.monthName} {currentView.year}
                </h2>
                {isCurrentMonth ? (
                  <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 text-green-700 dark:text-green-300 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Current</span>
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>History</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center mb-4">
                {isCurrentMonth 
                  ? "Track current month transactions" 
                  : `Viewing historical data (Read Only)`
                }
              </p>
            </div>

            {/* Reset Button */}
            <div className="flex justify-center">
              {!isCurrentMonth && (
                <button
                  onClick={openResetModal}
                  disabled={resetting}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-700 dark:to-gray-800 text-white hover:from-gray-900 hover:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all duration-300 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm group"
                  title="Reset to current month"
                >
                  {resetting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                      <span>Reset to Current</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[26px] font-medium text-gray-600 dark:text-green-300">Total Income</div>
                <div className="p-1.5 rounded bg-green-100 dark:bg-green-900/30">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                Rs. {totalIncome.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {filteredIncomes.length} items
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[26px] font-medium text-gray-600 dark:text-amber-300">Total Expenses</div>
                <div className="p-1.5 rounded bg-amber-100 dark:bg-amber-900/30">
                  <TrendingDown className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
              <div className="text-xl font-bold text-yellow-600 dark:text-yellow-500">
                Rs. {totalExpense.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {filteredExpenses.length} items
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border transition-colors ${
              (totalIncome - totalExpense) >= 0 
                ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-100 dark:border-blue-800/30'
                : 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-100 dark:border-red-800/30'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[26px] font-medium text-gray-600 dark:text-gray-300">Balance</div>
                <div className={`p-1.5 rounded ${
                  (totalIncome - totalExpense) >= 0 
                    ? 'bg-blue-100 dark:bg-blue-900/30' 
                    : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {(totalIncome - totalExpense) >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>
              <div className={`text-xl font-bold ${
                (totalIncome - totalExpense) >= 0 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                Rs. {(totalIncome - totalExpense).toLocaleString()}
              </div>
              <div className={`text-xs mt-2 ${
                (totalIncome - totalExpense) >= 0 
                  ? 'text-blue-600 dark:text-blue-300' 
                  : 'text-red-600 dark:text-red-300'
              }`}>
                {(totalIncome - totalExpense) >= 0 ? 'Positive' : 'Negative'}
              </div>
            </div>
          </div>
        </div>

        {/* INCOME SECTION */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-md">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="text-green-500"><TrendingUpIcon /></div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Income</h3>
          </div>

          {/* Income Search Bar */}
          <div className="mb-6 relative">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={incomeSearchTerm}
                onChange={(e) => setIncomeSearchTerm(e.target.value)}
                placeholder={`Search ${currentView.monthName} income...`}
                className="w-full px-3 py-2 text-sm pl-9 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white dark:bg-[#111] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              />
              {incomeSearchTerm && (
                <button
                  onClick={() => setIncomeSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {incomeSearchTerm && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Showing {filteredIncomes.length} of {incomes.length} items
              </div>
            )}
          </div>

          {/* INCOME FORM */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-8 bg-gray-50 dark:bg-[#252525] p-4 rounded-lg">
            {!isCurrentMonth && (
            <div className="md:col-span-12 mb-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-2 text-sm">
              <Eye className="w-4 h-4" />
              <span>
                Viewing <strong>{currentView.monthName} {currentView.year}</strong>. Switch to current month to add new income.
              </span>
            </div>
          )}
            <div className="md:col-span-3">
              <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold mb-2 ml-1">DATE</label>
              <input type="date" className="w-full h-12 bg-white dark:bg-[#111] border border-gray-300 dark:border-gray-700 rounded-lg px-4 text-gray-900 dark:text-white focus:border-green-500 outline-none transition" value={incForm.date} onChange={e => setIncForm({...incForm, date: e.target.value})} disabled={!isCurrentMonth} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold mb-2 ml-1">UNIT AMOUNT</label>
              <input type="number" placeholder="0" className="w-full h-12 bg-white dark:bg-[#111] border border-gray-300 dark:border-gray-700 rounded-lg px-4 text-gray-900 dark:text-white focus:border-green-500 outline-none transition" value={incForm.unitAmount} onChange={e => setIncForm({...incForm, unitAmount: e.target.value})} disabled={!isCurrentMonth} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold mb-2 ml-1">QTY</label>
              <input type="number" placeholder="1" className="w-full h-12 bg-white dark:bg-[#111] border border-gray-300 dark:border-gray-700 rounded-lg px-4 text-center text-gray-900 dark:text-white focus:border-green-500 outline-none transition" value={incForm.quantity} onChange={e => setIncForm({...incForm, quantity: e.target.value})} disabled={!isCurrentMonth} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold mb-2 ml-1">TOTAL</label>
              <div className="w-full h-12 bg-gray-200 dark:bg-[#333] border border-gray-300 dark:border-gray-600 rounded-lg px-4 flex items-center text-gray-600 dark:text-gray-300 font-bold">Rs. {totalIncAmount.toLocaleString()}</div>
            </div>
            <div className="md:col-span-1 flex justify-center">
              <button onClick={handleAddIncome} className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition transform active:scale-95" disabled={!isCurrentMonth}><PlusIcon /></button>
            </div>
          </div>

          {/* INCOME TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Unit</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredIncomes.map((inc) => (
                  <tr key={inc.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#252525] transition">
                    <td className="py-4 px-4 text-gray-800 dark:text-gray-300">{new Date(inc.date).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-center text-gray-500">{inc.unit ? Number(inc.unit).toLocaleString() : '-'}</td>
                    <td className="py-4 px-4 text-center text-gray-500">{inc.qty || '-'}</td>
                    <td className="py-4 px-4 text-right font-bold text-green-600 dark:text-green-500">{Number(inc.amount).toLocaleString()}</td>
                    <td className="py-4 px-4 text-center">
                      <button onClick={() => handleDelete('income', inc.id)} className="text-gray-400 hover:text-red-500 transition" disabled={!isCurrentMonth}><TrashIcon /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* EXPENSES SECTION */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-md">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="text-yellow-500"><TrendingDownIcon /></div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Expenses</h3>
          </div>

          {/* Expense Search Bar */}
          <div className="mb-6 relative">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={expenseSearchTerm}
                onChange={(e) => setExpenseSearchTerm(e.target.value)}
                placeholder={`Search ${currentView.monthName} expenses...`}
                className="w-full px-3 py-2 text-sm pl-9 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none bg-white dark:bg-[#111] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              />
              {expenseSearchTerm && (
                <button
                  onClick={() => setExpenseSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {expenseSearchTerm && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Showing {filteredExpenses.length} of {expenses.length} items
              </div>
            )}
          </div>

          {/* EXPENSE FORM */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-8 bg-gray-50 dark:bg-[#252525] p-4 rounded-lg">
            {!isCurrentMonth && (
            <div className="md:col-span-12 mb-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-2 text-sm">
              <Eye className="w-4 h-4" />
              <span>
                Viewing <strong>{currentView.monthName} {currentView.year}</strong>. Switch to current month to add new expenses.
              </span>
            </div>
          )}
            <div className="md:col-span-3">
              <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold mb-2 ml-1">DATE</label>
              <input type="date" className="w-full h-12 bg-white dark:bg-[#111] border border-gray-300 dark:border-gray-700 rounded-lg px-4 text-gray-900 dark:text-white focus:border-yellow-500 outline-none transition" value={expForm.date} onChange={e => setExpForm({...expForm, date: e.target.value})} disabled={!isCurrentMonth} />
                
            </div>
            <div className="md:col-span-3">
              <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold mb-2 ml-1">CATEGORY</label>
              <select 
               className="w-full h-12 bg-white dark:bg-[#111] border border-gray-300 dark:border-gray-700 rounded-lg px-4 text-gray-900 dark:text-white focus:border-yellow-500 outline-none transition"
               value={expForm.category}
               onChange={e => setExpForm({ ...expForm, category: e.target.value })} 
               >
                <option value="">Select Category</option>
                <option value="Rent & Utilities">Rent & Utilities</option>
                <option value="Salaries & Wages">Salaries & Wages</option>
                <option value="Inventory & Supplies">Inventory & Supplies</option>
                <option value="Marketing & Advertising">Marketing & Advertising</option>
                <option value="Professional Services">Professional Services</option>
                <option value="Other Expenses">Other Expenses</option>
               </select>
              
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold mb-2 ml-1">NAME</label>
              <input type="text" placeholder="e.g. Uber" className="w-full h-12 bg-white dark:bg-[#111] border border-gray-300 dark:border-gray-700 rounded-lg px-4 text-gray-900 dark:text-white focus:border-yellow-500 outline-none transition" value={expForm.name} onChange={e => setExpForm({...expForm, name: e.target.value})} disabled={!isCurrentMonth} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold mb-2 ml-1">AMOUNT</label>
              <input type="number" placeholder="0" className="w-full h-12 bg-white dark:bg-[#111] border border-gray-300 dark:border-gray-700 rounded-lg px-4 text-gray-900 dark:text-white focus:border-yellow-500 outline-none transition" value={expForm.amount} onChange={e => setExpForm({...expForm, amount: e.target.value})} disabled={!isCurrentMonth} />
            </div>
            <div className="md:col-span-1 flex justify-center">
              <button onClick={handleAddExpense} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold p-3 rounded-full shadow-lg transition transform active:scale-95" disabled={!isCurrentMonth}><PlusIcon /></button>
            </div>
          </div>

          {/* EXPENSE TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#252525] transition">
                    <td className="py-4 px-4 text-gray-800 dark:text-gray-300">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{exp.category}</td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{exp.name}</td>
                    <td className="py-4 px-4 text-right font-bold text-yellow-600 dark:text-yellow-500">{Number(exp.amount).toLocaleString()}</td>
                    <td className="py-4 px-4 text-center">
                      <button onClick={() => handleDelete('expense', exp.id)} className="text-gray-400 hover:text-red-500 transition" disabled={!isCurrentMonth}><TrashIcon /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
}