import mongoose, { Document, Schema } from 'mongoose';

export type UserPlan = 'free' | 'pro';
export type SubscriptionStatus = 'trialing' | 'active' | 'canceled' | 'past_due';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name?: string;
  // ── Admin & Security ─────────────────────────────────────────────────────
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  failedLoginAttempts: number;
  lockUntil?: Date;
  // ── P3: Billing ──────────────────────────────────────────────────────────
  plan: UserPlan;
  trialEndsAt?: Date;
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  // ─────────────────────────────────────────────────────────────────────────
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
    // ── Admin & Security ───────────────────────────────────────────────────
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    // ── P3: Billing ────────────────────────────────────────────────────────
    plan: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free',
    },
    trialEndsAt: {
      type: Date,
    },
    subscriptionStatus: {
      type: String,
      enum: ['trialing', 'active', 'canceled', 'past_due'],
      default: 'trialing',
    },
    stripeCustomerId: {
      type: String,
    },
    stripeSubscriptionId: {
      type: String,
    },
    // ──────────────────────────────────────────────────────────────────────
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
