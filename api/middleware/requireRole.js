/**
 * Role-based access control middleware.
 * Usage: requireRole("ADMIN")
 * Must be used AFTER requireAuth.
 */
module.exports = function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const userRole = (req.user.role || "").toUpperCase();
    const authorized = roles.some(r => r.toUpperCase() === userRole);

    if (!authorized) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" });
    }
    next();
  };
};
