import express from 'express';
import {
  getSubscriptions,
  createSubscription,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
} from '../controllers/subscriptionController';
import { protect } from '../middleware/authMiddleware';
import { checkSubscriptionLimit } from '../middleware/planLimits';

const router = express.Router();

router.route('/')
  .get(protect, getSubscriptions)
  .post(protect, checkSubscriptionLimit, createSubscription); // P3: Free tier gate

router.route('/:id')
  .get(protect, getSubscriptionById)
  .put(protect, updateSubscription)
  .delete(protect, deleteSubscription);

export default router;
