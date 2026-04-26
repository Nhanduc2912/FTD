import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Receipt } from '../models/Receipt';

// Get all receipts for a user
export const getReceipts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const receipts = await Receipt.find({ userId: req.user!._id }).sort({ createdAt: -1 });
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Create a new receipt
export const createReceipt = async (req: AuthRequest, res: Response): Promise<void> => {
  const { storeName, purchaseDate, totalAmount, imageUrl, expiryDate, notes } = req.body;

  try {
    const receipt = new Receipt({
      userId: req.user!._id,
      storeName,
      purchaseDate,
      totalAmount,
      imageUrl,
      expiryDate,
      notes,
    });

    const createdReceipt = await receipt.save();
    res.status(201).json(createdReceipt);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Get single receipt
export const getReceiptById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const receipt = await Receipt.findById(req.params.id);

    if (receipt && receipt.userId.toString() === req.user?._id.toString()) {
      res.json(receipt);
    } else {
      res.status(404).json({ message: 'Receipt not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Delete a receipt
export const deleteReceipt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const receipt = await Receipt.findById(req.params.id);

    if (receipt && receipt.userId.toString() === req.user?._id.toString()) {
      await receipt.deleteOne();
      res.json({ message: 'Receipt removed' });
    } else {
      res.status(404).json({ message: 'Receipt not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
