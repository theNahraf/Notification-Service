const { nanoid } = require("nanoid");

/**
 * Correlation ID middleware.
 * Generates a unique request ID for tracing across services.
 */
module.exports = function correlationId(req, res, next) {
  const id = req.headers["x-request-id"] || `req_${nanoid(16)}`;
  req.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
};
