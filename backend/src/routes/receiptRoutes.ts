import express from 'express';
import { getReceipts, createReceipt, getReceiptById, deleteReceipt } from '../controllers/receiptController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getReceipts).post(protect, createReceipt);
router.route('/:id').get(protect, getReceiptById).delete(protect, deleteReceipt);

export default router;
