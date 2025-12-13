import {pool} from '../db.js';
import Income from '../models/Income.js';
import Expense from '../models/Expense.js';

// @desc    Add new income
// @route   POST /api/income
export const addIncome = async (req, res) => {
  console.log('Add Income Request:', req.body);
  
  try {
    const { name, amount, date } = req.body;

    // Validation
    if (!name || !amount || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, amount, date'
      });
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    // Use the authenticated user's ID from JWT token
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated. Please login again.'
      });
    }

    const userId = req.user.id;
    
    console.log(`Creating income for UserID: ${userId}`);

    // Use Income model to create income
    const incomeData = {
      UserID: userId,
      In_Name: name,
      In_Date: date,
      In_Amount: parseFloat(amount)
    };

    const newIncome = await Income.create(incomeData);
    console.log('Income created successfully:', newIncome);

    res.status(201).json({
      success: true,
      message: 'Income added successfully!',
      data: newIncome
    });

  } catch (error) {
    console.error('Error adding income:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while adding income',
      error: error.message
    });
  }
};

// @desc    Get all income for user
// @route   GET /api/income
export const getIncome = async (req, res) => {
  console.log('Get Income Request');
  
  try {
    // Use the authenticated user's ID from JWT token
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated. Please login again.'
      });
    }

    const userId = req.user.id;
    
    console.log(`Fetching income for UserID: ${userId}`);

    // Use Income model to get income
    const incomeRecords = await Income.getAllByUser(userId);

    console.log(`Found ${incomeRecords.length} income records for user ${userId}`);

    res.status(200).json({
      success: true,
      count: incomeRecords.length,
      data: incomeRecords
    });
  } catch (error) {
    console.error('Error getting income:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching income',
      error: error.message
    });
  }
};

// @desc    Delete income
// @route   DELETE /api/income/:id
export const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Use the authenticated user's ID from JWT token
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated. Please login again.'
      });
    }

    const userId = req.user.id;

    // Use Income model to delete income
    const deletedIncome = await Income.delete(id, userId);

    res.status(200).json({
      success: true,
      message: 'Income deleted successfully',
      data: deletedIncome
    });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while deleting income',
      error: error.message
    });
  }
};

// @desc    Update income
// @route   PUT /api/income/:id
export const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, date } = req.body;

    // Use the authenticated user's ID from JWT token
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated. Please login again.'
      });
    }

    const userId = req.user.id;

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.In_Name = name;
    if (amount !== undefined) updateData.In_Amount = amount;
    if (date !== undefined) updateData.In_Date = date;

    // Use Income model to update income
    const updatedIncome = await Income.update(id, userId, updateData);

    res.status(200).json({
      success: true,
      message: 'Income updated successfully',
      data: updatedIncome
    });
  } catch (error) {
    console.error('Error updating income:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating income',
      error: error.message
    });
  }
};

// @desc    Get financial summary
// @route   GET /api/income/summary
export const getFinancialSummary = async (req, res) => {
  try {
    // Use the authenticated user's ID from JWT token
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated. Please login again.'
      });
    }

    const userId = req.user.id;
    
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Calculate totals using models
    const totalIncome = await Income.getTotalByMonth(userId, currentMonth, currentYear);
    const totalExpenses = await Expense.getTotalByMonth(userId, currentMonth, currentYear);
    const balance = totalIncome - totalExpenses;
    
    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        balance,
        currentMonth: now.toLocaleString('default', { month: 'long', year: 'numeric' })
      }
    });
    
  } catch (error) {
    console.error('Error getting financial summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching financial summary',
      error: error.message
    });
  }
};

// @desc    Get detailed financial statistics
// @route   GET /api/income/statistics
export const getFinancialStatistics = async (req, res) => {
  try {
    // Use the authenticated user's ID from JWT token
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated. Please login again.'
      });
    }

    const userId = req.user.id;
    
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Get detailed statistics
    const incomeStats = await Income.getStatistics(userId, currentMonth, currentYear);
    const expensesByCategory = await Expense.getByCategoryForMonth(userId, currentMonth, currentYear);
    const totalExpenses = expensesByCategory.reduce((sum, cat) => sum + parseFloat(cat.total_amount), 0);
    const balance = incomeStats.total_amount - totalExpenses;
    
    res.status(200).json({
      success: true,
      data: {
        incomeStats,
        expensesByCategory,
        totalExpenses,
        totalIncome: incomeStats.total_amount,
        balance,
        currentMonth: now.toLocaleString('default', { month: 'long', year: 'numeric' })
      }
    });
    
  } catch (error) {
    console.error('Error getting financial statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching financial statistics',
      error: error.message
    });
  }
};

// @desc    Search income
// @route   GET /api/income/search
export const searchIncome = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search term'
      });
    }

    // Use the authenticated user's ID from JWT token
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated. Please login again.'
      });
    }

    const userId = req.user.id;

    // Use Income model to search income
    const incomeRecords = await Income.search(userId, q);

    res.status(200).json({
      success: true,
      count: incomeRecords.length,
      data: incomeRecords
    });
  } catch (error) {
    console.error('Error searching income:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching income',
      error: error.message
    });
  }
};
