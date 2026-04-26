import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import receiptRoutes from "./routes/receiptRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import { startCronJobs } from "./jobs/cron";

dotenv.config();

// Connect to MongoDB
connectDB();

// Start Background Workers
startCronJobs();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

app.get("/", (req, res) => {
  res.send("FTD API đang chạy...");
});

app.listen(PORT, () => {
  console.log(`Server FTD đang chạy tại http://localhost:${PORT}`);
});
