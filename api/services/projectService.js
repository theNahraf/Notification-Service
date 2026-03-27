const pool = require("../db/pool");
const { seedPredefinedEvents } = require("./eventService");

async function createProject(userId, name) {
  const result = await pool.query(
    "INSERT INTO projects (user_id, name) VALUES ($1, $2) RETURNING *",
    [userId, name]
  );
  const project = result.rows[0];
  // Auto-seed predefined event templates
  await seedPredefinedEvents(project.id).catch(() => {});
  return project;
}

async function listProjects(userId) {
  const result = await pool.query(
    "SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return result.rows;
}

async function getProject(projectId, userId) {
  const result = await pool.query(
    "SELECT * FROM projects WHERE id = $1 AND user_id = $2",
    [projectId, userId]
  );
  return result.rows[0] || null;
}

async function getProjectAdmin(projectId) {
  const result = await pool.query("SELECT * FROM projects WHERE id = $1", [projectId]);
  return result.rows[0] || null;
}

async function deleteProject(projectId, userId) {
  const result = await pool.query(
    "DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id, name",
    [projectId, userId]
  );
  return result.rows[0] || null;
}

async function getProjectStats(projectId) {
  const result = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'queued' OR status = 'retrying') AS queued,
       COUNT(*) FILTER (WHERE status = 'sent') AS sent,
       COUNT(*) FILTER (WHERE status = 'failed') AS failed,
       COUNT(*) AS total
     FROM notifications WHERE project_id = $1`,
    [projectId]
  );
  return result.rows[0];
}

module.exports = { createProject, listProjects, getProject, getProjectAdmin, deleteProject, getProjectStats };
