import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Subscription } from '../models/Subscription';

// Get all subscriptions for a user
export const getSubscriptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subscriptions = await Subscription.find({ userId: req.user!._id }).sort({ nextBillingDate: 1 });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Create a new subscription
export const createSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  const { serviceName, cost, billingCycle, nextBillingDate, trialEndsAt, reminderDaysBefore, isActive } = req.body;

  // ─── Validation ──────────────────────────────────────────────
  if (!serviceName || serviceName.trim().length < 2) {
    res.status(400).json({ message: 'Service name is required (min 2 characters)' });
    return;
  }
  const costNum = Number(cost);
  if (cost === undefined || cost === null || cost === '' || isNaN(costNum) || costNum < 0) {
    res.status(400).json({ message: 'Cost must be a valid non-negative number' });
    return;
  }
  const validCycles = ['weekly', 'monthly', 'yearly'];
  if (!billingCycle || !validCycles.includes(billingCycle)) {
    res.status(400).json({ message: 'Billing cycle must be weekly, monthly, or yearly' });
    return;
  }
  if (!nextBillingDate || isNaN(Date.parse(nextBillingDate))) {
    res.status(400).json({ message: 'A valid next billing date is required' });
    return;
  }
  const reminder = reminderDaysBefore !== undefined ? Number(reminderDaysBefore) : 1;
  if (isNaN(reminder) || reminder < 1) {
    res.status(400).json({ message: 'Reminder days must be at least 1' });
    return;
  }
  // ────────────────────────────────────────────────────────────────

  try {
    const subscription = await Subscription.create({
      userId: req.user!._id,
      serviceName: serviceName.trim(),
      cost: costNum,
      billingCycle,
      nextBillingDate,
      trialEndsAt: trialEndsAt || undefined,
      reminderDaysBefore: reminder,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Get single subscription
export const getSubscriptionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (subscription && subscription.userId.toString() === req.user?._id.toString()) {
      res.json(subscription);
    } else {
      res.status(404).json({ message: 'Subscription not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Update a subscription
export const updateSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (subscription && subscription.userId.toString() === req.user?._id.toString()) {
      // ─── Fix: use ?? instead of || so cost=0 is valid ────────
      subscription.serviceName = req.body.serviceName ?? subscription.serviceName;
      subscription.cost = req.body.cost !== undefined ? Number(req.body.cost) : subscription.cost;
      subscription.billingCycle = req.body.billingCycle ?? subscription.billingCycle;
      subscription.nextBillingDate = req.body.nextBillingDate ?? subscription.nextBillingDate;
      subscription.trialEndsAt = req.body.trialEndsAt ?? subscription.trialEndsAt;
      subscription.reminderDaysBefore = req.body.reminderDaysBefore ?? subscription.reminderDaysBefore;
      if (req.body.isActive !== undefined) subscription.isActive = req.body.isActive;
      // ────────────────────────────────────────────────────────

      const updated = await subscription.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Subscription not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Delete a subscription
export const deleteSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (subscription && subscription.userId.toString() === req.user?._id.toString()) {
      await subscription.deleteOne();
      res.json({ message: 'Subscription removed' });
    } else {
      res.status(404).json({ message: 'Subscription not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
