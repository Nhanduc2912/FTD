import express from 'express';
import {
  getUsers,
  updateUser,
  toggleUserStatus,
  unlockUser,
  deleteUser,
  getBillingOverview,
  cancelUserSubscription,
  getSystemMetrics,
  getCronStatus,
  getSettings,
  updateSettings
} from '../controllers/adminController';
import { protect, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require auth and admin role
router.use(protect);
router.use(requireAdmin);

// User Management
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.patch('/users/:id/unlock', unlockUser);
router.delete('/users/:id', deleteUser);

// Billing & Subscriptions
router.get('/billing/overview', getBillingOverview);
router.post('/billing/cancel/:id', cancelUserSubscription);

// System Health & Logs
router.get('/health/metrics', getSystemMetrics);
router.get('/health/cron', getCronStatus);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
