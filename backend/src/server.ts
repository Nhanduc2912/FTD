import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import receiptRoutes from './routes/receiptRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import expenseRoutes from './routes/expenseRoutes';
import adminRoutes from './routes/adminRoutes';
import { startCronJobs } from './jobs/cron';
import { authLimiter, apiLimiter } from './middleware/rateLimiter';

dotenv.config();

// Connect to MongoDB
connectDB();

// Start Background Workers
startCronJobs();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security & Parsing ──────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ── Rate Limiting ───────────────────────────────────────────────────────────
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter); // Stricter limit on auth endpoints

// ── Static Files ────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/admin', adminRoutes);

// ── Health Check ─────────────────────────────────────────────────────────────
import mongoose from 'mongoose';
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: '1.0.0',
  });
});

app.get('/', (_req, res) => {
  res.send('FTD API đang chạy...');
});

app.listen(PORT, () => {
  console.log(`Server FTD đang chạy tại http://localhost:${PORT}`);
});
