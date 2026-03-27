const pool = require("../db/pool");

async function writeLog({ level, service = "worker", event, requestId, apiKeyHash, userId, projectId, metadata }) {
  await pool.query(
    `INSERT INTO system_logs (project_id, level, service, event, request_id, api_key_hash, user_id, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [projectId || null, level, service, event, requestId || null, apiKeyHash || null, userId || null, metadata ? JSON.stringify(metadata) : null]
  );
}

module.exports = { writeLog };
