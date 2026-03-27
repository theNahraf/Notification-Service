const authService = require("../services/authService");

/**
 * JWT auth middleware. Extracts Bearer token from Authorization header.
 * Attaches req.user = { userId, email, role }
 */
module.exports = function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Missing or invalid Authorization header" });
    }
    const token = header.slice(7);
    const decoded = authService.verifyToken(token);
    req.user = { userId: decoded.userId, email: decoded.email, role: decoded.role };
    next();
  } catch (e) {
    if (e.name === "JsonWebTokenError" || e.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
    next(e);
  }
};
