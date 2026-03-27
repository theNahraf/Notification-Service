const {
  reserveIdempotency,
  saveIdempotencyResponse,
  getIdempotencyResponse
} = require("../redis/idempotency");
const notificationService = require("../services/notificationService");
const logService = require("../services/logService");

async function createNotification(req, res, next) {
  try {
    const idempotencyKey = req.headers["x-idempotency-key"];

    // 🔥 STEP 1: Check if already processed
    const existing = await getIdempotencyResponse(idempotencyKey);
    if (existing) {
      return res.status(200).json({
        success: true,
        data: existing,
        replayed: true
      });
    }

    // 🔥 STEP 2: Reserve key
    const reserved = await reserveIdempotency(idempotencyKey);
    if (!reserved) {
      return res.status(409).json({
        success: false,
        message: "Duplicate request (processing)"
      });
    }

    // 🔥 STEP 3: Build payload
    const payload = {
      projectId: req.projectId,
      apiKeyId: req.apiKeyId || null,
      recipientEmail:
        req.body.recipientEmail ||
        (req.body.data && req.body.data.email),
      subject: req.body.subject,
      body: req.body.body,
      event: req.body.event,
      eventName: req.body.event,
      data: req.body.data,
      metadata: req.body.metadata
    };

    // 🔥 STEP 4: Validate
    if (
      !payload.event &&
      (!payload.recipientEmail || !payload.subject || !payload.body)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Either provide { event, data } or { recipientEmail, subject, body }"
      });
    }

    // 🔥 STEP 5: Process
    const data = await notificationService.enqueueNotification(payload);

    // 🔥 STEP 6: Save response for idempotency replay
    await saveIdempotencyResponse(idempotencyKey, data);

    // 🔥 STEP 7: Logging
    await logService.writeLog({
      level: "info",
      service: "api",
      event: "notification_queued",
      requestId: req.requestId,
      apiKeyHash: req.apiKeyHash,
      projectId: req.projectId,
      metadata: {
        notificationId: data.id,
        eventName: payload.event || "direct"
      }
    });

    return res.status(202).json({ success: true, data });

  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json({
        success: false,
        message: e.message
      });
    }
    next(e);
  }
}

async function listNotifications(req, res, next) {
  try {
    const data = await notificationService.getNotifications(req.projectId, {
      limit: Number(req.query.limit || 50),
      offset: Number(req.query.offset || 0),
      status: req.query.status || undefined
    });
    return res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

async function listDlq(req, res, next) {
  try {
    const data = await notificationService.getDlqItems(req.projectId, Number(req.query.limit || 50));
    return res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

async function requeueDlq(req, res, next) {
  try {
    const data = await notificationService.requeueNotification(req.params.id, req.projectId);
    if (!data) return res.status(404).json({ success: false, message: "Notification not found" });
    await logService.writeLog({
      level: "info", service: "api", event: "notification_requeued",
      requestId: req.requestId, projectId: req.projectId,
      metadata: { notificationId: req.params.id }
    });
    return res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

async function bulkRequeueDlq(req, res, next) {
  try {
    const ids = req.body.ids;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ success: false, message: "Body must include ids: string[]" });
    }
    const result = await notificationService.requeueBulk(ids, req.projectId);
    await logService.writeLog({
      level: "info", service: "api", event: "notification_bulk_requeued",
      requestId: req.requestId, projectId: req.projectId,
      metadata: { count: result.count, ids: result.requeued.map((r) => r.id) }
    });
    return res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

module.exports = { createNotification, listNotifications, listDlq, requeueDlq, bulkRequeueDlq };
