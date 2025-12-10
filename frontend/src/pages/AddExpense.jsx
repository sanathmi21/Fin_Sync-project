import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { 
  PlusCircle, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Trash2, 
  Edit, 
  DollarSign,
  Search,
  X,
  TrendingUp,
  TrendingDown,
  Filter,
  XCircle,
  Save,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Helper function to get current month/year
const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1, // 1-12
    year: now.getFullYear(),
    monthName: now.toLocaleString('default', { month: 'long' }),
    formatted: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  };
};

// Check if two month/year objects are equal
const isSameMonthYear = (a, b) => {
  return a.month === b.month && a.year === b.year;
};

const AddExpense = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Food',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    highPriority: false
  });

  const [incomeForm, setIncomeForm] = useState({
    name: 'Income',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Get ACTUAL current month/year
  const actualCurrentMonthYear = getCurrentMonthYear();
  
  // Track current viewing month - START with actual current month
  const [currentView, setCurrentView] = useState(actualCurrentMonthYear);
  const [isCurrentMonth, setIsCurrentMonth] = useState(true);
  
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [highPriorityExpenses, setHighPriorityExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [filteredIncomes, setFilteredIncomes] = useState([]);
  const [financialSummary, setFinancialSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    currentMonth: actualCurrentMonthYear.monthName + ' ' + actualCurrentMonthYear.year
  });
  
  const [loading, setLoading] = useState(false);
  const [incomeLoading, setIncomeLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [incomeMessage, setIncomeMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingExpenses, setDeletingExpenses] = useState({});
  const [deletingIncomes, setDeletingIncomes] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [resetting, setResetting] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Modal states
  const [modal, setModal] = useState({
    isOpen: false,
    type: '', // 'deleteExpense', 'deleteIncome', 'editExpense', 'editIncome', 'resetMonth'
    data: null,
    title: '',
    message: ''
  });
  
  const [editExpenseData, setEditExpenseData] = useState(null);
  const [editIncomeData, setEditIncomeData] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Refs for scroll synchronization
  const leftColumnRef = useRef(null);
  const rightColumnRef = useRef(null);
  const isScrolling = useRef(false);

  // Message fade-out states
  const [messageVisible, setMessageVisible] = useState(false);
  const [incomeMessageVisible, setIncomeMessageVisible] = useState(false);

  const categories = [
    'Food', 'Transport', 'Entertainment', 'Shopping',
    'Bills', 'Healthcare', 'Education', 'Other'
  ];

  // Auto-dismiss messages with fade effect
  useEffect(() => {
    if (message.text) {
      setMessageVisible(true);
      const fadeTimer = setTimeout(() => {
        setMessageVisible(false);
      }, 5000); // Start fading after 5 seconds
      
      const removeTimer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 6000); // Remove after 6 seconds (1 second for fade)
      
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [message.text]);

  useEffect(() => {
    if (incomeMessage.text) {
      setIncomeMessageVisible(true);
      const fadeTimer = setTimeout(() => {
        setIncomeMessageVisible(false);
      }, 5000);
      
      const removeTimer = setTimeout(() => {
        setIncomeMessage({ type: '', text: '' });
      }, 6000);
      
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [incomeMessage.text]);

  useEffect(() => {
    // On component mount, set currentView to actual current month
    setCurrentView(actualCurrentMonthYear);
    setIsCurrentMonth(true);
    fetchAllData();
  }, []);

  // Update isCurrentMonth when currentView changes
  useEffect(() => {
    const isCurrent = isSameMonthYear(currentView, actualCurrentMonthYear);
    setIsCurrentMonth(isCurrent);
    
    // Only filter data if initial load is complete
    if (initialLoadComplete) {
      filterDataByMonth();
    }
  }, [currentView, expenses, incomes, initialLoadComplete]);

  // Filter data by current month/year
  const filterDataByMonth = () => {
    const { month, year } = currentView;
    
    // Filter expenses
    const monthExpenses = expenses.filter(expense => {
      if (!expense.Ex_Date) return false;
      const expenseDate = new Date(expense.Ex_Date);
      return expenseDate.getMonth() + 1 === month && 
             expenseDate.getFullYear() === year;
    });
    
    // Filter incomes
    const monthIncomes = incomes.filter(income => {
      if (!income.In_Date) return false;
      const incomeDate = new Date(income.In_Date);
      return incomeDate.getMonth() + 1 === month && 
             incomeDate.getFullYear() === year;
    });
    
    // Filter high priority expenses
    const monthHighPriority = monthExpenses.filter(expense => expense.HighPriority);
    
    setFilteredExpenses(monthExpenses);
    setFilteredIncomes(monthIncomes);
    setHighPriorityExpenses(monthHighPriority);
    
    // Calculate summary
    const totalIncome = monthIncomes.reduce((sum, inc) => sum + parseFloat(inc.In_Amount || 0), 0);
    const totalExpenses = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.Ex_Amount || 0), 0);
    
    setFinancialSummary({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      currentMonth: `${currentView.monthName} ${currentView.year}`
    });
  };

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchExpenses(),
        fetchIncome()
      ]);
      setInitialLoadComplete(true);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/expenses`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setExpenses(response.data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching expenses:', error);
      if (error.response?.status === 401) {
        setMessage({ type: 'error', text: 'Session expired. Please login again.' });
      }
    }
  };

  const fetchIncome = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/income`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setIncomes(response.data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching income:', error);
      if (error.response?.status === 401) {
        setIncomeMessage({ type: 'error', text: 'Session expired. Please login again.' });
      }
    }
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const current = new Date(currentView.year, currentView.month - 2); // -2 because month is 1-indexed
    const newMonthYear = {
      month: current.getMonth() + 1,
      year: current.getFullYear(),
      monthName: current.toLocaleString('default', { month: 'long' }),
      formatted: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
    };
    setCurrentView(newMonthYear);
  };

  // Navigate to next month (up to current month)
  const goToNextMonth = () => {
    const now = new Date();
    const nextMonth = new Date(currentView.year, currentView.month); // month is 1-indexed
    
    // Check if next month would be beyond current month
    if (nextMonth > now) return;
    
    const newMonthYear = {
      month: nextMonth.getMonth() + 1,
      year: nextMonth.getFullYear(),
      monthName: nextMonth.toLocaleString('default', { month: 'long' }),
      formatted: `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`
    };
    setCurrentView(newMonthYear);
  };

  // Open reset confirmation modal
  const openResetModal = () => {
    setModal({
      isOpen: true,
      type: 'resetMonth',
      data: null,
      title: 'Reset to Current Month?',
      message: `Are you sure you want to reset the view to ${actualCurrentMonthYear.monthName} ${actualCurrentMonthYear.year}? This will update all charts and totals to show current month data.`
    });
  };

  // Handle month reset
  const handleResetMonth = () => {
    setResetting(true);
    
    setTimeout(() => {
      setCurrentView(actualCurrentMonthYear);
      setIsCurrentMonth(true);
      setResetting(false);
      closeModal();
      
      setMessage({ 
        type: 'success', 
        text: `View reset to ${actualCurrentMonthYear.monthName} ${actualCurrentMonthYear.year}` 
      });
    }, 800);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleIncomeInputChange = (e) => {
    const { name, value } = e.target;
    setIncomeForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isCurrentMonth) {
      setMessage({ 
        type: 'error', 
        text: `Cannot add expenses to past month (${currentView.monthName} ${currentView.year}). Switch to current month to add new expenses.` 
      });
      return;
    }
    
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Please enter expense name' });
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(`${API_BASE_URL}/expenses`, formData, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: 'Expense added successfully!'
        });
        
        setFormData({
          name: '',
          category: 'Food',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
          highPriority: false
        });
        
        // Refresh expenses and filter for current month
        await fetchExpenses();
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to add expense. Please try again.'
      });
      if (error.response?.status === 401) {
        setMessage({ type: 'error', text: 'Session expired. Please login again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleIncomeSubmit = async (e) => {
    e.preventDefault();
    
    if (!isCurrentMonth) {
      setIncomeMessage({ 
        type: 'error', 
        text: `Cannot add income to past month (${currentView.monthName} ${currentView.year}). Switch to current month to add new income.` 
      });
      return;
    }
    
    if (!incomeForm.amount || parseFloat(incomeForm.amount) <= 0) {
      setIncomeMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    setIncomeLoading(true);
    setIncomeMessage({ type: '', text: '' });

    try {
      const response = await axios.post(`${API_BASE_URL}/income`, incomeForm, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        setIncomeMessage({
          type: 'success',
          text: 'Income added successfully!'
        });
        
        setIncomeForm({
          name: 'Income',
          amount: '',
          date: new Date().toISOString().split('T')[0]
        });
        
        // Refresh incomes and filter for current month
        await fetchIncome();
      }
    } catch (error) {
      setIncomeMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to add income. Please try again.'
      });
      if (error.response?.status === 401) {
        setIncomeMessage({ type: 'error', text: 'Session expired. Please login again.' });
      }
    } finally {
      setIncomeLoading(false);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (type, item) => {
    if (!isCurrentMonth) {
      setMessage({ 
        type: 'error', 
        text: `Cannot modify data from past month (${currentView.monthName} ${currentView.year}). Switch to current month to make changes.` 
      });
      return;
    }
    
    setModal({
      isOpen: true,
      type: `delete${type.charAt(0).toUpperCase() + type.slice(1)}`,
      data: item,
      title: `Delete ${type === 'expense' ? 'Expense' : 'Income'}?`,
      message: `Are you sure you want to delete this ${type === 'expense' ? 'expense' : 'income'}? This action cannot be undone.`
    });
  };

  // Open edit modal
  const openEditModal = (type, item) => {
    if (!isCurrentMonth) {
      setMessage({ 
        type: 'error', 
        text: `Cannot modify data from past month (${currentView.monthName} ${currentView.year}). Switch to current month to make changes.` 
      });
      return;
    }
    
    if (type === 'expense') {
      setEditExpenseData({
        ...item,
        date: item.Ex_Date ? item.Ex_Date.split('T')[0] : new Date().toISOString().split('T')[0]
      });
      setModal({
        isOpen: true,
        type: 'editExpense',
        data: item,
        title: 'Edit Expense',
        message: ''
      });
    } else if (type === 'income') {
      setEditIncomeData({
        ...item,
        date: item.In_Date ? item.In_Date.split('T')[0] : new Date().toISOString().split('T')[0]
      });
      setModal({
        isOpen: true,
        type: 'editIncome',
        data: item,
        title: 'Edit Income',
        message: ''
      });
    }
  };

  // Close modal
  const closeModal = () => {
    setModal({ isOpen: false, type: '', data: null, title: '', message: '' });
    setEditExpenseData(null);
    setEditIncomeData(null);
    setEditLoading(false);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    const { type, data } = modal;
    
    if (!isCurrentMonth) {
      setMessage({ 
        type: 'error', 
        text: `Cannot modify data from past month. Switch to current month.` 
      });
      closeModal();
      return;
    }
    
    if (type === 'deleteExpense') {
      setDeletingExpenses(prev => ({ ...prev, [data.ExpenseID]: true }));
      
      try {
        await axios.delete(`${API_BASE_URL}/expenses/${data.ExpenseID}`, {
          headers: getAuthHeaders()
        });
        
        // Remove from state
        setExpenses(prev => prev.filter(exp => exp.ExpenseID !== data.ExpenseID));
        
        setDeletingExpenses(prev => ({ ...prev, [data.ExpenseID]: false }));
        
        // Show success message
        setMessage({ type: 'success', text: 'Expense deleted successfully!' });
      } catch (error) {
        console.error('Error deleting expense:', error);
        setMessage({ type: 'error', text: 'Failed to delete expense. Please try again.' });
        setDeletingExpenses(prev => ({ ...prev, [data.ExpenseID]: false }));
      }
    } else if (type === 'deleteIncome') {
      setDeletingIncomes(prev => ({ ...prev, [data.IncomeID]: true }));
      
      try {
        await axios.delete(`${API_BASE_URL}/income/${data.IncomeID}`, {
          headers: getAuthHeaders()
        });
        
        // Remove from state
        setIncomes(prev => prev.filter(inc => inc.IncomeID !== data.IncomeID));
        
        setDeletingIncomes(prev => ({ ...prev, [data.IncomeID]: false }));
        
        // Show success message
        setIncomeMessage({ type: 'success', text: 'Income deleted successfully!' });
      } catch (error) {
        console.error('Error deleting income:', error);
        setIncomeMessage({ type: 'error', text: 'Failed to delete income. Please try again.' });
        setDeletingIncomes(prev => ({ ...prev, [data.IncomeID]: false }));
      }
    }
    
    closeModal();
  };

  // Handle edit expense
  const handleEditExpense = async (e) => {
    e.preventDefault();
    
    if (!isCurrentMonth) {
      setMessage({ 
        type: 'error', 
        text: `Cannot modify data from past month. Switch to current month.` 
      });
      return;
    }
    
    if (!editExpenseData?.Ex_Name?.trim() || !editExpenseData?.Ex_Amount || parseFloat(editExpenseData.Ex_Amount) <= 0) {
      setMessage({ type: 'error', text: 'Please fill all required fields' });
      return;
    }

    setEditLoading(true);

    try {
      const response = await axios.put(`${API_BASE_URL}/expenses/${editExpenseData.ExpenseID}`, {
        name: editExpenseData.Ex_Name,
        category: editExpenseData.Category,
        amount: editExpenseData.Ex_Amount,
        date: editExpenseData.date,
        description: editExpenseData.Description || '',
        highPriority: editExpenseData.HighPriority
      }, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Expense updated successfully!' });
        
        // Update state
        setExpenses(prev => prev.map(exp => 
          exp.ExpenseID === editExpenseData.ExpenseID ? {
            ...exp,
            ...response.data.data,
            // Ensure all fields are included
            Ex_Name: response.data.data.Ex_Name || editExpenseData.Ex_Name,
            Category: response.data.data.Category || editExpenseData.Category,
            Ex_Amount: response.data.data.Ex_Amount || editExpenseData.Ex_Amount,
            Ex_Date: response.data.data.Ex_Date || editExpenseData.date,
            Description: response.data.data.Description || editExpenseData.Description,
            HighPriority: response.data.data.HighPriority || editExpenseData.HighPriority
          } : exp
        ));
        
        closeModal();
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update expense. Please try again.'
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Handle edit income
  const handleEditIncome = async (e) => {
    e.preventDefault();
    
    if (!isCurrentMonth) {
      setIncomeMessage({ 
        type: 'error', 
        text: `Cannot modify data from past month. Switch to current month.` 
      });
      return;
    }
    
    if (!editIncomeData?.In_Amount || parseFloat(editIncomeData.In_Amount) <= 0) {
      setIncomeMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    setEditLoading(true);

    try {
      const response = await axios.put(`${API_BASE_URL}/income/${editIncomeData.IncomeID}`, {
        name: editIncomeData.In_Name,
        amount: editIncomeData.In_Amount,
        date: editIncomeData.date
      }, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setIncomeMessage({ type: 'success', text: 'Income updated successfully!' });
        
        // Update state
        setIncomes(prev => prev.map(inc => 
          inc.IncomeID === editIncomeData.IncomeID ? {
            ...inc,
            ...response.data.data,
            In_Name: response.data.data.In_Name || editIncomeData.In_Name,
            In_Amount: response.data.data.In_Amount || editIncomeData.In_Amount,
            In_Date: response.data.data.In_Date || editIncomeData.date
          } : inc
        ));
        
        closeModal();
      }
    } catch (error) {
      console.error('Error updating income:', error);
      setIncomeMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update income. Please try again.'
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Handle edit form changes
  const handleEditExpenseChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditExpenseData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditIncomeChange = (e) => {
    const { name, value } = e.target;
    setEditIncomeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter logic for expenses with search
  const filteredExpensesList = useMemo(() => {
    let result = filteredExpenses;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(expense =>
        expense.Ex_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.Category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply tab filter
    if (activeTab === 'highPriority') {
      result = result.filter(expense => expense.HighPriority);
    } else if (activeTab === 'regular') {
      result = result.filter(expense => !expense.HighPriority);
    } else if (activeTab !== 'all') {
      result = result.filter(expense => expense.Category === activeTab);
    }
    
    return result;
  }, [filteredExpenses, searchTerm, activeTab]);

  // Separate high priority and regular expenses
  const filteredHighPriorityExpenses = useMemo(() => 
    filteredExpensesList.filter(expense => expense.HighPriority),
    [filteredExpensesList]
  );

  const filteredOtherExpenses = useMemo(() => 
    filteredExpensesList.filter(expense => !expense.HighPriority),
    [filteredExpensesList]
  );

  // Get filtered categories for tab display
  const getFilteredCategories = () => {
    return ['all', 'highPriority', 'regular', ...categories].map(cat => ({
      id: cat,
      label: cat === 'all' ? 'All' : 
             cat === 'highPriority' ? 'High Priority' :
             cat === 'regular' ? 'Regular' : cat
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Smooth scroll synchronization with requestAnimationFrame
  const handleRightColumnScroll = () => {
    if (isScrolling.current) return;
    
    requestAnimationFrame(() => {
      const rightColumn = rightColumnRef.current;
      const leftColumn = leftColumnRef.current;
      
      if (rightColumn && leftColumn) {
        const rightScrollableHeight = rightColumn.scrollHeight - rightColumn.clientHeight;
        if (rightScrollableHeight <= 0) return;
        
        const rightScrollPercentage = rightColumn.scrollTop / rightScrollableHeight;
        
        const leftScrollableHeight = leftColumn.scrollHeight - leftColumn.clientHeight;
        if (leftScrollableHeight <= 0) return;
        
        const leftTargetScroll = rightScrollPercentage * leftScrollableHeight;
        
        // Only scroll left column if it's not already at the calculated position
        if (Math.abs(leftColumn.scrollTop - leftTargetScroll) > 1) {
          isScrolling.current = true;
          leftColumn.scrollTo({
            top: leftTargetScroll,
            behavior: 'smooth'
          });
          
          // Reset the flag after scroll completes
          setTimeout(() => {
            isScrolling.current = false;
          }, 50);
        }
      }
    });
  };

  // Handle manual message dismissal
  const handleDismissMessage = () => {
    setMessageVisible(false);
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 300);
  };

  const handleDismissIncomeMessage = () => {
    setIncomeMessageVisible(false);
    setTimeout(() => {
      setIncomeMessage({ type: '', text: '' });
    }, 300);
  };

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ type: 'error', text: 'Please login to add expenses or income.' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111] transition-colors duration-300 p-4 md:p-6 relative">
      
      {/* Modal Overlay */}
      {modal.isOpen && (
        <>
          {/* Backdrop with blur effect */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-40"
            onClick={closeModal}
          />
          
          {/* Modal - Centered and properly positioned */}
          <div className="fixed inset-0 flex items-start justify-center p-4 z-50 pt-10 sm:items-center">
            <div 
              className={`bg-white dark:bg-[#1a1a1a] rounded-lg shadow-2xl transform transition-all duration-300 scale-100 opacity-100 overflow-hidden max-h-[90vh] overflow-y-auto ${
                modal.type.startsWith('delete') || modal.type === 'resetMonth'
                  ? 'w-full max-w-xs'
                  : 'w-full max-w-xs sm:max-w-sm'
              }`}
              onClick={(e) => e.stopPropagation()}
              style={{ 
                animation: 'modalFadeIn 0.3s ease-out',
                marginTop: 'env(safe-area-inset-top, 0px)'
              }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#333] sticky top-0 bg-white dark:bg-[#1a1a1a] z-10">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                  {modal.title}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className={`p-4 ${modal.type.startsWith('edit') ? '' : ''}`}>
                {modal.type.startsWith('delete') ? (
                  // Delete Confirmation Content
                  <>
                    <div className="mb-4">
                      <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 rounded-full bg-red-100 dark:bg-red-900/30">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-3">
                        {modal.message}
                      </p>
                      {modal.data && (
                        <div className="p-3 bg-gray-50 dark:bg-[#222] rounded">
                          <p className="font-medium text-sm text-gray-800 dark:text-white">
                            {modal.type === 'deleteExpense' ? modal.data.Ex_Name : modal.data.In_Name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatCurrency(modal.type === 'deleteExpense' ? modal.data.Ex_Amount : modal.data.In_Amount)}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Delete Modal Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={closeModal}
                        className="flex-1 py-2 px-3 text-sm bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteConfirm}
                        disabled={deletingExpenses[modal.data?.ExpenseID] || deletingIncomes[modal.data?.IncomeID]}
                        className="flex-1 py-2 px-3 text-sm bg-gradient-to-r from-red-600 to-red-500 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        {(deletingExpenses[modal.data?.ExpenseID] || deletingIncomes[modal.data?.IncomeID]) ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          'Delete'
                        )}
                      </button>
                    </div>
                  </>
                ) : modal.type === 'resetMonth' ? (
                  // Reset Month Confirmation
                  <>
                    <div className="mb-4">
                      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                        <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-3">
                        {modal.message}
                      </p>
                      <div className="p-3 bg-gray-50 dark:bg-[#222] rounded border border-gray-200 dark:border-[#333]">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current View:</p>
                        <p className="font-medium text-sm text-gray-800 dark:text-white">
                          {currentView.monthName} {currentView.year}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-1">Reset to:</p>
                        <p className="font-medium text-sm text-blue-600 dark:text-blue-400">
                          {actualCurrentMonthYear.monthName} {actualCurrentMonthYear.year}
                        </p>
                      </div>
                    </div>
                    
                    {/* Reset Modal Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={closeModal}
                        className="flex-1 py-2 px-3 text-sm bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleResetMonth}
                        disabled={resetting}
                        className="flex-1 py-2 px-3 text-sm bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        {resetting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Resetting...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            Reset View
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : modal.type === 'editExpense' ? (
                  // Edit Expense Form - Professional compact design
                  <form onSubmit={handleEditExpense} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          name="Ex_Name"
                          value={editExpenseData?.Ex_Name || ''}
                          onChange={handleEditExpenseChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-[#EFB506] focus:border-transparent outline-none bg-white dark:bg-[#222] text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Category *
                        </label>
                        <select
                          name="Category"
                          value={editExpenseData?.Category || 'Food'}
                          onChange={handleEditExpenseChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-[#EFB506] focus:border-transparent outline-none bg-white dark:bg-[#222] text-gray-900 dark:text-white"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Amount *
                        </label>
                        <input
                          type="number"
                          name="Ex_Amount"
                          value={editExpenseData?.Ex_Amount || ''}
                          onChange={handleEditExpenseChange}
                          min="0.01"
                          step="0.01"
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-[#EFB506] focus:border-transparent outline-none bg-white dark:bg-[#222] text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Date *
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={editExpenseData?.date || ''}
                          onChange={handleEditExpenseChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-[#EFB506] focus:border-transparent outline-none bg-white dark:bg-[#222] text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        name="Description"
                        value={editExpenseData?.Description || ''}
                        onChange={handleEditExpenseChange}
                        rows="1"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-[#EFB506] focus:border-transparent outline-none resize-none bg-white dark:bg-[#222] text-gray-900 dark:text-white"
                        placeholder="Add a short description..."
                      />
                    </div>

                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-[#222] rounded-lg border border-gray-200 dark:border-[#333]">
                      <label htmlFor="editHighPriority" className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          id="editHighPriority"
                          name="HighPriority"
                          checked={editExpenseData?.HighPriority || false}
                          onChange={handleEditExpenseChange}
                          className="w-4 h-4 text-[#EFB506] rounded focus:ring-[#EFB506] bg-white dark:bg-[#333] border-gray-300 dark:border-gray-600"
                        />
                        <span className="ml-2 text-xs font-medium text-gray-800 dark:text-white">Mark as Priority</span>
                      </label>
                      {editExpenseData?.HighPriority && (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                          High Priority
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-[#333]">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="flex-1 py-2.5 text-sm bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={editLoading}
                        className="flex-1 py-2.5 text-sm bg-gradient-to-r from-[#EFB506] to-[#e5a906] text-white font-medium rounded-lg hover:from-[#d19c05] hover:to-[#c89305] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        {editLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            Update
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : modal.type === 'editIncome' ? (
                  // Edit Income Form - Compact design
                  <form onSubmit={handleEditIncome} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        name="In_Name"
                        value={editIncomeData?.In_Name || ''}
                        onChange={handleEditIncomeChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-[#00B600] focus:border-transparent outline-none bg-white dark:bg-[#222] text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={editIncomeData?.date || ''}
                        onChange={handleEditIncomeChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-[#00B600] focus:border-transparent outline-none bg-white dark:bg-[#222] text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Amount *
                      </label>
                      <input
                        type="number"
                        name="In_Amount"
                        value={editIncomeData?.In_Amount || ''}
                        onChange={handleEditIncomeChange}
                        min="0.01"
                        step="0.01"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-[#00B600] focus:border-transparent outline-none bg-white dark:bg-[#222] text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="flex-1 py-2 px-3 text-sm bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={editLoading}
                        className="flex-1 py-2 px-3 text-sm bg-gradient-to-r from-[#00B600] to-[#009c00] text-white font-medium rounded-lg hover:from-[#009900] hover:to-[#008000] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        {editLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            Save
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : null}
              </div>
            </div>
          </div>

          {/* Add CSS animation for modal */}
          <style jsx>{`
            @keyframes modalFadeIn {
              from {
                opacity: 0;
                transform: scale(0.95) translateY(-10px);
              }
              to {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
          `}</style>
        </>
      )}

      <div className="max-w-7xl mx-auto h-[calc(100vh-2rem)]">
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          {/* Left Column - Add Expense Form and Income Form - Independent Scroll */}
          <div className="lg:w-1/3 flex flex-col">
            <div 
              ref={leftColumnRef}
              className="flex-1 overflow-y-auto pr-1 scrollbar-thin"
            >
              <div className="space-y-6">
                {/* Add Expense Form */}
                <div className={`bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-4 border transition-colors duration-300 ${
                  isCurrentMonth 
                    ? 'border-gray-200 dark:border-[#333]' 
                    : 'border-gray-300 dark:border-gray-600 opacity-90'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white transition-colors">
                        Add New Expense
                      </h2>
                      {!isCurrentMonth && (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          View Only
                        </span>
                      )}
                    </div>
                    <PlusCircle className={`w-6 h-6 ${isCurrentMonth ? 'text-[#EFB506]' : 'text-gray-400'}`} />
                  </div>

                  {!isCurrentMonth && (
                    <div className="mb-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-2 text-sm">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">
                        Viewing <strong>{currentView.monthName} {currentView.year}</strong>. Switch to current month to add.
                      </span>
                    </div>
                  )}

                  {message.text && (
                    <div 
                      className={`mb-3 p-2 rounded-lg flex items-center justify-between gap-2 text-sm transition-all duration-300 ${
                        message.type === 'success' 
                          ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' 
                          : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                      } ${
                        messageVisible ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {message.type === 'success' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                        <span className="text-sm">{message.text}</span>
                      </div>
                      <button
                        onClick={handleDismissMessage}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Rice, Pizza, Movie tickets..."
                        className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-[#444] rounded-xl focus:ring-2 focus:ring-[#EFB506] focus:border-transparent outline-none transition-all bg-white dark:bg-[#222] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
                        required
                        disabled={!isCurrentMonth}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                          Category *
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-[#444] rounded-xl focus:ring-2 focus:ring-[#EFB506] focus:border-transparent outline-none bg-white dark:bg-[#222] text-gray-900 dark:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          disabled={!isCurrentMonth}
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat} className="bg-white dark:bg-[#222]">{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                          Amount (LKR) *
                        </label>
                        <input
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          min="0.01"
                          step="0.01"
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-[#444] rounded-xl focus:ring-2 focus:ring-[#EFB506] focus:border-transparent outline-none bg-white dark:bg-[#222] text-gray-900 dark:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          required
                          disabled={!isCurrentMonth}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                        Date *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 pl-9 border border-gray-300 dark:border-[#444] rounded-xl focus:ring-2 focus:ring-[#EFB506] focus:border-transparent outline-none bg-white dark:bg-[#222] text-gray-900 dark:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          required
                          disabled={!isCurrentMonth}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                        Description (Optional)
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Add notes about this expense..."
                        rows="2"
                        className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-[#444] rounded-xl focus:ring-2 focus:ring-[#EFB506] focus:border-transparent outline-none resize-none bg-white dark:bg-[#222] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={!isCurrentMonth}
                      />
                    </div>

                    <div className="flex items-center p-3 bg-gray-50 dark:bg-[#222] rounded-xl border border-gray-200 dark:border-[#333] transition-colors">
                      <input
                        type="checkbox"
                        id="highPriority"
                        name="highPriority"
                        checked={formData.highPriority}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#EFB506] rounded focus:ring-[#EFB506] bg-white dark:bg-[#333] border-gray-300 dark:border-gray-600 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={!isCurrentMonth}
                      />
                      <label htmlFor="highPriority" className="ml-2 flex-1">
                        <div className="text-sm font-medium text-gray-800 dark:text-white">Mark as Priority Expense</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">High priority expenses will be highlighted</div>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !isCurrentMonth}
                      className={`w-full py-2.5 px-4 font-semibold rounded-xl shadow-md transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm ${
                        isCurrentMonth
                          ? 'bg-gradient-to-r from-[#EFB506] to-[#e5a906] text-white hover:shadow-lg hover:-translate-y-0.5'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Adding...
                        </>
                      ) : !isCurrentMonth ? (
                        <>
                          <Eye className="w-4 h-4" />
                          View Only
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4" />
                          Add Expense
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Add Income Form */}
                <div className={`bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-4 border transition-colors duration-300 ${
                  isCurrentMonth 
                    ? 'border-gray-200 dark:border-[#333]' 
                    : 'border-gray-300 dark:border-gray-600 opacity-90'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white transition-colors">
                        Add New Income
                      </h3>
                      {!isCurrentMonth && (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          View Only
                        </span>
                      )}
                    </div>
                    <DollarSign className={`w-5 h-5 ${isCurrentMonth ? 'text-[#00B600]' : 'text-gray-400'}`} />
                  </div>

                  {incomeMessage.text && (
                    <div 
                      className={`mb-3 p-2 rounded-lg flex items-center justify-between gap-2 text-sm transition-all duration-300 ${
                        incomeMessage.type === 'success' 
                          ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' 
                          : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                      } ${
                        incomeMessageVisible ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {incomeMessage.type === 'success' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                        <span className="text-sm">{incomeMessage.text}</span>
                      </div>
                      <button
                        onClick={handleDismissIncomeMessage}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleIncomeSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={incomeForm.name}
                        onChange={handleIncomeInputChange}
                        placeholder="e.g., Salary, Freelance, Bonus..."
                        className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-[#444] rounded-xl focus:ring-2 focus:ring-[#00B600] focus:border-transparent outline-none bg-white dark:bg-[#222] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={!isCurrentMonth}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                        Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <input
                          type="date"
                          name="date"
                          value={incomeForm.date}
                          onChange={handleIncomeInputChange}
                          className="w-full px-3 py-2.5 pl-9 border border-gray-300 dark:border-[#444] rounded-xl focus:ring-2 focus:ring-[#00B600] focus:border-transparent outline-none bg-white dark:bg-[#222] text-gray-900 dark:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          required
                          disabled={!isCurrentMonth}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                        Amount (LKR) *
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={incomeForm.amount}
                        onChange={handleIncomeInputChange}
                        placeholder="0.00"
                        min="0.01"
                        step="0.01"
                        className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-[#444] rounded-xl focus:ring-2 focus:ring-[#00B600] focus:border-transparent outline-none bg-white dark:bg-[#222] text-gray-900 dark:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        required
                        disabled={!isCurrentMonth}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={incomeLoading || !isCurrentMonth}
                      className={`w-full py-2.5 px-4 font-semibold rounded-xl shadow-md transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm ${
                        isCurrentMonth
                          ? 'bg-gradient-to-r from-[#00B600] to-[#009c00] text-white hover:shadow-lg hover:-translate-y-0.5'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {incomeLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Adding...
                        </>
                      ) : !isCurrentMonth ? (
                        <>
                          <Eye className="w-4 h-4" />
                          View Only
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4" />
                          Add Income
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Expense Lists and Summary - Independent Scroll */}
          <div className="lg:w-2/3 flex flex-col">
            <div 
              ref={rightColumnRef}
              onScroll={handleRightColumnScroll}
              className="flex-1 overflow-y-auto pr-1 scrollbar-thin"
            >
              <div className="space-y-6">
                {/* Financial Summary Header with Reset Button - COMPACT REDESIGN */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-4 border border-gray-200 dark:border-[#333] transition-colors duration-300">
                  {/* Month Navigation with Reset Button */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={goToPreviousMonth}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333] transition-all duration-300 group text-sm"
                      title="Previous month"
                    >
                      <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                      <span className="text-xs font-medium hidden sm:block">Prev</span>
                    </button>
                    
                    <div className="flex-1 mx-3">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white transition-colors">
                            {currentView.monthName} {currentView.year}
                          </h3>
                          {isCurrentMonth ? (
                            <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 text-green-700 dark:text-green-300 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>Current</span>
                            </span>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>History</span>
                              </span>
                              
                              {/* Reset Button - Compact Design */}
                              <button
                                onClick={openResetModal}
                                disabled={resetting}
                                className="px-2 py-1 rounded-lg bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-700 dark:to-gray-800 text-white hover:from-gray-900 hover:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all duration-300 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs group"
                                title="Reset to current month"
                              >
                                {resetting ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                                    <span>Reset</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                          {isCurrentMonth 
                            ? "Track current month expenses & income" 
                            : `Viewing historical data (Read Only)`
                          }
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={goToNextMonth}
                      disabled={isCurrentMonth}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-300 group text-sm ${
                        isCurrentMonth
                          ? 'bg-gray-100 dark:bg-[#222] text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333]'
                      }`}
                      title={isCurrentMonth ? "Already at current month" : "Next month"}
                    >
                      <span className="text-xs font-medium hidden sm:block">Next</span>
                      <ChevronRight className={`w-4 h-4 ${!isCurrentMonth ? 'group-hover:translate-x-0.5 transition-transform' : ''}`} />
                    </button>
                  </div>

                  {/* Summary Stats - COMPACT VERSION */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800/30 transition-colors group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-medium text-gray-600 dark:text-green-300">Total Income</div>
                        <div className="p-1.5 rounded bg-green-100 dark:bg-green-900/30">
                          <TrendingUp className="w-4 h-4 text-[#00B600]" />
                        </div>
                      </div>
                      <div className="text-lg font-bold text-[#00B600] dark:text-green-400 mb-1">
                        {formatCurrency(financialSummary.totalIncome)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                        <span>{filteredIncomes.length} entries</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs ${filteredIncomes.length > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                          {filteredIncomes.length > 0 ? 'Active' : 'No Data'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-800/30 transition-colors group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-medium text-gray-600 dark:text-amber-300">Total Expenses</div>
                        <div className="p-1.5 rounded bg-amber-100 dark:bg-amber-900/30">
                          <TrendingDown className="w-4 h-4 text-[#EFB506]" />
                        </div>
                      </div>
                      <div className="text-lg font-bold text-[#EFB506] dark:text-amber-400 mb-1">
                        {formatCurrency(financialSummary.totalExpenses)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                        <span>{filteredExpenses.length} entries</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs ${filteredExpenses.length > 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                          {filteredExpenses.length > 0 ? 'Active' : 'No Data'}
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg border transition-colors group ${
                      financialSummary.balance >= 0 
                        ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-100 dark:border-blue-800/30'
                        : 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-100 dark:border-red-800/30'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-300">Balance</div>
                        <div className={`p-1.5 rounded ${
                          financialSummary.balance >= 0 
                            ? 'bg-blue-100 dark:bg-blue-900/30' 
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          {financialSummary.balance >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                      </div>
                      <div className={`text-lg font-bold mb-1 ${
                        financialSummary.balance >= 0 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(financialSummary.balance)}
                      </div>
                      <div className={`text-xs flex items-center justify-between ${
                        financialSummary.balance >= 0 
                          ? 'text-blue-600 dark:text-blue-300' 
                          : 'text-red-600 dark:text-red-300'
                      }`}>
                        <span>{financialSummary.balance >= 0 ? 'Positive' : 'Negative'}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs ${
                          financialSummary.balance >= 0 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}>
                          {financialSummary.balance >= 0 ? 'Healthy' : 'Attention'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-3 border border-gray-200 dark:border-[#333] transition-colors duration-300">
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="relative flex-1 max-w-xs">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={`Search ${currentView.monthName.toLowerCase()} expenses...`}
                        className="w-full px-3 py-2 text-sm pl-9 pr-8 border border-gray-300 dark:border-[#444] rounded-xl focus:ring-2 focus:ring-[#EFB506] focus:border-transparent outline-none bg-white dark:bg-[#222] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                      <div className="relative flex-1 min-w-0">
                        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
                          {getFilteredCategories().map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className={`px-2 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex-shrink-0 ${
                                activeTab === tab.id
                                  ? 'bg-[#EFB506] text-white shadow-sm'
                                  : 'bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333]'
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Income List */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-4 border border-green-100 dark:border-green-800/30 transition-colors duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
                      <DollarSign className="w-4 h-4 text-[#00B600]" />
                      {currentView.monthName} Income
                      {!isCurrentMonth && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                          Historical
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-[#00B600] dark:text-green-400 text-xs font-medium rounded-full transition-colors">
                        {filteredIncomes.length} items
                      </span>
                      {!isCurrentMonth && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          Read Only
                        </span>
                      )}
                    </div>
                  </div>

                  {filteredIncomes.length > 0 ? (
                    <div className="overflow-y-auto max-h-56 scrollbar-thin">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-[#222] transition-colors sticky top-0">
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 rounded-l-lg transition-colors">
                              Description
                            </th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors">
                              Amount
                            </th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors">
                              Date
                            </th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 rounded-r-lg transition-colors">
                              {isCurrentMonth ? 'Actions' : 'Status'}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredIncomes.map((income) => (
                            <tr 
                              key={income.IncomeID} 
                              className={`hover:bg-gray-50 dark:hover:bg-[#222] transition-all duration-300 ${
                                deletingIncomes[income.IncomeID] ? 'opacity-50 scale-95' : ''
                              }`}
                            >
                              <td className="py-2 px-3 font-medium text-gray-900 dark:text-white transition-colors text-sm">
                                {income.In_Name}
                              </td>
                              <td className="py-2 px-3 font-medium text-green-700 dark:text-green-400 transition-colors text-sm">
                                {formatCurrency(income.In_Amount)}
                              </td>
                              <td className="py-2 px-3 text-gray-600 dark:text-gray-400 transition-colors text-xs">
                                {formatDate(income.In_Date)}
                              </td>
                              <td className="py-2 px-3">
                                {isCurrentMonth ? (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => openEditModal('income', income)}
                                      className="text-[#00B600] hover:text-[#009c00] dark:text-green-400 dark:hover:text-green-300 font-medium text-xs flex items-center gap-1 transition-colors p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                                      title="Edit"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => openDeleteModal('income', income)}
                                      disabled={deletingIncomes[income.IncomeID]}
                                      className="text-[#D30000] hover:text-[#b30000] dark:text-red-400 dark:hover:text-red-300 font-medium text-xs flex items-center gap-1 transition-colors p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                                    Historical
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400 transition-colors text-sm">
                      <DollarSign className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                      <p>No income records found for {currentView.monthName}.</p>
                      {!isCurrentMonth && (
                        <p className="text-xs mt-1">Switch to current month to add new income</p>
                      )}
                    </div>
                  )}
                </div>

                {/* High Priority Expenses Section */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-4 border border-red-100 dark:border-red-800/30 transition-colors duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
                      <AlertCircle className="w-4 h-4 text-[#D30000]" />
                      {currentView.monthName} High Priority Expenses
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'highPriority' ? 'bg-red-500 text-white' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                        Filtered
                      </span>
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-[#D30000] dark:text-red-400 text-xs font-medium rounded-full transition-colors">
                        {filteredHighPriorityExpenses.length} items
                      </span>
                      {!isCurrentMonth && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                          Historical
                        </span>
                      )}
                    </div>
                  </div>

                  {filteredHighPriorityExpenses.length > 0 ? (
                    <div className="overflow-y-auto max-h-64 scrollbar-thin">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-[#222] transition-colors sticky top-0">
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 rounded-l-lg transition-colors">
                              Category
                            </th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors">
                              Amount
                            </th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors">
                              Date
                            </th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors">
                              Description
                            </th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 rounded-r-lg transition-colors">
                              {isCurrentMonth ? 'Actions' : 'Status'}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredHighPriorityExpenses.map((expense) => (
                            <tr 
                              key={expense.ExpenseID} 
                              className={`hover:bg-gray-50 dark:hover:bg-[#222] transition-all duration-300 ${
                                deletingExpenses[expense.ExpenseID] ? 'opacity-50 scale-95' : ''
                              }`}
                            >
                              <td className="py-2 px-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 transition-colors">
                                  {expense.Category}
                                </span>
                              </td>
                              <td className="py-2 px-3 font-medium text-gray-900 dark:text-white transition-colors text-sm">
                                {formatCurrency(expense.Ex_Amount)}
                              </td>
                              <td className="py-2 px-3 text-gray-600 dark:text-gray-400 transition-colors text-xs">
                                {formatDate(expense.Ex_Date)}
                              </td>
                              <td className="py-2 px-3 text-gray-600 dark:text-gray-400 max-w-xs truncate transition-colors text-sm">
                                {expense.Description || '-'}
                              </td>
                              <td className="py-2 px-3">
                                {isCurrentMonth ? (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => openEditModal('expense', expense)}
                                      className="text-[#00B600] hover:text-[#009c00] dark:text-green-400 dark:hover:text-green-300 font-medium text-xs flex items-center gap-1 transition-colors p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                                      title="Edit"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => openDeleteModal('expense', expense)}
                                      disabled={deletingExpenses[expense.ExpenseID]}
                                      className="text-[#D30000] hover:text-[#b30000] dark:text-red-400 dark:hover:text-red-300 font-medium text-xs flex items-center gap-1 transition-colors p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                                    Historical
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400 transition-colors text-sm">
                      <AlertCircle className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                      <p>No high priority expenses found for {currentView.monthName}.</p>
                      {searchTerm && <p className="text-xs mt-1">Try changing your search or filter</p>}
                    </div>
                  )}
                </div>

                {/* Other Expenses Section */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-4 border border-gray-200 dark:border-[#333] transition-colors duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-bold text-gray-800 dark:text-white transition-colors">
                      {currentView.monthName} Other Expenses
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ml-2 ${activeTab === 'regular' ? 'bg-blue-500 text-white' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'}`}>
                        {activeTab === 'regular' ? 'Filtered' : 'All'}
                      </span>
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full transition-colors">
                        {filteredOtherExpenses.length} items
                      </span>
                      {!isCurrentMonth && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                          Historical
                        </span>
                      )}
                    </div>
                  </div>

                  {filteredOtherExpenses.length > 0 ? (
                    <div className="overflow-y-auto max-h-72 scrollbar-thin">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-[#222] transition-colors sticky top-0">
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 rounded-l-lg transition-colors">
                              Category
                            </th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors">
                              Amount
                            </th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors">
                              Date
                            </th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors">
                              Description
                            </th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 rounded-r-lg transition-colors">
                              {isCurrentMonth ? 'Actions' : 'Status'}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOtherExpenses.map((expense) => (
                            <tr 
                              key={expense.ExpenseID} 
                              className={`hover:bg-gray-50 dark:hover:bg-[#222] transition-all duration-300 ${
                                deletingExpenses[expense.ExpenseID] ? 'opacity-50 scale-95' : ''
                              }`}
                            >
                              <td className="py-2 px-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-[#222] text-gray-800 dark:text-gray-300 transition-colors">
                                  {expense.Category}
                                </span>
                              </td>
                              <td className="py-2 px-3 font-medium text-gray-900 dark:text-white transition-colors text-sm">
                                {formatCurrency(expense.Ex_Amount)}
                              </td>
                              <td className="py-2 px-3 text-gray-600 dark:text-gray-400 transition-colors text-xs">
                                {formatDate(expense.Ex_Date)}
                              </td>
                              <td className="py-2 px-3 text-gray-600 dark:text-gray-400 max-w-xs truncate transition-colors text-sm">
                                {expense.Description || '-'}
                              </td>
                              <td className="py-2 px-3">
                                {isCurrentMonth ? (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => openEditModal('expense', expense)}
                                      className="text-[#00B600] hover:text-[#009c00] dark:text-green-400 dark:hover:text-green-300 font-medium text-xs flex items-center gap-1 transition-colors p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                                      title="Edit"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => openDeleteModal('expense', expense)}
                                      disabled={deletingExpenses[expense.ExpenseID]}
                                      className="text-[#D30000] hover:text-[#b30000] dark:text-red-400 dark:hover:text-red-300 font-medium text-xs flex items-center gap-1 transition-colors p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                                    Historical
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400 transition-colors text-sm">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-[#222] rounded-full flex items-center justify-center">
                        <PlusCircle className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                      </div>
                      <p className="font-medium mb-1">No expenses found for {currentView.monthName}</p>
                      <p className="text-xs">
                        {searchTerm 
                          ? 'Try a different search term'
                          : !isCurrentMonth 
                            ? 'Switch to current month to add new expenses'
                            : 'Add your first expense to get started!'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add custom scrollbar styles - Using Tailwind classes instead of custom CSS */}
      <style jsx global>{`
        /* Custom scrollbar for independent scroll areas - VERY THIN VERSION */
        .scrollbar-thin::-webkit-scrollbar {
          width: 2px;
          height: 2px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 1px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.2);
          border-radius: 1px;
          transition: background 0.2s ease;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.4);
        }
        
        .dark .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.2);
        }
        
        .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(75, 85, 99, 0.4);
        }
        
        /* For Firefox */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.2) transparent;
        }
        
        .dark .scrollbar-thin {
          scrollbar-color: rgba(75, 85, 99, 0.2) transparent;
        }
        
        /* Smooth message fade-out animation */
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        .message-fade-out {
          animation: fadeOut 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AddExpense;