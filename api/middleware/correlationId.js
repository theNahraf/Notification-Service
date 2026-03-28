const crypto = require("crypto");

/**
 * Correlation ID middleware.
 * Generates a unique request ID for tracing across services.
 */
module.exports = function correlationId(req, res, next) {
  const id = req.headers["x-request-id"] || `req_${crypto.randomUUID().slice(0, 18)}`;
  req.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
};
