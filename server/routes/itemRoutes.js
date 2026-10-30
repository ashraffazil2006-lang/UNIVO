const express = require("express");
const router = express.Router();

const {
  getAllItems,
  getItemById,
  createItem,
  getMyListings,
  deleteItem,
} = require("../controllers/itemController");

const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.get("/", getAllItems);

// Protected routes (require login)
router.get("/my-listings", authMiddleware, getMyListings);
router.get("/:id", getItemById);
router.post("/", authMiddleware, createItem);
router.delete("/:id", authMiddleware, deleteItem);

module.exports = router;
