const express = require("express");
const controller = require("../controllers/authController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");
const router = express.Router();

router.post("/signup", controller.validateSignup, controller.signup);
router.post("/login", controller.validateLogin, controller.login);
router.get("/me", requireAuth, controller.getMe);

// Admin only
router.get("/users", requireAuth, requireRole("ADMIN"), controller.listUsers);
router.patch("/users/:id/role", requireAuth, requireRole("ADMIN"), controller.updateRole);

module.exports = router;
