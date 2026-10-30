const mongoose = require("mongoose");

// Step 1: Blueprint for demo payments
const paymentSchema = new mongoose.Schema(
  {
    borrowRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BorrowRequest",
      required: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    payerName: {
      type: String,
      required: true,
    },
    rentalAmount: {
      type: Number,
      required: true,
    },
    securityDeposit: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: "Demo Online Payment",
    },
    paymentStatus: {
      type: String,
      default: "Completed",
    },
    transactionId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Step 2: Create model
const Payment = mongoose.model("Payment", paymentSchema);

// Step 3: Export model
module.exports = Payment;
