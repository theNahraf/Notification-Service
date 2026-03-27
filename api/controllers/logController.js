const logService = require("../services/logService");

async function getLogs(req, res, next) {
  try {
    const data = await logService.listLogs(req.projectId, {
      limit: Number(req.query.limit || 200),
      offset: Number(req.query.offset || 0),
      level: req.query.level || undefined,
      service: req.query.service || undefined,
      event: req.query.event || undefined,
      q: req.query.q || undefined
    });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

async function exportLogs(req, res, next) {
  try {
    const data = await logService.listLogs(req.projectId, {
      limit: Number(req.query.limit || 2000),
      offset: 0,
      level: req.query.level || undefined,
      q: req.query.q || undefined
    });
    const format = req.query.format || "json";
    if (format === "csv") {
      const header = "id,level,service,event,request_id,created_at\n";
      const rows = data.items.map((l) =>
        `${l.id},${l.level},${l.service},"${String(l.event).replaceAll('"', '""')}",${l.request_id || ""},${new Date(l.created_at).toISOString()}`
      ).join("\n");
      res.setHeader("Content-Type", "text/csv");
      return res.send(header + rows);
    }
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(data.items, null, 2));
  } catch (e) {
    next(e);
  }
}

async function getAdminLogs(req, res, next) {
  try {
    const data = await logService.listAllLogs({
      limit: Number(req.query.limit || 200),
      offset: Number(req.query.offset || 0),
      level: req.query.level || undefined,
      service: req.query.service || undefined,
      q: req.query.q || undefined
    });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

module.exports = { getLogs, exportLogs, getAdminLogs };
