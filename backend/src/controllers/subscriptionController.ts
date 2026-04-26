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

  try {
    const subscription = new Subscription({
      userId: req.user!._id,
      serviceName,
      cost,
      billingCycle,
      nextBillingDate,
      trialEndsAt,
      reminderDaysBefore,
      isActive,
    });

    const createdSubscription = await subscription.save();
    res.status(201).json(createdSubscription);
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
      subscription.serviceName = req.body.serviceName || subscription.serviceName;
      subscription.cost = req.body.cost || subscription.cost;
      subscription.billingCycle = req.body.billingCycle || subscription.billingCycle;
      subscription.nextBillingDate = req.body.nextBillingDate || subscription.nextBillingDate;
      subscription.trialEndsAt = req.body.trialEndsAt || subscription.trialEndsAt;
      subscription.reminderDaysBefore = req.body.reminderDaysBefore || subscription.reminderDaysBefore;
      if (req.body.isActive !== undefined) {
        subscription.isActive = req.body.isActive;
      }

      const updatedSubscription = await subscription.save();
      res.json(updatedSubscription);
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
