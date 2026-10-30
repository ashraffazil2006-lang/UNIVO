const express = require("express");
const router = express.Router();

const {
  processDemoPayment,
  getPaymentHistory,
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");

// All payment routes require authentication
router.use(authMiddleware);

router.post("/demo-pay", processDemoPayment);
router.get("/history", getPaymentHistory);

module.exports = router;
