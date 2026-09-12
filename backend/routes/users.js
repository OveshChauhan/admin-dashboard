// Defines RESTful user endpoints with authentication and role authorization middleware.
const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);
router.get("/", authorize("admin", "manager", "tenant"), controller.getUsers);
router.get("/:id", authorize("admin", "manager", "tenant"), controller.getUserById);
router.post("/", authorize("admin", "manager"), controller.createUser);
router.put("/:id", authorize("admin", "manager"), controller.updateUser);
router.delete("/:id", authorize("admin"), controller.deleteUser);

module.exports = router;
