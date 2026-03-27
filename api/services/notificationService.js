const { nanoid } = require("nanoid");
const pool = require("../db/pool");
const config = require("../config");
const { getProducer } = require("../kafka/producer");
const eventService = require("./eventService");

async function enqueueNotification(input) {
  const id = `ntf_${nanoid(20)}`;

  let subject = input.subject;
  let body = input.body;
  let eventName = input.eventName || null;
  const recipientEmail = input.recipientEmail || (input.data && input.data.email);

  // Event-based: resolve template
  if (input.event && input.projectId) {
    eventName = input.event;
    const template = await eventService.getTemplate(input.projectId, input.event);
    if (!template) {
      const err = new Error(`Event template "${input.event}" not found for this project`);
      err.statusCode = 404;
      throw err;
    }
    const resolved = eventService.resolveTemplate(template, input.data || {});
    subject = resolved.subject;
    body = resolved.body;
  }

  if (!recipientEmail) {
    const err = new Error("recipientEmail (or data.email for event-based) is required");
    err.statusCode = 400;
    throw err;
  }
  if (!subject || !body) {
    const err = new Error("subject and body are required (or use event-based with templates)");
    err.statusCode = 400;
    throw err;
  }

  await pool.query(
    `INSERT INTO notifications (id, project_id, api_key_id, event_name, recipient_email, subject, body, status, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'queued', $8)`,
    [id, input.projectId, input.apiKeyId || null, eventName, recipientEmail, subject, body, input.metadata ? JSON.stringify(input.metadata) : null]
  );

  const producer = await getProducer();
  await producer.send({
    topic: config.topicNotifications,
    messages: [{ key: id, value: JSON.stringify({ id, projectId: input.projectId, recipientEmail, subject, body, attempts: 0 }) }]
  });

  return { id, status: "queued" };
}

async function getNotifications(projectId, { limit = 50, offset = 0, status } = {}) {
  const params = [projectId];
  let where = "WHERE project_id = $1";
  if (status) {
    params.push(status);
    where += ` AND status = $${params.length}`;
  }
  params.push(limit, offset);
  const result = await pool.query(
    `SELECT * FROM notifications ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const countResult = await pool.query(
    `SELECT COUNT(*) as total FROM notifications ${where}`,
    status ? [projectId, status] : [projectId]
  );

  return { items: result.rows, total: Number(countResult.rows[0].total) };
}

async function getAllNotifications({ limit = 50, offset = 0, status } = {}) {
  const params = [];
  let where = "";
  if (status) {
    params.push(status);
    where = `WHERE status = $${params.length}`;
  }
  params.push(limit, offset);
  const result = await pool.query(
    `SELECT n.*, p.name as project_name FROM notifications n
     LEFT JOIN projects p ON p.id = n.project_id
     ${where} ORDER BY n.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return { items: result.rows };
}

async function getDlqItems(projectId, limit = 50) {
  const result = await pool.query(
    `SELECT * FROM notifications WHERE status = 'failed' AND project_id = $1
     ORDER BY processed_at DESC NULLS LAST, created_at DESC LIMIT $2`,
    [projectId, limit]
  );
  return result.rows;
}

async function getAllDlqItems(limit = 50) {
  const result = await pool.query(
    `SELECT n.*, p.name as project_name FROM notifications n
     LEFT JOIN projects p ON p.id = n.project_id
     WHERE n.status = 'failed'
     ORDER BY n.processed_at DESC NULLS LAST, n.created_at DESC LIMIT $1`,
    [limit]
  );
  return result.rows;
}

async function requeueNotification(id, projectId) {
  let result;
  if (projectId) {
    result = await pool.query(
      "SELECT * FROM notifications WHERE id = $1 AND project_id = $2 LIMIT 1",
      [id, projectId]
    );
  } else {
    result = await pool.query("SELECT * FROM notifications WHERE id = $1 LIMIT 1", [id]);
  }
  const row = result.rows[0];
  if (!row) return null;

  await pool.query("UPDATE notifications SET status = 'queued', error_message = NULL, attempts = 0 WHERE id = $1", [row.id]);
  const producer = await getProducer();
  await producer.send({
    topic: config.topicNotifications,
    messages: [{
      key: row.id,
      value: JSON.stringify({
        id: row.id,
        projectId: row.project_id,
        recipientEmail: row.recipient_email,
        subject: row.subject,
        body: row.body,
        attempts: 0
      })
    }]
  });
  return { id: row.id, status: "queued" };
}

async function requeueBulk(ids, projectId) {
  if (!Array.isArray(ids) || !ids.length) {
    return { requeued: [], skipped: [], errors: ["ids array required"] };
  }
  const unique = [...new Set(ids.map(String))];
  const requeued = [];
  const skipped = [];
  for (const id of unique) {
    const data = await requeueNotification(id, projectId);
    if (data) requeued.push(data);
    else skipped.push(id);
  }
  return { requeued, skipped, count: requeued.length };
}

module.exports = { enqueueNotification, getNotifications, getAllNotifications, getDlqItems, getAllDlqItems, requeueNotification, requeueBulk };
