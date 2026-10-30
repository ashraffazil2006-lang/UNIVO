const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

// Import all routes
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const borrowRoutes = require("./routes/borrowRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/borrow", borrowRoutes);
app.use("/api/payments", paymentRoutes);

// Health check test route
app.get("/", (req, res) => {
  res.send("UNIVO Backend is running smoothly!");
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`UNIVO Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
