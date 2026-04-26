import mongoose, { Document, Schema } from 'mongoose';

export interface IReceipt extends Document {
  userId: mongoose.Types.ObjectId;
  storeName: string;
  purchaseDate: Date;
  totalAmount: number;
  imageUrl: string;
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

export const Receipt = mongoose.model<IReceipt>('Receipt', ReceiptSchema);
