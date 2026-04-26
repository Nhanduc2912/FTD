import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Expense } from '../models/Expense';

// GET /api/expenses – list with optional month filter + pagination
export const getExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { month, year, page, limit, all } = req.query;
    const filter: any = { userId: req.user!._id };

    // Month filter (ignored when all=true)
    if (month && year && all !== 'true') {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end   = new Date(Number(year), Number(month), 1);
      filter.date = { $gte: start, $lt: end };
    }

    // Pagination
    const pageNum  = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip     = (pageNum - 1) * limitNum;

    const [expenses, total] = await Promise.all([
      Expense.find(filter).sort({ date: -1 }).skip(skip).limit(limitNum),
      Expense.countDocuments(filter),
    ]);

    res.json({
      data: expenses,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      total,
    });
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

    const byCategory: Record<string, number> = {};
    expenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    res.json({ total, byCategory, count: expenses.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// GET /api/expenses/trend – last 6 months totals for chart
export const getExpenseTrend = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const expenses = await Expense.find({
      userId: req.user!._id,
      date: { $gte: sixMonthsAgo },
    });

    // Group by YYYY-MM
    const grouped: Record<string, number> = {};
    expenses.forEach(e => {
      const d   = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      grouped[key] = (grouped[key] || 0) + e.amount;
    });

    // Build 6-month array (fill missing months with 0)
    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      trend.push({ month: key, total: grouped[key] || 0 });
    }

    res.json(trend);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// POST /api/expenses
export const createExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  const { amount, category, description, date, currency } = req.body;

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
