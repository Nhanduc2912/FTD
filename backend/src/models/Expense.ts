import mongoose, { Document, Schema } from 'mongoose';

export type ExpenseCategory =
  | 'Food & Drink'
  | 'Transport'
  | 'Entertainment'
  | 'Shopping'
  | 'Health'
  | 'Utilities'
  | 'Education'
  | 'Travel'
  | 'Other';

export interface IExpense extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: Date;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ['Food & Drink', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Utilities', 'Education', 'Travel', 'Other'],
      default: 'Other',
    },
    description: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    currency: { type: String, default: 'USD', maxlength: 3 },
  },
  { timestamps: true }
);

// Compound index: user's expenses sorted by date (most common query pattern)
ExpenseSchema.index({ userId: 1, date: -1 });

export const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema);
