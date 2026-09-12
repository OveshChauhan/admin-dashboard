// Defines authentication endpoints for login, refresh, logout, and the current-user profile.
const express = require("express");
const router = express.Router();
const controller = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

router.post("/login", controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", authenticate, controller.logout);
router.get("/me", authenticate, controller.me);

module.exports = router;
