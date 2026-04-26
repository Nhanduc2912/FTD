import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import receiptRoutes from "./routes/receiptRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
