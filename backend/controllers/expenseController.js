import Expense from '../models/Expense.js';

// Middleware to extract user ID from token (simplified for now)
const extractUserId = (req, res, next) => {
  // For testing, use a default user ID
  // In production, you should decode JWT token
  req.user = { id: 1, UserID: 1 }; // Use ID 1 for testing
  next();
};

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private
export const addExpense = async (req, res) => {
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

    // Get user ID - For now, use default or get from token
    const userId = req.user?.UserID || req.user?.id || 1; // Default to user 1 for testing

    console.log('Adding expense for user:', userId, 'Data:', req.body);

    // Create expense
    const newExpense = await Expense.addExpense(userId, {
      name,
      category,
      amount,
      date,
      description,
      highPriority
    });

    // Update balance
    await Expense.updateBalance(userId, date, parseFloat(amount));

    res.status(201).json({
      success: true,
      message: 'Expense added successfully!',
      data: newExpense
    });

  } catch (error) {
    console.error('❌ Error adding expense:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding expense',
      error: error.message
    });
  }
};

// @desc    Get all expenses for user
// @route   GET /api/expenses
// @access  Private
export const getExpenses = async (req, res) => {
  try {
    // Get user ID - For now, use default or get from token
    const userId = req.user?.UserID || req.user?.id || 1; // Default to user 1 for testing
    
    console.log('Fetching expenses for user:', userId);

    const expenses = await Expense.getUserExpenses(userId);

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    console.error('❌ Error getting expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expenses'
    });
  }
};

// @desc    Get high priority expenses
// @route   GET /api/expenses/high-priority
// @access  Private
export const getHighPriorityExpenses = async (req, res) => {
  try {
    // Get user ID - For now, use default or get from token
    const userId = req.user?.UserID || req.user?.id || 1; // Default to user 1 for testing

    const expenses = await Expense.getHighPriorityExpenses(userId);

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    console.error('❌ Error getting high priority expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching high priority expenses'
    });
  }
};