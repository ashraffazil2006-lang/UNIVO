const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfile,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// Public routes (anyone can access)
router.post("/register", register);
router.post("/login", login);

// Protected routes (user must have valid JWT token)
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;
