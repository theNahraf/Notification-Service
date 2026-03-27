const logService = require("../services/logService");

module.exports = function auditLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - start;
    logService.writeLog({
      level: res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info",
      service: "api",
      event: "http_request",
      requestId: req.requestId,
      userId: req.user?.userId || null,
      projectId: req.projectId || null,
      apiKeyHash: req.apiKeyHash || null,
      metadata: {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs,
        ip: req.ip
      }
    }).catch(() => {});
  });
  next();
};
