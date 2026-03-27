const crypto = require("crypto");
const { nanoid } = require("nanoid");
const pool = require("../db/pool");

function hashKey(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function generateRawKey() {
  return `ntf_live_${nanoid(32)}`;
}

function extractPrefix(raw) {
  return raw.substring(0, 16);
}

async function createApiKey(projectId, label) {
  const raw = generateRawKey();
  const keyHash = hashKey(raw);
  const keyPrefix = extractPrefix(raw);
  const result = await pool.query(
    `INSERT INTO api_keys (project_id, key_prefix, key_hash, label, active)
     VALUES ($1, $2, $3, $4, TRUE) RETURNING id, key_prefix, label, active, created_at`,
    [projectId, keyPrefix, keyHash, label || "Default"]
  );
  return { ...result.rows[0], apiKey: raw };
}

async function validateApiKey(raw) {
  const hash = hashKey(raw || "");
  const result = await pool.query(
    `SELECT ak.*, p.user_id FROM api_keys ak
     JOIN projects p ON p.id = ak.project_id
     WHERE ak.key_hash = $1 AND ak.active = TRUE LIMIT 1`,
    [hash]
  );
  if (result.rows[0]) {
    await pool.query("UPDATE api_keys SET last_used_at = NOW() WHERE id = $1", [result.rows[0].id]);
  }
  return result.rows[0] || null;
}

async function listApiKeys(projectId) {
  const result = await pool.query(
    `SELECT id, key_prefix, label, active, last_used_at, created_at
     FROM api_keys WHERE project_id = $1 ORDER BY created_at DESC`,
    [projectId]
  );
  return result.rows;
}

async function revokeApiKey(keyId, projectId) {
  const result = await pool.query(
    "UPDATE api_keys SET active = FALSE WHERE id = $1 AND project_id = $2 RETURNING id, key_prefix, label",
    [keyId, projectId]
  );
  return result.rows[0] || null;
}

async function regenerateApiKey(keyId, projectId) {
  const existing = await pool.query(
    "SELECT id FROM api_keys WHERE id = $1 AND project_id = $2",
    [keyId, projectId]
  );
  if (!existing.rows[0]) return null;

  await pool.query("UPDATE api_keys SET active = FALSE WHERE id = $1", [keyId]);

  const raw = generateRawKey();
  const keyHash = hashKey(raw);
  const keyPrefix = extractPrefix(raw);
  const result = await pool.query(
    `INSERT INTO api_keys (project_id, key_prefix, key_hash, label, active)
     SELECT project_id, $2, $3, label, TRUE FROM api_keys WHERE id = $1
     RETURNING id, key_prefix, label, active, created_at`,
    [keyId, keyPrefix, keyHash]
  );
  return { ...result.rows[0], apiKey: raw };
}

module.exports = { hashKey, createApiKey, validateApiKey, listApiKeys, revokeApiKey, regenerateApiKey };
