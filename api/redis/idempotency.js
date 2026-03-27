const redis = require("./client");

/**
 * Check and reserve idempotency key
 */
async function reserveIdempotency(key, ttlSec = 600) {
  if (!key) return true;

  const ok = await redis.set(key, "PROCESSING", "EX", ttlSec, "NX");
  return ok === "OK";
}

/**
 * Save response for idempotency replay
 */
async function saveIdempotencyResponse(key, response, ttlSec = 600) {
  if (!key) return;

  await redis.set(
    key,
    JSON.stringify({ status: "DONE", response }),
    "EX",
    ttlSec
  );
}

/**
 * Get stored response if duplicate
 */
async function getIdempotencyResponse(key) {
  if (!key) return null;

  const data = await redis.get(key);
  if (!data) return null;

  try {
    const parsed = JSON.parse(data);
    if (parsed.status === "DONE") {
      return parsed.response;
    }
  } catch (e) { }

  return null;
}

module.exports = {
  reserveIdempotency,
  saveIdempotencyResponse,
  getIdempotencyResponse
};