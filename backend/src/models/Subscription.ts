import mongoose, { Document, Schema } from 'mongoose';

export type BillingCycle = 'weekly' | 'monthly' | 'yearly';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  serviceName: string;
  cost: number;
  billingCycle: BillingCycle;
  nextBillingDate: Date;
  trialEndsAt?: Date;
  reminderDaysBefore: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    billingCycle: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly'],
      required: true,
    },
    nextBillingDate: {
      type: Date,
      required: true,
    },
    trialEndsAt: {
      type: Date,
    },
    reminderDaysBefore: {
      type: Number,
      required: true,
      default: 1, // Number of days before billing to send reminder
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
