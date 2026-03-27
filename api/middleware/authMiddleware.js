const apiKeyService = require("../services/apiKeyService");

/**
 * API key auth middleware for SDK / external API calls.
 * Reads x-api-key header, validates, and attaches projectId + apiKeyHash.
 */
module.exports = async function apiKeyAuth(req, res, next) {
  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) return res.status(401).json({ success: false, message: "Missing x-api-key header" });
    const record = await apiKeyService.validateApiKey(apiKey);
    if (!record) return res.status(403).json({ success: false, message: "Invalid or revoked API key" });
    req.apiKeyHash = record.key_hash;
    req.projectId = record.project_id;
    req.apiKeyId = record.id;
    next();
  } catch (e) {
    next(e);
  }
};
