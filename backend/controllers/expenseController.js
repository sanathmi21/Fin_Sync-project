import pool from '../db.js';
import Expense from '../models/Expense.js';

// @desc    Add new expense
// @route   POST /api/expenses
export const addExpense = async (req, res) => {
  console.log('📝 Add Expense Request:', req.body);
  
  try {
    const { name, category, amount, date, description, highPriority } = req.body;

    // Validation
    if (!name || !category || !amount || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, category, amount, date'
      });
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    // Get the first user from database
    const userResult = await pool.query('SELECT "UserID" FROM "Users" ORDER BY "UserID" LIMIT 1');
    
    if (userResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No users found. Please register first.'
      });
    }

    const userId = userResult.rows[0].UserID;
    
    console.log(`💰 Creating expense for UserID: ${userId}`);

    // Use Expense model to create expense
    const expenseData = {
      UserID: userId,
      Ex_Name: name,
      Category: category,
      Ex_Amount: parseFloat(amount),
      Ex_Date: date,
      Description: description || '',
      HighPriority: highPriority || false
    };

    const newExpense = await Expense.create(expenseData);
    console.log('✅ Expense created successfully:', newExpense);

    res.status(201).json({
      success: true,
      message: 'Expense added successfully!',
      data: newExpense
    });

  } catch (error) {
    console.error('❌ Error adding expense:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while adding expense',
      error: error.message
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the first user from database
    const userResult = await pool.query('SELECT "UserID" FROM "Users" ORDER BY "UserID" LIMIT 1');
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userId = userResult.rows[0].UserID;

    // Use Expense model to delete expense
    const deletedExpense = await Expense.delete(id, userId);

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
      data: deletedExpense
    });
  } catch (error) {
    console.error('❌ Error deleting expense:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while deleting expense',
      error: error.message
    });
  }
};

// @desc    Get all expenses for user
// @route   GET /api/expenses
export const getExpenses = async (req, res) => {
  console.log('📋 Get Expenses Request');
  
  try {
    // Get the first user from database
    const userResult = await pool.query('SELECT "UserID" FROM "Users" ORDER BY "UserID" LIMIT 1');
    
    if (userResult.rows.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const userId = userResult.rows[0].UserID;
    
    console.log(`📊 Fetching expenses for UserID: ${userId}`);

    // Use Expense model to get expenses
    const expenses = await Expense.getAllByUser(userId);

    console.log(`📊 Found ${expenses.length} expenses for user ${userId}`);

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    console.error('❌ Error getting expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expenses',
      error: error.message
    });
  }
};

// @desc    Get high priority expenses
// @route   GET /api/expenses/high-priority
export const getHighPriorityExpenses = async (req, res) => {
  try {
    // Get the first user from database
    const userResult = await pool.query('SELECT "UserID" FROM "Users" ORDER BY "UserID" LIMIT 1');
    
    if (userResult.rows.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const userId = userResult.rows[0].UserID;

    // Use Expense model to get high priority expenses
    const highPriorityExpenses = await Expense.getHighPriority(userId);

    res.status(200).json({
      success: true,
      count: highPriorityExpenses.length,
      data: highPriorityExpenses
    });
  } catch (error) {
    console.error('❌ Error getting high priority expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching high priority expenses'
    });
  }
};

// @desc    Search expenses
// @route   GET /api/expenses/search
export const searchExpenses = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search term'
      });
    }

    // Get the first user from database
    const userResult = await pool.query('SELECT "UserID" FROM "Users" ORDER BY "UserID" LIMIT 1');
    
    if (userResult.rows.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const userId = userResult.rows[0].UserID;

    // Use Expense model to search expenses
    const expenses = await Expense.search(userId, q);

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    console.error('❌ Error searching expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching expenses',
      error: error.message
    });
  }
};