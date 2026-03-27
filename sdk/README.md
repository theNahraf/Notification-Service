# NotifyStack SDK

Zero-dependency Node.js SDK for the NotifyStack notification platform.

## Installation

```bash
npm install ./sdk
# or link locally
npm link ./sdk
```

## Quick Start

```js
const NotifySDK = require("notify-saas-sdk");

const notify = new NotifySDK("ntf_live_your_api_key_here", {
  baseUrl: "http://localhost:3000"  // optional
});

// Event-based notification (uses templates)
await notify.track("USER_LOGIN", {
  email: "user@example.com",
  name: "Ayush",
  time: new Date().toISOString()
});

// Direct email (no template needed)
await notify.send({
  to: "user@example.com",
  subject: "Hello from NotifyStack",
  body: "This is a test notification."
});

// List notifications
const list = await notify.listNotifications({ limit: 10 });
```

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `baseUrl` | `http://localhost:3000` | API server URL |
| `maxRetries` | `3` | Retry attempts for failed requests |
| `timeoutMs` | `10000` | Request timeout in milliseconds |

## Features

- Auto-retry with exponential backoff
- Automatic idempotency keys
- Zero dependencies (uses native `fetch`)
- Proper error handling with `NotifyError`
