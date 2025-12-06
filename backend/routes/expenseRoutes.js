const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

// @route   POST /api/expenses
// @desc    Add new expense
// @access  Private
router.post('/', expenseController.addExpense);

// @route   GET /api/expenses
// @desc    Get all expenses for user
// @access  Private
router.get('/', expenseController.getExpenses);

// @route   GET /api/expenses/high-priority
// @desc    Get high priority expenses
// @access  Private
router.get('/high-priority', expenseController.getHighPriorityExpenses);

module.exports = router;