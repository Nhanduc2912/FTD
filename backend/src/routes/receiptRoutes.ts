import { Router } from 'express';
import {
  createReceipt,
  getReceipts,
  getReceiptById,
  deleteReceipt,
} from '../controllers/receiptController';
import { protect } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

// All receipt routes require authentication
router.use(protect);

router.route('/')
  .get(getReceipts)
  .post(upload.single('receiptImage'), createReceipt);

router.route('/:id')
  .get(getReceiptById)
  .delete(deleteReceipt);

export default router;
