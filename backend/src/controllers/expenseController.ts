import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Expense } from '../models/Expense';

// GET /api/expenses – list with optional month filter
export const getExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { month, year } = req.query;
    const filter: any = { userId: req.user!._id };

    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end   = new Date(Number(year), Number(month), 1);
      filter.date = { $gte: start, $lt: end };
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// GET /api/expenses/summary – total + by-category for current month
export const getExpenseSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const expenses = await Expense.find({
      userId: req.user!._id,
      date: { $gte: start, $lt: end },
    });

    const total = expenses.reduce((s, e) => s + e.amount, 0);

    // Group by category
    const byCategory: Record<string, number> = {};
    expenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    res.json({ total, byCategory, count: expenses.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// POST /api/expenses
export const createExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  const { amount, category, description, date, currency } = req.body;

  // Validation
  if (!description || description.trim().length < 2) {
    res.status(400).json({ message: 'Description is required (min 2 characters)' }); return;
  }
  const amt = Number(amount);
  if (isNaN(amt) || amt <= 0) {
    res.status(400).json({ message: 'Amount must be a positive number' }); return;
  }
  if (!date || isNaN(Date.parse(date))) {
    res.status(400).json({ message: 'A valid date is required' }); return;
  }

  try {
    const expense = await Expense.create({
      userId: req.user!._id,
      amount: amt,
      category: category || 'Other',
      description: description.trim(),
      date,
      currency: (currency || 'USD').toUpperCase().slice(0, 3),
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// PUT /api/expenses/:id
export const updateExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense || expense.userId.toString() !== req.user!._id.toString()) {
      res.status(404).json({ message: 'Expense not found' }); return;
    }
    const { amount, category, description, date, currency } = req.body;
    if (amount !== undefined) expense.amount = Number(amount);
    if (category)    expense.category    = category;
    if (description) expense.description = description.trim();
    if (date)        expense.date        = date;
    if (currency)    expense.currency    = currency.toUpperCase().slice(0, 3);
    const updated = await expense.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// DELETE /api/expenses/:id
export const deleteExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense || expense.userId.toString() !== req.user!._id.toString()) {
      res.status(404).json({ message: 'Expense not found' }); return;
    }
    await expense.deleteOne();
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
