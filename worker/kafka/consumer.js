const { Kafka } = require("kafkajs");
const config = require("../config");
const logger = require("../utils/logger");
const { sendEmail } = require("../services/emailSender");
const { markSent, markFailed, markRetrying } = require("../services/notificationService");
const { sendToDlq, retryNotification } = require("./producer");
const { writeLog } = require("../services/logService");

async function runConsumer() {
  const kafka = new Kafka({ clientId: config.kafkaClientId, brokers: config.kafkaBrokers });
  const consumer = kafka.consumer({ groupId: config.groupId });

  await consumer.connect();
  await consumer.subscribe({ topic: config.topicNotifications, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const payload = JSON.parse(message.value.toString());
      const attempts = (payload.attempts || 0) + 1;
      const startTime = Date.now();

      try {
        await sendEmail(payload);
        await markSent(payload.id);
        const durationMs = Date.now() - startTime;
        logger.info({ id: payload.id, durationMs }, "email_sent");
        await writeLog({
          level: "info", service: "worker", event: "notification_sent",
          projectId: payload.projectId || null,
          metadata: { notificationId: payload.id, durationMs, email: payload.recipientEmail }
        });
      } catch (e) {
        const durationMs = Date.now() - startTime;
        if (attempts >= config.maxRetries) {
          await sendToDlq({ ...payload, attempts, error: e.message });
          await markFailed(payload.id, attempts, e.message);
          logger.error({ id: payload.id, err: e.message, attempts }, "sent_to_dlq");
          await writeLog({
            level: "error", service: "worker", event: "notification_failed_dlq",
            projectId: payload.projectId || null,
            metadata: { notificationId: payload.id, attempts, error: e.message, durationMs }
          });
        } else {
          await retryNotification({ ...payload, attempts });
          await markRetrying(payload.id, attempts, `retrying:${e.message}`);
          logger.warn({ id: payload.id, attempts }, "email_requeued_for_retry");
          await writeLog({
            level: "warn", service: "worker", event: "notification_retrying",
            projectId: payload.projectId || null,
            metadata: { notificationId: payload.id, attempts, error: e.message, durationMs }
          });
        }
      }
    }
  });
}

module.exports = { runConsumer };
