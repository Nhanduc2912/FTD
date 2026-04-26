import { Router } from 'express';
import {
  createReceipt,
  getReceipts,
  getReceiptById,
  deleteReceipt,
} from '../controllers/receiptController';
import { protect } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';
import { checkReceiptLimit } from '../middleware/planLimits';

const router = Router();

// All receipt routes require authentication
router.use(protect);

router.route('/')
  .get(getReceipts)
  .post(checkReceiptLimit, upload.single('receiptImage'), createReceipt); // P3: Free tier gate

router.route('/:id')
  .get(getReceiptById)
  .delete(deleteReceipt);

export default router;
