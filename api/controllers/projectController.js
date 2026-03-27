const projectService = require("../services/projectService");

async function create(req, res, next) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Project name is required" });
    }
    const project = await projectService.createProject(req.user.userId, name.trim());
    return res.status(201).json({ success: true, data: project });
  } catch (e) {
    next(e);
  }
}

async function list(req, res, next) {
  try {
    const projects = await projectService.listProjects(req.user.userId);
    return res.json({ success: true, data: projects });
  } catch (e) {
    next(e);
  }
}

async function getOne(req, res, next) {
  try {
    const project = await projectService.getProject(req.params.id, req.user.userId);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    const stats = await projectService.getProjectStats(project.id);
    return res.json({ success: true, data: { ...project, stats } });
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await projectService.deleteProject(req.params.id, req.user.userId);
    if (!deleted) return res.status(404).json({ success: false, message: "Project not found" });
    return res.json({ success: true, data: { deleted: true, ...deleted } });
  } catch (e) {
    next(e);
  }
}

module.exports = { create, list, getOne, remove };
