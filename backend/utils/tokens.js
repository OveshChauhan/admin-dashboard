// Creates short-lived access tokens and long-lived refresh tokens for authentication.
const jwt = require("jsonwebtoken");

function createAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      name: user.name
    },
    process.env.JWT_ACCESS_SECRET || "development_access_secret",
    { expiresIn: "1h" }
  );
}

function createRefreshToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString()
    },
    process.env.JWT_REFRESH_SECRET || "development_refresh_secret",
    { expiresIn: "7d" }
  );
}

module.exports = {
  createAccessToken,
  createRefreshToken
};
