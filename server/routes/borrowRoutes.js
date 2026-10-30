const express = require("express");
const router = express.Router();

const {
  createBorrowRequest,
  getIncomingRequests,
  getMyBorrowings,
  updateRequestStatus,
} = require("../controllers/borrowController");

const authMiddleware = require("../middleware/authMiddleware");

// All borrow routes require the user to be logged in
router.use(authMiddleware);

router.post("/", createBorrowRequest);
router.get("/incoming", getIncomingRequests);
router.get("/my-borrowings", getMyBorrowings);
router.put("/:id/status", updateRequestStatus);

module.exports = router;
