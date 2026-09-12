// Defines RESTful event endpoints and role-specific access rules.
const express = require("express");
const router = express.Router();
const controller = require("../controllers/eventController");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);
router.get("/", authorize("admin", "manager", "tenant"), controller.getEvents);
router.post("/", authorize("admin", "manager"), controller.createEvent);
router.put("/:id", authorize("admin", "manager"), controller.updateEvent);
router.delete("/:id", authorize("admin"), controller.deleteEvent);

module.exports = router;
