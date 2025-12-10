import express from 'express';
import { 
  addIncome, 
  getIncome, 
  deleteIncome, 
  getFinancialSummary,
  getFinancialStatistics,
  searchIncome,
  updateIncome
} from '../controllers/incomeController.js';

const router = express.Router();

router.post('/', addIncome);
router.get('/', getIncome);
router.delete('/:id', deleteIncome);
router.put('/:id', updateIncome);
router.get('/summary', getFinancialSummary);
router.get('/statistics', getFinancialStatistics);
router.get('/search', searchIncome);

export default router;