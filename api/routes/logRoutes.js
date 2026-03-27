const express = require("express");
const controller = require("../controllers/logController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");
const router = express.Router();

// Dashboard log routes — require JWT, projectId from query param
router.get("/", requireAuth, async (req, res, next) => {
  if (!req.query.projectId) return res.status(400).json({ success: false, message: "projectId query param required" });
  req.projectId = req.query.projectId;
  next();
}, controller.getLogs);

router.get("/export", requireAuth, async (req, res, next) => {
  if (!req.query.projectId) return res.status(400).json({ success: false, message: "projectId query param required" });
  req.projectId = req.query.projectId;
  next();
}, controller.exportLogs);

// Admin: all logs
router.get("/admin", requireAuth, requireRole("ADMIN"), controller.getAdminLogs);

module.exports = router;
