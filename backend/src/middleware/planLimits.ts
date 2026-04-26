import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { Receipt } from '../models/Receipt';
import { Subscription } from '../models/Subscription';

// Free plan limits
const FREE_RECEIPT_LIMIT = 50;
const FREE_SUB_LIMIT = 10;

/** Block receipt creation for Free users who hit the 50-receipt cap */
export const checkReceiptLimit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.user!.plan === 'pro') return next();
  const count = await Receipt.countDocuments({ userId: req.user!._id });
  if (count >= FREE_RECEIPT_LIMIT) {
    res.status(403).json({
      code: 'LIMIT_REACHED',
      limit: FREE_RECEIPT_LIMIT,
      message: `Free plan allows up to ${FREE_RECEIPT_LIMIT} receipts. Upgrade to Pro for unlimited storage.`,
    });
    return;
  }
  next();
};

/** Block subscription creation for Free users who hit the 10-sub cap */
export const checkSubscriptionLimit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.user!.plan === 'pro') return next();
  const count = await Subscription.countDocuments({ userId: req.user!._id });
  if (count >= FREE_SUB_LIMIT) {
    res.status(403).json({
      code: 'LIMIT_REACHED',
      limit: FREE_SUB_LIMIT,
      message: `Free plan allows up to ${FREE_SUB_LIMIT} subscriptions. Upgrade to Pro for unlimited tracking.`,
    });
    return;
  }
  next();
};

/** Only allow Pro users to access a route */
export const requirePro = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user!.plan !== 'pro') {
    res.status(403).json({
      code: 'UPGRADE_REQUIRED',
      message: 'This feature requires a Pro plan.',
    });
    return;
  }
  next();
};
