import express from 'express';
import { registerUser, loginUser, getMe, updateProfile, changePassword, deleteAccount } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.delete('/account', protect, deleteAccount); // P3: Danger Zone — requires password

export default router;
