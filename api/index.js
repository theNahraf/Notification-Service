require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const config = require("./config");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");
const auditLogger = require("./middleware/auditLogger");
const correlationId = require("./middleware/correlationId");

// Routes
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const apiKeyRoutes = require("./routes/apiKeyRoutes");
const eventRoutes = require("./routes/eventRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const logRoutes = require("./routes/logRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));

// Request tracing
app.use(correlationId);
app.use(requestLogger);
app.use(auditLogger);

// Health check
app.get("/health", (req, res) => res.json({ ok: true, service: "notifystack-api", timestamp: new Date().toISOString() }));

// Auth (public)
app.use("/v1/auth", authRoutes);

// Projects (JWT)
app.use("/v1/projects", projectRoutes);

// API keys & events (nested under projects, JWT)
app.use("/v1/projects/:projectId/keys", apiKeyRoutes);
app.use("/v1/projects/:projectId/events", eventRoutes);

// Notifications (API key auth — for SDK)
app.use("/v1/notifications", notificationRoutes);

// Dashboard routes (JWT)
app.use("/v1/dashboard/notifications", dashboardRoutes);
app.use("/v1/dashboard/logs", logRoutes);

// Error handler
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`NotifyStack API listening on port ${config.port}`);
});
