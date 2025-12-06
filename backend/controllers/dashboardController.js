import pool from '../config/database.js';

export const getDashboardData = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    // Get total income
    const incomeResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total_income 
       FROM income 
       WHERE user_id = $1 AND month = $2 AND year = $3`,
      [req.user.id, currentMonth, currentYear]
    );

    // Get total expenses
    const expensesResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total_expenses 
       FROM expenses 
       WHERE user_id = $1 AND month = $2 AND year = $3`,
      [req.user.id, currentMonth, currentYear]
    );

    // Get expenses by category
    const categoryResult = await pool.query(
      `SELECT 
        category,
        SUM(amount) as total_amount
       FROM expenses 
       WHERE user_id = $1 AND month = $2 AND year = $3
       GROUP BY category
       ORDER BY total_amount DESC`,
      [req.user.id, currentMonth, currentYear]
    );

    const totalIncome = parseFloat(incomeResult.rows[0].total_income);
    const totalExpenses = parseFloat(expensesResult.rows[0].total_expenses);
    const totalBalance = totalIncome - totalExpenses;

    
    const colorMap = {
      'Factory Rent': '#D30000',
      'Employees Salary': '#00B600',
      'Investment': '#EFB506',
      'Material Procurement': '#125607',
      'Training': '#000000',
      'Maintainence': '#FFFFFF',
      'Entertainment': '#FF6B6B',
      'Food': '#4ECDC4',
      'Travel': '#45B7D1',
      'Utilities': '#96CEB4',
      'Other': '#DDA15E'
    };

    const expensesByCategory = categoryResult.rows.map(row => ({
      name: row.category,
      value: parseFloat(row.total_amount),
      color: colorMap[row.category] || '#888888',
      percentage: totalExpenses > 0 ? Math.round((parseFloat(row.total_amount) / totalExpenses) * 100) : 0
    }));

    res.json({
      totalIncome,
      totalExpenses,
      totalBalance,
      expenses: expensesByCategory,
      month: currentMonth,
      year: currentYear
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};