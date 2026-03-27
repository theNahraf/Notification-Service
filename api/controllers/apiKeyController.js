const apiKeyService = require("../services/apiKeyService");
const projectService = require("../services/projectService");
const logService = require("../services/logService");

async function ensureProjectAccess(req, res) {
  const project = await projectService.getProject(req.params.projectId, req.user.userId);
  if (!project) {
    res.status(404).json({ success: false, message: "Project not found" });
    return null;
  }
  return project;
}

async function createKey(req, res, next) {
  try {
    const project = await ensureProjectAccess(req, res);
    if (!project) return;
    const { label } = req.body;
    const data = await apiKeyService.createApiKey(project.id, label);
    await logService.writeLog({
      level: "info", service: "api", event: "api_key_created",
      userId: req.user.userId, projectId: project.id, requestId: req.requestId,
      metadata: { label: label || "Default" }
    });
    return res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

async function listKeys(req, res, next) {
  try {
    const project = await ensureProjectAccess(req, res);
    if (!project) return;
    const data = await apiKeyService.listApiKeys(project.id);
    return res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

async function revokeKey(req, res, next) {
  try {
    const project = await ensureProjectAccess(req, res);
    if (!project) return;
    const row = await apiKeyService.revokeApiKey(req.params.keyId, project.id);
    if (!row) return res.status(404).json({ success: false, message: "API key not found" });
    await logService.writeLog({
      level: "info", service: "api", event: "api_key_revoked",
      userId: req.user.userId, projectId: project.id, requestId: req.requestId,
      metadata: { keyId: req.params.keyId }
    });
    return res.json({ success: true, data: { ...row, revoked: true } });
  } catch (e) {
    next(e);
  }
}

async function regenerateKey(req, res, next) {
  try {
    const project = await ensureProjectAccess(req, res);
    if (!project) return;
    const data = await apiKeyService.regenerateApiKey(req.params.keyId, project.id);
    if (!data) return res.status(404).json({ success: false, message: "API key not found" });
    await logService.writeLog({
      level: "info", service: "api", event: "api_key_regenerated",
      userId: req.user.userId, projectId: project.id, requestId: req.requestId,
      metadata: { oldKeyId: req.params.keyId, newKeyId: data.id }
    });
    return res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

module.exports = { createKey, listKeys, revokeKey, regenerateKey };
