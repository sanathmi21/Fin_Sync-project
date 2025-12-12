// frontend/src/pages/AddExpenses-business.jsx
import React, { useState, useEffect } from 'react';

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
  const [currentDate, setCurrentDate] = useState(new Date());

  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [incForm, setIncForm] = useState({ date: '', unitAmount: '', quantity: '1' });
  const [expForm, setExpForm] = useState({ date: '', category: '', name: '', amount: '' });

  const [loading, setLoading] = useState(false);

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  const totalIncAmount = (Number(incForm.unitAmount) || 0) * (Number(incForm.quantity) || 0);

  const API_URL = 'http://localhost:5000';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Attach token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // helper to read error responses
  const parseJsonSafe = async (res) => {
    try { return await res.json(); } catch { return null; }
  };

  //FETCH DATA
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

  //FETCH TOTALS
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
  }, []);

  //INCOME 
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

  // EXPENSE
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

  // DELETE
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

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111] text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans pb-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 mt-8 flex flex-col gap-8">
        {/* SUMMARY */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-8 border border-gray-200 dark:border-gray-800 shadow-md relative">
          <div className="absolute top-6 right-6 text-gray-400 cursor-pointer hover:text-green-500 hover:rotate-180 transition duration-500" 
          onClick={() => { 
            const now = new Date();
            const oldMonth = currentDate.getMonth();
            const oldYear = currentDate.getFullYear();

            const newMonth = now.getMonth();
            const newYear = now.getFullYear();

            // Prevent redundant refreshes
            if (oldMonth === newMonth && oldYear === newYear) {
              alert("Please click at the end of the month");
              return;
            }

            // Update date to current
            setCurrentDate(now);
            setIncomes([]);
            setExpenses([]);

            // Fetch new month data
            fetchData();
            fetchTotals();
           }}>
            <RefreshIcon />
          </div>
          <h2 className="text-center text-3xl font-bold mb-8 text-gray-800 dark:text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex flex-col sm:flex-row justify-around items-center gap-6">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mb-1">Total Income</p>
              <p className="text-green-600 dark:text-green-500 text-3xl font-bold">Rs. {totalIncome.toLocaleString()}</p>
            </div>
            <div className="hidden sm:block h-16 w-px bg-gray-300 dark:bg-gray-700"></div>
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mb-1">Total Expenses</p>
              <p className="text-yellow-600 dark:text-yellow-500 text-3xl font-bold">Rs. {totalExpense.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* INCOME SECTION */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-md">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="text-green-500"><TrendingUpIcon /></div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Income</h3>
          </div>

          {/* INCOME FORM */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-8 bg-gray-50 dark:bg-[#252525] p-4 rounded-lg">
            <div className="md:col-span-3">
              <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold mb-2 ml-1">DATE</label>
              <input type="date" className="w-full h-12 bg-white dark:bg-[#111] border border-gray-300 dark:border-gray-700 rounded-lg px-4 text-gray-900 dark:text-white focus:border-green-500 outline-none transition" value={incForm.date} onChange={e => setIncForm({...incForm, date: e.target.value})} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold mb-2 ml-1">UNIT AMOUNT</label>
              <input type="number" placeholder="0" className="w-full h-12 bg-white dark:bg-[#111] border border-gray-300 dark:border-gray-700 rounded-lg px-4 text-gray-900 dark:text-white focus:border-green-500 outline-none transition" value={incForm.unitAmount} onChange={e => setIncForm({...incForm, unitAmount: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold mb-2 ml-1">QTY</label>
              <input type="number" placeholder="1" className="w-full h-12 bg-white dark:bg-[#111] border border-gray-300 dark:border-gray-700 rounded-lg px-4 text-center text-gray-900 dark:text-white focus:border-green-500 outline-none transition" value={incForm.quantity} onChange={e => setIncForm({...incForm, quantity: e.target.value})} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold mb-2 ml-1">TOTAL</label>
              <div className="w-full h-12 bg-gray-200 dark:bg-[#333] border border-gray-300 dark:border-gray-600 rounded-lg px-4 flex items-center text-gray-600 dark:text-gray-300 font-bold">Rs. {totalIncAmount.toLocaleString()}</div>
            </div>
            <div className="md:col-span-1 flex justify-center">
              <button onClick={handleAddIncome} className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition transform active:scale-95"><PlusIcon /></button>
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
                {incomes.map((inc) => (
                  <tr key={inc.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#252525] transition">
                    <td className="py-4 px-4 text-gray-800 dark:text-gray-300">{new Date(inc.date).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-center text-gray-500">{inc.unit ? Number(inc.unit).toLocaleString() : '-'}</td>
                    <td className="py-4 px-4 text-center text-gray-500">{inc.qty || '-'}</td>
                    <td className="py-4 px-4 text-right font-bold text-green-600 dark:text-green-500">{Number(inc.amount).toLocaleString()}</td>
                    <td className="py-4 px-4 text-center">
                      <button onClick={() => handleDelete('income', inc.id)} className="text-gray-400 hover:text-red-500 transition"><TrashIcon /></button>
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

          {/* EXPENSE FORM */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-8 bg-gray-50 dark:bg-[#252525] p-4 rounded-lg">
            <div className="md:col-span-3">
              <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold mb-2 ml-1">DATE</label>
              <input type="date" className="w-full h-12 bg-white dark:bg-[#111] border border-gray-300 dark:border-gray-700 rounded-lg px-4 text-gray-900 dark:text-white focus:border-yellow-500 outline-none transition" value={expForm.date} onChange={e => setExpForm({...expForm, date: e.target.value})} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold mb-2 ml-1">CATEGORY</label>
              <input type="text" placeholder="e.g. Transport" className="w-full h-12 bg-white dark:bg-[#111] border border-gray-300 dark:border-gray-700 rounded-lg px-4 text-gray-900 dark:text-white focus:border-yellow-500 outline-none transition" value={expForm.category} onChange={e => setExpForm({...expForm, category: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold mb-2 ml-1">NAME</label>
              <input type="text" placeholder="e.g. Uber" className="w-full h-12 bg-white dark:bg-[#111] border border-gray-300 dark:border-gray-700 rounded-lg px-4 text-gray-900 dark:text-white focus:border-yellow-500 outline-none transition" value={expForm.name} onChange={e => setExpForm({...expForm, name: e.target.value})} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-gray-500 dark:text-gray-400 text-xs font-bold mb-2 ml-1">AMOUNT</label>
              <input type="number" placeholder="0" className="w-full h-12 bg-white dark:bg-[#111] border border-gray-300 dark:border-gray-700 rounded-lg px-4 text-gray-900 dark:text-white focus:border-yellow-500 outline-none transition" value={expForm.amount} onChange={e => setExpForm({...expForm, amount: e.target.value})} />
            </div>
            <div className="md:col-span-1 flex justify-center">
              <button onClick={handleAddExpense} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold p-3 rounded-full shadow-lg transition transform active:scale-95"><PlusIcon /></button>
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
                {expenses.map((exp) => (
                  <tr key={exp.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#252525] transition">
                    <td className="py-4 px-4 text-gray-800 dark:text-gray-300">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{exp.category}</td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{exp.name}</td>
                    <td className="py-4 px-4 text-right font-bold text-yellow-600 dark:text-yellow-500">{Number(exp.amount).toLocaleString()}</td>
                    <td className="py-4 px-4 text-center">
                      <button onClick={() => handleDelete('expense', exp.id)} className="text-gray-400 hover:text-red-500 transition"><TrashIcon /></button>
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