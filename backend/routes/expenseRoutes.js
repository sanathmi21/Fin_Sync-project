import express from 'express';
import {
  addExpense,
  getExpenses,
  getHighPriorityExpenses,
  deleteExpense,
  searchExpenses 
} from '../controllers/expenseController.js';

const router = express.Router();

// All routes use the middleware from server.js that sets req.user

// @route   POST /api/expenses
// @desc    Add new expense
// @access  Private
router.post('/', addExpense);

// @route   GET /api/expenses
// @desc    Get all expenses for user
// @access  Private
router.get('/', getExpenses);

// @route   GET /api/expenses/high-priority
// @desc    Get high priority expenses
// @access  Private
router.get('/high-priority', getHighPriorityExpenses);

// @route   DELETE /api/expenses/:id
// @desc    Delete an expense
// @access  Private
router.delete('/:id', deleteExpense);

router.get('/search', searchExpenses);

export default router;