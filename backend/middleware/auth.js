// Separates JWT identity authentication from role authorization and consistently returns 401/403.
const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.substring(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || "development_access_secret"
    );

    const user = await User.findById(payload.sub).select("-passwordHash -refreshTokenHash");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token."
      });
    }

    next(error);
  }
}

function authorize() {
  const allowedRoles = Array.from(arguments);

  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action."
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize
};
