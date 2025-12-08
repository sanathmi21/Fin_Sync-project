import express from 'express';
import { addIncome, getIncome, deleteIncome, getFinancialSummary } from '../controllers/incomeController.js';

const router = express.Router();

router.post('/', addIncome);
router.get('/', getIncome);
router.delete('/:id', deleteIncome);
router.get('/summary', getFinancialSummary);

export default router;