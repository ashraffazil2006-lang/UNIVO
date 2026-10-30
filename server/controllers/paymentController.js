const Payment = require("../models/Payment");
const BorrowRequest = require("../models/BorrowRequest");

// 1. PROCESS DEMO PAYMENT
async function processDemoPayment(req, res) {
  try {
    const { requestId, paymentMethod } = req.body;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid borrow request ID.",
      });
    }

    // Find the borrow request
    const request = await BorrowRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Borrow request not found.",
      });
    }

    // Must be the borrower making the payment
    if (request.borrower.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only make payments for your own requests.",
      });
    }

    // Must be approved before paying
    if (request.status !== "Approved") {
      return res.status(400).json({
        success: false,
        message: "You can only pay for requests that have been Approved by the owner.",
      });
    }

    // Check if already paid
    if (request.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "This request has already been paid for.",
      });
    }

    // Generate a simple demo transaction ID (e.g. UNIVO-TXN-1730278...)
    const transactionId = `UNIVO-TXN-${Date.now()}`;

    // Create Payment record
    const payment = await Payment.create({
      borrowRequest: request._id,
      item: request.item,
      itemName: request.itemName,
      payer: req.user.id,
      payerName: req.user.name,
      rentalAmount: request.rentalAmount,
      securityDeposit: request.securityDeposit,
      totalAmount: request.totalAmount,
      paymentMethod: paymentMethod || "Demo UPI / Card",
      paymentStatus: "Completed",
      transactionId: transactionId,
    });

    // Update request payment status to "Paid"
    request.paymentStatus = "Paid";
    await request.save();

    return res.status(201).json({
      success: true,
      message: "Demo payment completed successfully!",
      payment: payment,
    });
  } catch (error) {
    console.error("Payment error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error processing demo payment.",
    });
  }
}

// 2. GET USER'S PAYMENT HISTORY
async function getPaymentHistory(req, res) {
  try {
    const payments = await Payment.find({ payer: req.user.id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      payments: payments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching payment history.",
    });
  }
}

module.exports = {
  processDemoPayment,
  getPaymentHistory,
};
