import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import { Receipt } from '../models/Receipt';
import { Subscription } from '../models/Subscription';
import { Expense } from '../models/Expense';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// Simple email regex validation
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password, name } = req.body;

  // ─── Validation ───────────────────────────────────────
  if (!email || !password || !name) {
    res.status(400).json({ message: 'Please provide name, email, and password' });
    return;
  }
  if (!isValidEmail(email)) {
    res.status(400).json({ message: 'Please provide a valid email address' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ message: 'Password must be at least 6 characters' });
    return;
  }
  if (name.trim().length < 2) {
    res.status(400).json({ message: 'Name must be at least 2 characters' });
    return;
  }
  // ──────────────────────────────────────────────────────

  try {
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ email: email.toLowerCase(), passwordHash, name: name.trim() });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        name: user.name,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Please provide email and password' });
    return;
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      res.json({
        _id: user._id,
        email: user.email,
        name: user.name,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc  Get current logged-in user profile
// @route GET /api/auth/me
// @access Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id).select('-passwordHash');
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.json({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      trialEndsAt: user.trialEndsAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc  Update profile name
// @route PUT /api/auth/profile
// @access Private
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name } = req.body;
  if (!name || name.trim().length < 2) {
    res.status(400).json({ message: 'Name must be at least 2 characters' });
    return;
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { name: name.trim() },
      { new: true }
    ).select('-passwordHash');
    res.json({ _id: user!._id, email: user!.email, name: user!.name });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc  Change password
// @route PUT /api/auth/password
// @access Private
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ message: 'Current and new passwords are required' });
    return;
  }
  if (newPassword.length < 6) {
    res.status(400).json({ message: 'New password must be at least 6 characters' });
    return;
  }
  try {
    const user = await User.findById(req.user!._id);
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      res.status(401).json({ message: 'Current password is incorrect' });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
// @desc  Delete account and all associated data
// @route DELETE /api/auth/account
// @access Private
export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  const { password } = req.body;
  if (!password) {
    res.status(400).json({ message: 'Password confirmation is required' });
    return;
  }
  try {
    const user = await User.findById(req.user!._id);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ message: 'Incorrect password' });
      return;
    }
    const userId = user._id;
    // Delete all user data atomically
    await Promise.all([
      Expense.deleteMany({ userId }),
      Receipt.deleteMany({ userId }),
      Subscription.deleteMany({ userId }),
    ]);
    await user.deleteOne();
    res.json({ message: 'Account and all data permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
