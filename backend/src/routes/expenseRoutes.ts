import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { getExpenses, getExpenseSummary, createExpense, updateExpense, deleteExpense } from '../controllers/expenseController';

const router = express.Router();

router.get('/', protect, getExpenses);
router.get('/summary', protect, getExpenseSummary);
router.post('/', protect, createExpense);
router.put('/:id', protect, updateExpense);
router.delete('/:id', protect, deleteExpense);

export default router;
