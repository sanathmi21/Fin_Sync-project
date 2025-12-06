import express from 'express';
import { 
  addExpense, 
  getExpenses, 
  getHighPriorityExpenses 
} from '../controllers/expenseController.js';

const router = express.Router();

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

export default router;