const Expense = require('../models/Expense');

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private
exports.addExpense = async (req, res) => {
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

    const userId = req.user.id || 1; // For testing, replace with actual user ID from auth

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
    console.error('Error adding expense:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding expense',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all expenses for user
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    const userId = req.user.id || 1;
    const expenses = await Expense.getUserExpenses(userId);

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    console.error('Error getting expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expenses'
    });
  }
};

// @desc    Get high priority expenses
// @route   GET /api/expenses/high-priority
// @access  Private
exports.getHighPriorityExpenses = async (req, res) => {
  try {
    const userId = req.user.id || 1;
    const expenses = await Expense.getHighPriorityExpenses(userId);

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    console.error('Error getting high priority expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching high priority expenses'
    });
  }
};