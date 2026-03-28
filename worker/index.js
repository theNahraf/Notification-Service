const express = require("express");
const { runConsumer } = require("./kafka/consumer");
const { startDelayQueuePoller } = require("./redis/delayQueue");

const { getRouter } = require("./services/emailSender");

// Start health check server
const app = express();
app.get("/health", (req, res) => res.json({ status: "ok", service: "worker" }));
app.get("/provider-health", (req, res) => {
  try {
    const router = getRouter();
    res.json({ status: "ok", circuitState: router.getCircuitStatus(), stats: router.getStats() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 3001;
const healthServer = app.listen(port, () => {
  console.log(`Worker health server listening on port ${port}`);
});

// Start background components
startDelayQueuePoller();

runConsumer().catch((e) => {
  console.error("Worker failed", e);
  process.exit(1);
});
