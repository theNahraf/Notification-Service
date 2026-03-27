const pool = require("../db/pool");

async function writeLog({ level, service = "api", event, requestId, apiKeyHash, userId, projectId, metadata }) {
  await pool.query(
    `INSERT INTO system_logs (project_id, level, service, event, request_id, api_key_hash, user_id, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [projectId || null, level, service, event, requestId || null, apiKeyHash || null, userId || null, metadata ? JSON.stringify(metadata) : null]
  );
}

async function listLogs(projectId, options = {}) {
  const limit = Math.min(Number(options.limit) || 200, 500);
  const offset = Math.max(Number(options.offset) || 0, 0);

  const params = [projectId];
  let where = "WHERE project_id = $1";

  if (options.level) {
    params.push(options.level);
    where += ` AND level = $${params.length}`;
  }
  if (options.service) {
    params.push(options.service);
    where += ` AND service = $${params.length}`;
  }
  if (options.event) {
    params.push(`%${options.event}%`);
    where += ` AND event ILIKE $${params.length}`;
  }
  if (options.q) {
    params.push(`%${options.q}%`);
    where += ` AND (event ILIKE $${params.length} OR CAST(metadata AS TEXT) ILIKE $${params.length})`;
  }

  params.push(limit, offset);
  const result = await pool.query(
    `SELECT * FROM system_logs ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const countResult = await pool.query(
    `SELECT COUNT(*) as total FROM system_logs ${where}`,
    params.slice(0, -2)
  );

  return { items: result.rows, total: Number(countResult.rows[0].total) };
}

async function listAllLogs(options = {}) {
  const limit = Math.min(Number(options.limit) || 200, 500);
  const offset = Math.max(Number(options.offset) || 0, 0);

  const params = [];
  let where = "WHERE 1=1";

  if (options.level) {
    params.push(options.level);
    where += ` AND level = $${params.length}`;
  }
  if (options.service) {
    params.push(options.service);
    where += ` AND service = $${params.length}`;
  }
  if (options.q) {
    params.push(`%${options.q}%`);
    where += ` AND (event ILIKE $${params.length} OR CAST(metadata AS TEXT) ILIKE $${params.length})`;
  }

  params.push(limit, offset);
  const result = await pool.query(
    `SELECT sl.*, p.name as project_name FROM system_logs sl
     LEFT JOIN projects p ON p.id = sl.project_id
     ${where} ORDER BY sl.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return { items: result.rows };
}

module.exports = { writeLog, listLogs, listAllLogs };
