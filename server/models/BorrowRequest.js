const mongoose = require("mongoose");

// Step 1: Blueprint for borrowing requests
const borrowRequestSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    itemImage: {
      type: String,
      default: "📦",
    },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    borrowerName: {
      type: String,
      required: true,
    },
    borrowerPhone: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    numberOfDays: {
      type: Number,
      required: true,
      min: 1,
    },
    pricePerDay: {
      type: Number,
      required: true,
    },
    rentalAmount: {
      type: Number,
      required: true,
    },
    securityDeposit: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    additionalDetails: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "Pending", // Possible values: Pending, Approved, Rejected, Completed
    },
    paymentStatus: {
      type: String,
      default: "Pending", // Possible values: Pending, Paid
    },
  },
  {
    timestamps: true,
  }
);

// Step 2: Create model
const BorrowRequest = mongoose.model("BorrowRequest", borrowRequestSchema);

// Step 3: Export model
module.exports = BorrowRequest;
