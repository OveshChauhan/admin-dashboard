// Defines the MongoDB user schema, roles, validation, and indexes used by the RBAC system.
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email."]
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["admin", "manager", "tenant"],
      default: "tenant",
      required: true,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    lastLoginAt: {
      type: Date,
      default: null
    },
    refreshTokenHash: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

userSchema.index({ name: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);
