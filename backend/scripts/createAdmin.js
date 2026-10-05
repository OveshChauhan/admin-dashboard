// Creates the first production admin from one-time environment variables.
require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");

async function createInitialAdmin() {
  if (process.env.NODE_ENV !== "production") {
    throw new Error("Initial production admin creation requires NODE_ENV=production.");
  }

  const required = [
    "NODE_ENV",
    "MONGO_URI",
    "BOOTSTRAP_ADMIN_NAME",
    "BOOTSTRAP_ADMIN_EMAIL",
    "BOOTSTRAP_ADMIN_PASSWORD"
  ];
  const missing = required.filter(function (name) {
    return !process.env[name] || !process.env[name].trim();
  });

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  const passwordBytes = Buffer.byteLength(process.env.BOOTSTRAP_ADMIN_PASSWORD, "utf8");
  if (passwordBytes < 12 || passwordBytes > 72) {
    throw new Error("BOOTSTRAP_ADMIN_PASSWORD must be between 12 and 72 bytes.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  if (await User.exists({ role: "admin" })) {
    throw new Error("An admin account already exists. Refusing to create another bootstrap admin.");
  }

  const passwordHash = await bcrypt.hash(process.env.BOOTSTRAP_ADMIN_PASSWORD, 12);
  await User.create({
    name: process.env.BOOTSTRAP_ADMIN_NAME,
    email: process.env.BOOTSTRAP_ADMIN_EMAIL,
    passwordHash,
    role: "admin",
    isActive: true
  });

  console.log("Initial admin account created.");
}

createInitialAdmin()
  .catch(function (error) {
    console.error("Admin bootstrap failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async function () {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
