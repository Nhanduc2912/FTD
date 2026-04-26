import express from 'express';
import { getSubscriptions, createSubscription, getSubscriptionById, updateSubscription, deleteSubscription } from '../controllers/subscriptionController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getSubscriptions).post(protect, createSubscription);
router.route('/:id').get(protect, getSubscriptionById).put(protect, updateSubscription).delete(protect, deleteSubscription);

export default router;
