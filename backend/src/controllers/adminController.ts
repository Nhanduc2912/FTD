import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User, IUser } from '../models/User';
import { Setting } from '../models/Setting';
import { Expense } from '../models/Expense';
import { Receipt } from '../models/Receipt';
import { Subscription } from '../models/Subscription';
import { AuthRequest } from '../middleware/authMiddleware';

// ── Advanced User Management ───────────────────────────────────────────────

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const roleFilter = req.query.role as string;
    const statusFilter = req.query.status as string;

    const query: any = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }
    if (roleFilter) query.role = roleFilter;
    if (statusFilter) query.status = statusFilter;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      data: users,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, role, plan, subscriptionStatus } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { name, role, plan, subscriptionStatus } },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user._id.toString() === req.user?._id.toString()) {
      res.status(400).json({ message: 'Cannot suspend your own account' });
      return;
    }

    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();

    res.json({ message: `User status updated to ${user.status}`, user: { id: user._id, status: user.status } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const unlockUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { $set: { failedLoginAttempts: 0, lockUntil: undefined } },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ message: 'User account unlocked', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user._id.toString() === req.user?._id.toString()) {
      res.status(400).json({ message: 'Cannot delete your own account from here' });
      return;
    }

    // Cascade delete
    await Expense.deleteMany({ user: id });
    await Receipt.deleteMany({ user: id });
    await Subscription.deleteMany({ user: id });
    await user.deleteOne();

    res.json({ message: 'User and all related data deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Subscription & Billing ───────────────────────────────────────────────────

export const getBillingOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalUsers, proUsers, trialing, active, canceled, pastDue] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ plan: 'pro' }),
      User.countDocuments({ subscriptionStatus: 'trialing' }),
      User.countDocuments({ subscriptionStatus: 'active' }),
      User.countDocuments({ subscriptionStatus: 'canceled' }),
      User.countDocuments({ subscriptionStatus: 'past_due' })
    ]);

    res.json({
      totalUsers,
      proUsers,
      subscriptionStatus: {
        trialing,
        active,
        canceled,
        pastDue
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const cancelUserSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // In a real app, this would also call Stripe API to cancel
    user.subscriptionStatus = 'canceled';
    user.plan = 'free';
    await user.save();

    res.json({ message: 'User subscription canceled', user: { id: user._id, plan: user.plan, subscriptionStatus: user.subscriptionStatus } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── System Health & Logs ───────────────────────────────────────────────────

export const getSystemMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Mongoose db.stats()
    const dbStats = await mongoose.connection.db?.stats();
    
    // Basic node metrics
    const memoryUsage = process.memoryUsage();
    
    res.json({
      database: dbStats || {},
      server: {
        uptime: process.uptime(),
        memoryUsage,
        nodeVersion: process.version
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCronStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Since we don't store cron logs yet, we return static/mock info
    res.json({
      status: 'active',
      jobs: [
        { name: 'Subscription Reminders', schedule: '0 8 * * *', nextRun: new Date(new Date().setHours(8, 0, 0, 0) + 24 * 60 * 60 * 1000) }
      ]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Content & Settings ─────────────────────────────────────────────────────

export const getSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const settings = await Setting.find({});
    const settingsObject = settings.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    
    // Default fallback
    if (!settingsObject.maintenanceMode) settingsObject.maintenanceMode = false;
    if (!settingsObject.announcementBanner) settingsObject.announcementBanner = '';

    res.json(settingsObject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const updates = req.body;
    const keys = Object.keys(updates);

    const updatePromises = keys.map((key) => {
      return Setting.findOneAndUpdate(
        { key },
        { value: updates[key] },
        { upsert: true, new: true }
      );
    });

    await Promise.all(updatePromises);

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
