const mongoose = require("mongoose");

// Step 1: Define the blueprint (Schema) for an Item
const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "📦",
    },
    condition: {
      type: String,
      default: "Good",
    },
    location: {
      type: String,
      required: true,
    },
    pricePerDay: {
      type: Number,
      required: true,
      min: 1,
    },
    securityDeposit: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ownerName: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Step 2: Create the Mongoose model from the schema
const Item = mongoose.model("Item", itemSchema);

// Step 3: Export the model
module.exports = Item;
