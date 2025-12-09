import React, { useState, useEffect, useMemo } from 'react';
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
  Loader2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const API_BASE_URL = 'http://localhost:5000/api';

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

  const [expenses, setExpenses] = useState([]);
  const [highPriorityExpenses, setHighPriorityExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [financialSummary, setFinancialSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    currentMonth: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
  });
  
  const [loading, setLoading] = useState(false);
  const [incomeLoading, setIncomeLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [incomeMessage, setIncomeMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingExpenses, setDeletingExpenses] = useState({});
  const [deletingIncomes, setDeletingIncomes] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  
  // Modal states
  const [modal, setModal] = useState({
    isOpen: false,
    type: '', // 'deleteExpense', 'deleteIncome', 'editExpense', 'editIncome'
    data: null,
    title: '',
    message: ''
  });
  
  const [editExpenseData, setEditExpenseData] = useState(null);
  const [editIncomeData, setEditIncomeData] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const categories = [
    'Food', 'Transport', 'Entertainment', 'Shopping',
    'Bills', 'Healthcare', 'Education', 'Other'
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchExpenses(),
      fetchHighPriorityExpenses(),
      fetchIncome(),
      fetchFinancialSummary()
    ]);
  };

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/expenses`);
      if (response.data.success) {
        setExpenses(response.data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching expenses:', error);
    }
  };

  const fetchHighPriorityExpenses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/expenses/high-priority`);
      if (response.data.success) {
        setHighPriorityExpenses(response.data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching high priority expenses:', error);
    }
  };

  const fetchIncome = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/income`);
      if (response.data.success) {
        setIncomes(response.data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching income:', error);
    }
  };

  const fetchFinancialSummary = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/income/summary`);
      if (response.data.success) {
        setFinancialSummary(response.data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching financial summary:', error);
    }
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
        headers: {
          'Content-Type': 'application/json'
        }
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
        
        fetchAllData();
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to add expense. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIncomeSubmit = async (e) => {
    e.preventDefault();
    
    if (!incomeForm.amount || parseFloat(incomeForm.amount) <= 0) {
      setIncomeMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    setIncomeLoading(true);
    setIncomeMessage({ type: '', text: '' });

    try {
      const response = await axios.post(`${API_BASE_URL}/income`, incomeForm, {
        headers: {
          'Content-Type': 'application/json'
        }
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
        
        fetchAllData();
      }
    } catch (error) {
      setIncomeMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to add income. Please try again.'
      });
    } finally {
      setIncomeLoading(false);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (type, item) => {
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
    if (type === 'expense') {
      setEditExpenseData({
        ...item,
        date: item.Ex_Date.split('T')[0]
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
        date: item.In_Date.split('T')[0]
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
    
    if (type === 'deleteExpense') {
      setDeletingExpenses(prev => ({ ...prev, [data.ExpenseID]: true }));
      
      try {
        await axios.delete(`${API_BASE_URL}/expenses/${data.ExpenseID}`);
        
        // Remove from state
        setExpenses(prev => prev.filter(exp => exp.ExpenseID !== data.ExpenseID));
        setHighPriorityExpenses(prev => prev.filter(exp => exp.ExpenseID !== data.ExpenseID));
        setDeletingExpenses(prev => ({ ...prev, [data.ExpenseID]: false }));
        fetchFinancialSummary();
        
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
        await axios.delete(`${API_BASE_URL}/income/${data.IncomeID}`);
        
        // Remove from state
        setIncomes(prev => prev.filter(inc => inc.IncomeID !== data.IncomeID));
        setDeletingIncomes(prev => ({ ...prev, [data.IncomeID]: false }));
        fetchFinancialSummary();
        
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
    
    if (!editExpenseData.Ex_Name?.trim() || !editExpenseData.Ex_Amount || parseFloat(editExpenseData.Ex_Amount) <= 0) {
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
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Expense updated successfully!' });
        
        // Update state
        setExpenses(prev => prev.map(exp => 
          exp.ExpenseID === editExpenseData.ExpenseID ? response.data.data : exp
        ));
        setHighPriorityExpenses(prev => prev.map(exp => 
          exp.ExpenseID === editExpenseData.ExpenseID ? response.data.data : exp
        ));
        
        fetchFinancialSummary();
        closeModal();
      }
    } catch (error) {
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
    
    if (!editIncomeData.In_Amount || parseFloat(editIncomeData.In_Amount) <= 0) {
      setIncomeMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    setEditLoading(true);

    try {
      const response = await axios.put(`${API_BASE_URL}/income/${editIncomeData.IncomeID}`, {
        name: editIncomeData.In_Name,
        amount: editIncomeData.In_Amount,
        date: editIncomeData.date
      });

      if (response.data.success) {
        setIncomeMessage({ type: 'success', text: 'Income updated successfully!' });
        
        // Update state
        setIncomes(prev => prev.map(inc => 
          inc.IncomeID === editIncomeData.IncomeID ? response.data.data : inc
        ));
        
        fetchFinancialSummary();
        closeModal();
      }
    } catch (error) {
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

  // Filter logic for expenses
  const filteredExpenses = useMemo(() => {
    let result = expenses;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(expense =>
        expense.Ex_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.Category.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [expenses, searchTerm, activeTab]);

  // Separate high priority and regular expenses
  const filteredHighPriorityExpenses = useMemo(() => 
    filteredExpenses.filter(expense => expense.HighPriority),
    [filteredExpenses]
  );

  const filteredOtherExpenses = useMemo(() => 
    filteredExpenses.filter(expense => !expense.HighPriority),
    [filteredExpenses]
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
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

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
                modal.type.startsWith('delete') 
                  ? 'w-full max-w-xs' // Very small for delete modals
                  : 'w-full max-w-xs sm:max-w-sm' // Small for edit modals
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

                ) : modal.type === 'editIncome' ? (
                  // Edit Income Form - Ultra compact
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

                    <div className="flex gap-2 pt-3">
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

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Add Expense Form and Income Form */}
          <div className="lg:col-span-1 space-y-6">
            {/* Add Expense Form */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 border border-gray-200 dark:border-[#333] transition-colors duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors">
                  Add New Expense
                </h2>
                <PlusCircle className="w-8 h-8 text-[#EFB506]" />
              </div>

              {message.text && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                  message.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                } transition-colors`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Rice, Pizza, Movie tickets..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-[#444] rounded-xl focus:ring-2 focus:ring-[#EFB506] focus:border-transparent outline-none transition-all bg-white dark:bg-[#222] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-[#444] rounded-xl focus:ring-2 focus:ring-[#EFB506] focus:border-transparent outline-none bg-white dark:bg-[#222] text-gray-900 dark:text-white transition-colors"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat} className="bg-white dark:bg-[#222]">{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
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
                      className="w-full px-4 py-3 border border-gray-300 dark:border-[#444] rounded-xl focus:ring-2 focus:ring-[#EFB506] focus:border-transparent outline-none bg-white dark:bg-[#222] text-gray-900 dark:text-white transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                    Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-[#444] rounded-xl focus:ring-2 focus:ring-[#EFB506] focus:border-transparent outline-none bg-white dark:bg-[#222] text-gray-900 dark:text-white transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Add notes about this expense..."
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-[#444] rounded-xl focus:ring-2 focus:ring-[#EFB506] focus:border-transparent outline-none resize-none bg-white dark:bg-[#222] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  />
                </div>

                <div className="flex items-center p-4 bg-gray-50 dark:bg-[#222] rounded-xl border border-gray-200 dark:border-[#333] transition-colors">
                  <input
                    type="checkbox"
                    id="highPriority"
                    name="highPriority"
                    checked={formData.highPriority}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-[#EFB506] rounded focus:ring-[#EFB506] bg-white dark:bg-[#333] border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor="highPriority" className="ml-3 flex-1">
                    <div className="font-medium text-gray-800 dark:text-white">Mark as Priority Expense</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">High priority expenses will be highlighted</div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#EFB506] to-[#e5a906] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding Expense...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      Add Expense
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Add Income Form */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 border border-gray-200 dark:border-[#333] transition-colors duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white transition-colors">
                  Add New Income
                </h3>
                <DollarSign className="w-6 h-6 text-[#00B600]" />
              </div>

              {incomeMessage.text && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                  incomeMessage.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                } transition-colors`}>
                  {incomeMessage.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span>{incomeMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleIncomeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={incomeForm.name}
                    onChange={handleIncomeInputChange}
                    placeholder="e.g., Salary, Freelance, Bonus..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-[#444] rounded-xl focus:ring-2 focus:ring-[#00B600] focus:border-transparent outline-none bg-white dark:bg-[#222] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="date"
                      name="date"
                      value={incomeForm.date}
                      onChange={handleIncomeInputChange}
                      className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-[#444] rounded-xl focus:ring-2 focus:ring-[#00B600] focus:border-transparent outline-none bg-white dark:bg-[#222] text-gray-900 dark:text-white transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
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
                    className="w-full px-4 py-3 border border-gray-300 dark:border-[#444] rounded-xl focus:ring-2 focus:ring-[#00B600] focus:border-transparent outline-none bg-white dark:bg-[#222] text-gray-900 dark:text-white transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={incomeLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#00B600] to-[#009c00] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {incomeLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding Income...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-5 h-5" />
                      Add Income
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Expense Lists and Summary */}
          <div className="lg:col-span-2">
            {/* Financial Summary Header */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 mb-6 border border-gray-200 dark:border-[#333] transition-colors duration-300">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors">
                    {financialSummary.currentMonth}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Track your monthly financial progress
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Today</div>
                  <div className="text-lg font-semibold text-gray-800 dark:text-white">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 p-4 rounded-xl border border-green-100 dark:border-green-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-green-300">Total Income</div>
                    <TrendingUp className="w-5 h-5 text-[#00B600]" />
                  </div>
                  <div className="text-2xl font-bold text-[#00B600] dark:text-green-400 mt-2">
                    {formatCurrency(financialSummary.totalIncome)}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 p-4 rounded-xl border border-amber-100 dark:border-amber-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-amber-300">Total Expenses</div>
                    <TrendingDown className="w-5 h-5 text-[#EFB506]" />
                  </div>
                  <div className="text-2xl font-bold text-[#EFB506] dark:text-amber-400 mt-2">
                    {formatCurrency(financialSummary.totalExpenses)}
                  </div>
                </div>
                <div className={`p-4 rounded-xl border transition-colors ${
                  financialSummary.balance >= 0 
                    ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-blue-100 dark:border-blue-800/50'
                    : 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 border-red-100 dark:border-red-800/50'
                }`}>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Balance</div>
                  <div className={`text-2xl font-bold mt-2 ${
                    financialSummary.balance >= 0 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatCurrency(financialSummary.balance)}
                  </div>
                  <div className={`text-xs mt-1 ${
                    financialSummary.balance >= 0 
                      ? 'text-blue-600 dark:text-blue-300' 
                      : 'text-red-600 dark:text-red-300'
                  }`}>
                    {financialSummary.balance >= 0 ? 'Positive balance' : 'Negative balance'}
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Section - FIXED */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-4 mb-6 border border-gray-200 dark:border-[#333] transition-colors duration-300">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search expenses by name or category..."
                    className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 dark:border-[#444] rounded-xl focus:ring-2 focus:ring-[#EFB506] focus:border-transparent outline-none bg-white dark:bg-[#222] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0" />
                  <div className="relative flex-1 min-w-0">
                    <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                      {getFilteredCategories().map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors flex-shrink-0 ${
                            activeTab === tab.id
                              ? 'bg-[#EFB506] text-white'
                              : 'bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333]'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                    {/* Thin scrollbar indicator */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div className="h-full bg-[#EFB506] rounded-full transition-all duration-300" 
                          style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Income List */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 mb-6 border border-green-100 dark:border-green-800/50 transition-colors duration-300">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
                  <DollarSign className="w-5 h-5 text-[#00B600]" />
                  Recent Income
                </h4>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-[#00B600] dark:text-green-400 text-sm font-medium rounded-full transition-colors">
                  {incomes.length} items
                </span>
              </div>

              {incomes.length > 0 ? (
                <div className="overflow-y-auto max-h-64">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-[#222] transition-colors sticky top-0">
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 rounded-l-xl transition-colors">
                          Description
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                          Amount
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                          Date
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 rounded-r-xl transition-colors">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {incomes.map((income) => (
                        <tr 
                          key={income.IncomeID} 
                          className={`hover:bg-gray-50 dark:hover:bg-[#222] transition-all duration-300 ${
                            deletingIncomes[income.IncomeID] ? 'opacity-50 scale-95' : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white transition-colors">
                            {income.In_Name}
                          </td>
                          <td className="py-3 px-4 font-medium text-green-700 dark:text-green-400 transition-colors">
                            {formatCurrency(income.In_Amount)}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400 transition-colors">
                            {formatDate(income.In_Date)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal('income', income)}
                                className="text-[#00B600] hover:text-[#009c00] dark:text-green-400 dark:hover:text-green-300 font-medium text-sm flex items-center gap-1 transition-colors p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal('income', income)}
                                disabled={deletingIncomes[income.IncomeID]}
                                className="text-[#D30000] hover:text-[#b30000] dark:text-red-400 dark:hover:text-red-300 font-medium text-sm flex items-center gap-1 transition-colors p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors">
                  <DollarSign className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p>No income records found. Add your first income!</p>
                </div>
              )}
            </div>

            {/* High Priority Expenses Section */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 mb-6 border border-red-100 dark:border-red-800/50 transition-colors duration-300">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
                  <AlertCircle className="w-5 h-5 text-[#D30000]" />
                  High Priority Expenses
                  <span className={`text-xs px-2 py-1 rounded-full ${activeTab === 'highPriority' ? 'bg-red-500 text-white' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'}`}>
                    Filtered
                  </span>
                </h4>
                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/50 text-[#D30000] dark:text-red-400 text-sm font-medium rounded-full transition-colors">
                  {filteredHighPriorityExpenses.length} items
                </span>
              </div>

              {filteredHighPriorityExpenses.length > 0 ? (
                <div className="overflow-y-auto max-h-72">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-[#222] transition-colors sticky top-0">
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 rounded-l-xl transition-colors">
                          Category
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                          Amount
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                          Date
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                          Description
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 rounded-r-xl transition-colors">
                          Actions
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
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 transition-colors">
                              {expense.Category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white transition-colors">
                            {formatCurrency(expense.Ex_Amount)}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400 transition-colors">
                            {formatDate(expense.Ex_Date)}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400 max-w-xs truncate transition-colors">
                            {expense.Description || '-'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal('expense', expense)}
                                className="text-[#00B600] hover:text-[#009c00] dark:text-green-400 dark:hover:text-green-300 font-medium text-sm flex items-center gap-1 transition-colors p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal('expense', expense)}
                                disabled={deletingExpenses[expense.ExpenseID]}
                                className="text-[#D30000] hover:text-[#b30000] dark:text-red-400 dark:hover:text-red-300 font-medium text-sm flex items-center gap-1 transition-colors p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors">
                  <AlertCircle className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p>No high priority expenses found.</p>
                  {searchTerm && <p className="text-sm mt-2">Try changing your search or filter</p>}
                </div>
              )}
            </div>

            {/* Other Expenses Section */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 border border-gray-200 dark:border-[#333] transition-colors duration-300">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-800 dark:text-white transition-colors">
                  Other Expenses
                  <span className={`text-xs px-2 py-1 rounded-full ml-2 ${activeTab === 'regular' ? 'bg-blue-500 text-white' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'}`}>
                    {activeTab === 'regular' ? 'Filtered' : 'All'}
                  </span>
                </h4>
                <span className="px-3 py-1 bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full transition-colors">
                  {filteredOtherExpenses.length} items
                </span>
              </div>

              {filteredOtherExpenses.length > 0 ? (
                <div className="overflow-y-auto max-h-80">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-[#222] transition-colors sticky top-0">
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 rounded-l-xl transition-colors">
                          Category
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                          Amount
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                          Date
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                          Description
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 rounded-r-xl transition-colors">
                          Actions
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
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-[#222] text-gray-800 dark:text-gray-300 transition-colors">
                              {expense.Category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white transition-colors">
                            {formatCurrency(expense.Ex_Amount)}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400 transition-colors">
                            {formatDate(expense.Ex_Date)}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400 max-w-xs truncate transition-colors">
                            {expense.Description || '-'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal('expense', expense)}
                                className="text-[#00B600] hover:text-[#009c00] dark:text-green-400 dark:hover:text-green-300 font-medium text-sm flex items-center gap-1 transition-colors p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal('expense', expense)}
                                disabled={deletingExpenses[expense.ExpenseID]}
                                className="text-[#D30000] hover:text-[#b30000] dark:text-red-400 dark:hover:text-red-300 font-medium text-sm flex items-center gap-1 transition-colors p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-[#222] rounded-full flex items-center justify-center">
                    <PlusCircle className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="text-lg font-medium mb-2">No other expenses found</p>
                  <p className="text-sm">
                    {searchTerm 
                      ? 'Try a different search term or add a new expense'
                      : 'Add your first expense to get started!'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;