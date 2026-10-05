// Starts the Express API, connects MongoDB, applies security middleware, and mounts REST routes.
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const eventRoutes = require("./routes/events");
const dashboardRoutes = require("./routes/dashboard");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { seedDevelopmentData } = require("./scripts/seed");

const app = express();
const PORT = Number(process.env.PORT || 5001);

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false
});

app.get("/api/health", function (req, res) {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    validateEnvironment();
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected.");

    if (process.env.NODE_ENV === "development") {
      await seedDevelopmentData();
    }

    app.listen(PORT, function () {
      console.log(`API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

function validateEnvironment() {
  const required = ["NODE_ENV", "MONGO_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET", "CLIENT_URL"];
  const missing = required.filter(function (name) {
    return !process.env[name] || !process.env[name].trim();
  });

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  if (!["development", "production"].includes(process.env.NODE_ENV)) {
    throw new Error("NODE_ENV must be either development or production.");
  }

  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (Buffer.byteLength(accessSecret, "utf8") < 32 || Buffer.byteLength(refreshSecret, "utf8") < 32) {
    throw new Error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must each be at least 32 bytes.");
  }
  if (accessSecret === refreshSecret) {
    throw new Error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different values.");
  }

  let clientUrl;
  try {
    clientUrl = new URL(process.env.CLIENT_URL);
  } catch (error) {
    throw new Error("CLIENT_URL must be a valid absolute URL.");
  }
  if (clientUrl.origin !== process.env.CLIENT_URL) {
    throw new Error("CLIENT_URL must be an origin only, without a path or trailing slash.");
  }
  if (process.env.NODE_ENV === "production" && clientUrl.protocol !== "https:") {
    throw new Error("CLIENT_URL must use HTTPS in production.");
  }
}

startServer();
