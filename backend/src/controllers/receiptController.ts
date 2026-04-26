import { Response } from 'express';
import fs from 'fs';
import path from 'path';
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

// @desc  Create a new receipt
// @route POST /api/receipts
// @access Private
export const createReceipt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { storeName, purchaseDate, totalAmount, expiryDate, notes } = req.body;

    // ─── Validation ────────────────────────────────────────
    if (!storeName || storeName.trim().length < 2) {
      res.status(400).json({ message: 'Store name is required (min 2 characters)' });
      return;
    }
    if (!purchaseDate || isNaN(Date.parse(purchaseDate))) {
      res.status(400).json({ message: 'A valid purchase date is required' });
      return;
    }
    if (purchaseDate && new Date(purchaseDate) > new Date()) {
      res.status(400).json({ message: 'Purchase date cannot be in the future' });
      return;
    }
    const amount = Number(totalAmount);
    if (isNaN(amount) || amount < 0) {
      res.status(400).json({ message: 'Total amount must be a valid non-negative number' });
      return;
    }
    if (expiryDate && isNaN(Date.parse(expiryDate))) {
      res.status(400).json({ message: 'Warranty expiry date is invalid' });
      return;
    }
    if (expiryDate && new Date(expiryDate) < new Date(purchaseDate)) {
      res.status(400).json({ message: 'Warranty expiry date cannot be before purchase date' });
      return;
    }
    if (!req.file) {
      res.status(400).json({ message: 'Receipt image is required' });
      return;
    }
    // ──────────────────────────────────────────────────────

    const imageUrl = `/uploads/receipts/${req.file.filename}`;

    const receipt = await Receipt.create({
      userId: req.user!._id,
      storeName: storeName.trim(),
      purchaseDate,
      totalAmount: amount,
      imageUrl,
      expiryDate: expiryDate || undefined,
      notes: notes?.trim(),
    });

    res.status(201).json(receipt);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating receipt' });
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

// Delete a receipt (also removes the image file from disk)
export const deleteReceipt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const receipt = await Receipt.findById(req.params.id);

    if (receipt && receipt.userId.toString() === req.user?._id.toString()) {
      // ─── Clean up orphaned image file ──────────────────
      if (receipt.imageUrl) {
        const filePath = path.join(__dirname, '../../', receipt.imageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      // ────────────────────────────────────────────────────
      await receipt.deleteOne();
      res.json({ message: 'Receipt removed' });
    } else {
      res.status(404).json({ message: 'Receipt not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
