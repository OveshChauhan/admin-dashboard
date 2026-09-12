// Defines the protected dashboard analytics endpoint backed by MongoDB aggregation pipelines.
const express = require("express");
const router = express.Router();
const { getStats } = require("../controllers/dashboardController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/stats", authenticate, authorize("admin", "manager", "tenant"), getStats);

module.exports = router;
