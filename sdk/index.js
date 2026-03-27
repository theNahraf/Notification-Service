const crypto = require("crypto");

/**
 * NotifyStack SDK
 *
 * Usage:
 *   const NotifySDK = require("notify-saas-sdk");
 *   const notify = new NotifySDK("ntf_live_xxxxxxxxx");
 *   await notify.track("USER_LOGIN", { email: "user@email.com", name: "Ayush" });
 */
class NotifySDK {
  /**
   * @param {string} apiKey - Your NotifyStack API key (ntf_live_xxx)
   * @param {object} [options]
   * @param {string} [options.baseUrl="http://localhost:3000"] - API base URL
   * @param {number} [options.maxRetries=3] - Max retry attempts
   * @param {number} [options.timeoutMs=10000] - Request timeout in ms
   */
  constructor(apiKey, options = {}) {
    if (!apiKey || !apiKey.startsWith("ntf_live_")) {
      throw new Error("Invalid API key. Must start with 'ntf_live_'");
    }
    this.apiKey = apiKey;
    this.baseUrl = (options.baseUrl || "http://localhost:3000").replace(/\/$/, "");
    this.maxRetries = options.maxRetries ?? 3;
    this.timeoutMs = options.timeoutMs ?? 10000;
  }

  /**
   * Send an event-based notification using a registered template.
   * @param {string} eventName - Event name (e.g. "USER_LOGIN", "ORDER_PLACED")
   * @param {object} data - Template variables (must include `email`)
   * @param {object} [metadata] - Optional metadata to attach
   * @returns {Promise<object>} - { id, status }
   */
  async track(eventName, data, metadata) {
    if (!eventName) throw new Error("eventName is required");
    if (!data || !data.email) throw new Error("data.email is required for event-based notifications");

    return this._request("POST", "/v1/notifications", {
      event: eventName,
      data,
      metadata
    });
  }

  /**
   * Send a raw email notification (no template).
   * @param {object} params
   * @param {string} params.to - Recipient email
   * @param {string} params.subject - Email subject
   * @param {string} params.body - Email body
   * @param {object} [params.metadata] - Optional metadata
   * @returns {Promise<object>} - { id, status }
   */
  async send({ to, subject, body, metadata }) {
    if (!to || !subject || !body) throw new Error("to, subject, and body are required");

    return this._request("POST", "/v1/notifications", {
      recipientEmail: to,
      subject,
      body,
      metadata
    });
  }

  /**
   * List notifications for the project associated with this API key.
   * @param {object} [params]
   * @param {number} [params.limit=50]
   * @param {number} [params.offset=0]
   * @param {string} [params.status] - Filter by status
   * @returns {Promise<object>}
   */
  async listNotifications(params = {}) {
    const qs = new URLSearchParams();
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.offset) qs.set("offset", String(params.offset));
    if (params.status) qs.set("status", params.status);
    const query = qs.toString();
    return this._request("GET", `/v1/notifications${query ? "?" + query : ""}`);
  }

  /**
   * Internal: HTTP request with retry and idempotency.
   */
  async _request(method, path, body) {
    const idempotencyKey = `idem_${crypto.randomUUID()}`;
    let lastError;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const url = `${this.baseUrl}${path}`;
        const headers = {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "x-idempotency-key": idempotencyKey
        };

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

        const fetchOptions = { method, headers, signal: controller.signal };
        if (body && method !== "GET") {
          fetchOptions.body = JSON.stringify(body);
        }

        const response = await fetch(url, fetchOptions);
        clearTimeout(timeout);

        const json = await response.json();

        if (response.ok) {
          return json.data || json;
        }

        // Don't retry client errors (4xx) except 429
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw new NotifyError(json.message || "Request failed", response.status, json);
        }

        lastError = new NotifyError(json.message || "Request failed", response.status, json);
      } catch (e) {
        if (e instanceof NotifyError && e.status >= 400 && e.status < 500 && e.status !== 429) {
          throw e;
        }
        lastError = e;
      }

      // Exponential backoff
      if (attempt < this.maxRetries - 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error("Request failed after retries");
  }
}

class NotifyError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = "NotifyError";
    this.status = status;
    this.response = response;
  }
}

module.exports = NotifySDK;
module.exports.NotifyError = NotifyError;
