import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

// 🛠️ FIX 5: Add API base URL constant at the top
const API_BASE_URL = 'http://localhost:5000/api';

const AddExpense = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Food',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    highPriority: false
  });

  const [expenses, setExpenses] = useState([]);
  const [highPriorityExpenses, setHighPriorityExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Available categories
  const categories = [
    'Food', 'Transport', 'Entertainment', 'Shopping',
    'Bills', 'Healthcare', 'Education', 'Other'
  ];

  // Fetch existing expenses on component mount
  useEffect(() => {
    fetchExpenses();
    fetchHighPriorityExpenses();
  }, []);

  // 🛠️ FIX 5: Updated fetchExpenses function with logging
  const fetchExpenses = async () => {
    try {
      console.log('📞 Fetching expenses from:', `${API_BASE_URL}/expenses`);
      const response = await axios.get(`${API_BASE_URL}/expenses`);
      console.log('✅ Expenses response:', response.data);
      
      if (response.data.success) {
        setExpenses(response.data.data);
      } else {
        console.error('❌ Failed to fetch expenses:', response.data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching expenses:', error);
      console.error('Full error:', error.response?.data || error.message);
    }
  };

  // 🛠️ FIX 5: Updated fetchHighPriorityExpenses function
  const fetchHighPriorityExpenses = async () => {
    try {
      console.log('📞 Fetching high priority expenses from:', `${API_BASE_URL}/expenses/high-priority`);
      const response = await axios.get(`${API_BASE_URL}/expenses/high-priority`);
      console.log('✅ High priority expenses response:', response.data);
      
      if (response.data.success) {
        setHighPriorityExpenses(response.data.data);
      } else {
        console.error('❌ Failed to fetch high priority expenses:', response.data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching high priority expenses:', error);
      console.error('Full error:', error.response?.data || error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 🛠️ FIX 5: Updated handleSubmit function with logging and proper headers
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
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
      console.log('📤 Submitting expense to:', `${API_BASE_URL}/expenses`);
      console.log('📦 Expense data:', formData);
      
      const response = await axios.post(`${API_BASE_URL}/expenses`, formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Add expense response:', response.data);
      
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: 'Expense added successfully!'
        });
        
        // Reset form
        setFormData({
          name: '',
          category: 'Food',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
          highPriority: false
        });
        
        // Refresh expense lists
        fetchExpenses();
        fetchHighPriorityExpenses();
      }
    } catch (error) {
      console.error('❌ Error adding expense:', error);
      console.error('Full error:', error.response?.data || error.message);
      
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to add expense. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(expense =>
    expense.Ex_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.Category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHighPriorityExpenses = highPriorityExpenses.filter(expense =>
    expense.Ex_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.Category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Add Expense Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Add New Expense</h2>
                <PlusCircle className="w-8 h-8 text-[#EFB506]" />
              </div>

              {message.text && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Expense Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Rice, Pizza, Movie tickets..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#EFB506] focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                {/* Category and Amount Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#EFB506] focus:border-transparent outline-none bg-white"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#EFB506] focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#EFB506] focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Add notes about this expense..."
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#EFB506] focus:border-transparent outline-none resize-none"
                  />
                </div>

                {/* Priority Checkbox */}
                <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="highPriority"
                    name="highPriority"
                    checked={formData.highPriority}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-[#EFB506] rounded focus:ring-[#EFB506]"
                  />
                  <label htmlFor="highPriority" className="ml-3 flex-1">
                    <div className="font-medium text-gray-800">Mark as Priority Expense</div>
                    <div className="text-sm text-gray-500">High priority expenses will be highlighted</div>
                  </label>
                </div>

                {/* Submit Button */}
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

            {/* Add New Income Section (Matching your design) */}
            <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Add New Income</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00B600] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00B600] focus:border-transparent outline-none"
                  />
                </div>
                <button className="w-full py-3 px-4 bg-gradient-to-r from-[#00B600] to-[#009c00] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
                  Add Income
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Expense Lists */}
          <div className="lg:col-span-2">
            {/* Header with Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">January 2025</h3>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Today</div>
                  <div className="text-lg font-semibold text-gray-800">{new Date().toLocaleDateString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                  <div className="text-sm text-gray-600">Total Income</div>
                  <div className="text-2xl font-bold text-[#00B600]">Rs. 38,500</div>
                </div>
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
                  <div className="text-sm text-gray-600">Total Expenses</div>
                  <div className="text-2xl font-bold text-[#EFB506]">Rs. 16,200</div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search expenses..."
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#EFB506] focus:border-transparent outline-none"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* High Priority Expenses */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-red-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-[#D30000]" />
                  High Priority Expenses
                </h4>
                <span className="px-3 py-1 bg-red-100 text-[#D30000] text-sm font-medium rounded-full">
                  {filteredHighPriorityExpenses.length} items
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 rounded-l-xl">Category</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Amount</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Date</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Description</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 rounded-r-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredHighPriorityExpenses.map((expense) => (
                      <tr key={expense.ExpenseID} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            {expense.Category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {formatCurrency(expense.Ex_Amount)}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {formatDate(expense.Ex_Date)}
                        </td>
                        <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                          {expense.Description || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <button className="text-[#EFB506] hover:text-[#d4a000] font-medium text-sm">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Other Expenses */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-800">Other Expenses</h4>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                  {filteredExpenses.length} items
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 rounded-l-xl">Category</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Amount</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Date</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Description</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 rounded-r-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredExpenses.map((expense) => (
                      <tr key={expense.ExpenseID} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                            {expense.Category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {formatCurrency(expense.Ex_Amount)}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {formatDate(expense.Ex_Date)}
                        </td>
                        <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                          {expense.Description || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button className="text-[#00B600] hover:text-[#009c00] font-medium text-sm">
                              Edit
                            </button>
                            <button className="text-[#D30000] hover:text-[#b30000] font-medium text-sm">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;