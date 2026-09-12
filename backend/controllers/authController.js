// Implements registration, login, refresh-token rotation, and logout for JWT authentication.
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { createAccessToken, createRefreshToken } = require("../utils/tokens");

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt
  };
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    user.lastLoginAt = new Date();

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        user: publicUser(user),
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required."
      });
    }

    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "development_refresh_secret"
    );

    const user = await User.findById(payload.sub);

    if (!user || !user.isActive || !user.refreshTokenHash) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is no longer valid."
      });
    }

    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);

    if (!matches) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is no longer valid."
      });
    }

    const accessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);
    user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 12);
    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        user: publicUser(user),
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token."
      });
    }

    next(error);
  }
}

async function logout(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $set: { refreshTokenHash: null }
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully."
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res) {
  res.status(200).json({
    success: true,
    data: {
      user: publicUser(req.user)
    }
  });
}

module.exports = {
  login,
  refresh,
  logout,
  me
};
