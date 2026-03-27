const pool = require("../db/pool");

const PREDEFINED_EVENTS = [
  {
    event_name: "USER_LOGIN",
    subject_template: "New login detected for {{name}}",
    body_template: "Hello {{name}},\n\nA new login was detected for your account ({{email}}) at {{time}}.\n\nIf this wasn't you, please secure your account immediately.",
    is_predefined: true
  },
  {
    event_name: "USER_SIGNUP",
    subject_template: "Welcome to the platform, {{name}}!",
    body_template: "Hi {{name}},\n\nWelcome aboard! Your account has been created successfully with email {{email}}.\n\nGet started by exploring your dashboard.",
    is_predefined: true
  },
  {
    event_name: "ORDER_PLACED",
    subject_template: "Order #{{orderId}} confirmed",
    body_template: "Hello {{name}},\n\nYour order #{{orderId}} has been placed successfully.\n\nTotal: {{total}}\n\nWe'll notify you when it ships.",
    is_predefined: true
  },
  {
    event_name: "PASSWORD_RESET",
    subject_template: "Password reset requested",
    body_template: "Hello {{name}},\n\nA password reset was requested for your account ({{email}}).\n\nUse this link to reset: {{resetLink}}\n\nIf you didn't request this, ignore this email.",
    is_predefined: true
  }
];

async function seedPredefinedEvents(projectId) {
  for (const evt of PREDEFINED_EVENTS) {
    await pool.query(
      `INSERT INTO event_templates (project_id, event_name, subject_template, body_template, is_predefined)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (project_id, event_name) DO NOTHING`,
      [projectId, evt.event_name, evt.subject_template, evt.body_template, evt.is_predefined]
    );
  }
}

async function createTemplate(projectId, eventName, subjectTemplate, bodyTemplate) {
  const result = await pool.query(
    `INSERT INTO event_templates (project_id, event_name, subject_template, body_template)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [projectId, eventName.toUpperCase(), subjectTemplate, bodyTemplate]
  );
  return result.rows[0];
}

async function getTemplate(projectId, eventName) {
  const result = await pool.query(
    "SELECT * FROM event_templates WHERE project_id = $1 AND event_name = $2",
    [projectId, eventName.toUpperCase()]
  );
  return result.rows[0] || null;
}

async function listTemplates(projectId) {
  const result = await pool.query(
    "SELECT * FROM event_templates WHERE project_id = $1 ORDER BY is_predefined DESC, created_at DESC",
    [projectId]
  );
  return result.rows;
}

async function updateTemplate(templateId, projectId, updates) {
  const fields = [];
  const params = [];
  let idx = 1;

  if (updates.subjectTemplate !== undefined) {
    fields.push(`subject_template = $${idx++}`);
    params.push(updates.subjectTemplate);
  }
  if (updates.bodyTemplate !== undefined) {
    fields.push(`body_template = $${idx++}`);
    params.push(updates.bodyTemplate);
  }
  if (updates.eventName !== undefined) {
    fields.push(`event_name = $${idx++}`);
    params.push(updates.eventName.toUpperCase());
  }

  if (!fields.length) return null;

  fields.push(`updated_at = NOW()`);
  params.push(templateId, projectId);

  const result = await pool.query(
    `UPDATE event_templates SET ${fields.join(", ")} WHERE id = $${idx++} AND project_id = $${idx} RETURNING *`,
    params
  );
  return result.rows[0] || null;
}

async function deleteTemplate(templateId, projectId) {
  const result = await pool.query(
    "DELETE FROM event_templates WHERE id = $1 AND project_id = $2 RETURNING id, event_name",
    [templateId, projectId]
  );
  return result.rows[0] || null;
}

function resolveTemplate(template, data) {
  let subject = template.subject_template;
  let body = template.body_template;

  if (data && typeof data === "object") {
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
      subject = subject.replace(regex, String(value));
      body = body.replace(regex, String(value));
    }
  }

  // Remove unreplaced placeholders
  subject = subject.replace(/\{\{\s*\w+\s*\}\}/g, "");
  body = body.replace(/\{\{\s*\w+\s*\}\}/g, "");

  return { subject: subject.trim(), body: body.trim() };
}

module.exports = {
  seedPredefinedEvents,
  createTemplate,
  getTemplate,
  listTemplates,
  updateTemplate,
  deleteTemplate,
  resolveTemplate,
  PREDEFINED_EVENTS
};
