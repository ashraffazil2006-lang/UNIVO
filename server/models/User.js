const mongoose = require("mongoose");

// Step 1: Define the blueprint (Schema) for our User
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
  },
  {
    // Automatically adds createdAt and updatedAt dates
    timestamps: true,
  }
);

// Step 2: Create the Mongoose model from the schema
const User = mongoose.model("User", userSchema);

// Step 3: Export the model so other files can use it
module.exports = User;
