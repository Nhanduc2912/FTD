import mongoose, { Document, Schema } from 'mongoose';

export type ReceiptCategory = 'Electronics' | 'Appliances' | 'Clothing' | 'Food' | 'Services' | 'Health' | 'Other';

export interface IReceipt extends Document {
  userId: mongoose.Types.ObjectId;
  storeName: string;
  purchaseDate: Date;
  totalAmount: number;
  imageUrl: string;
  category: ReceiptCategory;
  expiryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReceiptSchema = new Schema<IReceipt>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    storeName: {
      type: String,
      required: true,
      trim: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Electronics', 'Appliances', 'Clothing', 'Food', 'Services', 'Health', 'Other'],
      default: 'Other',
    },
    expiryDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: user's receipts sorted by purchase date
ReceiptSchema.index({ userId: 1, purchaseDate: -1 });

export const Receipt = mongoose.model<IReceipt>('Receipt', ReceiptSchema);
