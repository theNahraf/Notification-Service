import { BookOpen, Terminal, Zap, Key, Shield } from "lucide-react";

export default function Docs() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Documentation</h1>
        <p className="mt-1 text-sm text-ink-muted">API reference, SDK usage, and integration guide.</p>
      </div>

      {/* Auth */}
      <section className="card">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-ink-muted" />
          <h2 className="text-lg font-semibold">Authentication</h2>
        </div>
        <div className="space-y-3 text-sm text-ink-muted">
          <p>Two authentication methods are supported:</p>
          <div className="rounded-lg border border-surface-border bg-surface-muted p-4 space-y-2">
            <p className="font-medium text-ink">1. JWT (Dashboard)</p>
            <p>Use <code className="text-xs bg-white px-1 py-0.5 rounded border border-surface-border">Authorization: Bearer &lt;token&gt;</code> from login.</p>
          </div>
          <div className="rounded-lg border border-surface-border bg-surface-muted p-4 space-y-2">
            <p className="font-medium text-ink">2. API Key (SDK / External)</p>
            <p>Use <code className="text-xs bg-white px-1 py-0.5 rounded border border-surface-border">x-api-key: ntf_live_xxx</code> header.</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Sign Up</p>
          <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`curl -X POST http://localhost:3000/v1/auth/signup \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Ayush",
    "email": "ayush@example.com",
    "password": "securepass123"
  }'`}
          </pre>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Login</p>
          <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`curl -X POST http://localhost:3000/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "ayush@example.com",
    "password": "securepass123"
  }'`}
          </pre>
        </div>
      </section>

      {/* API Usage */}
      <section className="card">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="h-5 w-5 text-ink-muted" />
          <h2 className="text-lg font-semibold">API Usage</h2>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Send Event-Based Notification</p>
            <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`curl -X POST http://localhost:3000/v1/notifications \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ntf_live_your_key_here" \\
  -d '{
    "event": "USER_LOGIN",
    "data": {
      "email": "user@example.com",
      "name": "Ayush",
      "time": "2024-01-01T12:00:00Z"
    }
  }'`}
            </pre>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Send Direct Email</p>
            <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`curl -X POST http://localhost:3000/v1/notifications \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ntf_live_your_key_here" \\
  -H "x-idempotency-key: unique-key-123" \\
  -d '{
    "recipientEmail": "user@example.com",
    "subject": "Hello from NotifyStack",
    "body": "This is a direct notification."
  }'`}
            </pre>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">List Notifications</p>
            <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`curl http://localhost:3000/v1/notifications?limit=20&status=sent \\
  -H "x-api-key: ntf_live_your_key_here"`}
            </pre>
          </div>
        </div>
      </section>

      {/* SDK */}
      <section className="card">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-ink-muted" />
          <h2 className="text-lg font-semibold">SDK Usage (Node.js)</h2>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Installation</p>
            <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`npm install ./sdk   # local install from sdk/ directory`}
            </pre>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Event-Based Notification</p>
            <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`const NotifySDK = require("notify-saas-sdk");

const notify = new NotifySDK("ntf_live_your_key_here", {
  baseUrl: "http://localhost:3000"
});

// Event-based (uses templates)
await notify.track("USER_LOGIN", {
  email: "user@example.com",
  name: "Ayush",
  time: new Date().toISOString()
});

// Direct email
await notify.send({
  to: "user@example.com",
  subject: "Hello",
  body: "Direct notification body"
});`}
            </pre>
          </div>
          <p className="text-sm text-ink-muted">
            The SDK automatically handles retry with exponential backoff, idempotency keys, and error handling.
          </p>
        </div>
      </section>

      {/* Event System */}
      <section className="card">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-ink-muted" />
          <h2 className="text-lg font-semibold">Event System</h2>
        </div>
        <div className="space-y-3 text-sm text-ink-muted">
          <p>Events use templates with Mustache-style variable syntax: <code className="bg-surface-muted px-1 py-0.5 rounded text-xs">{"{{variableName}}"}</code></p>
          <div className="rounded-lg border border-surface-border overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Predefined Event</th>
                  <th>Default Variables</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="font-mono text-xs">USER_LOGIN</td><td className="text-xs">name, email, time</td></tr>
                <tr><td className="font-mono text-xs">USER_SIGNUP</td><td className="text-xs">name, email</td></tr>
                <tr><td className="font-mono text-xs">ORDER_PLACED</td><td className="text-xs">name, orderId, total</td></tr>
                <tr><td className="font-mono text-xs">PASSWORD_RESET</td><td className="text-xs">name, email, resetLink</td></tr>
              </tbody>
            </table>
          </div>
          <p>You can create custom events with any variable names from the <strong>Event Templates</strong> page.</p>
        </div>
      </section>

      {/* API Key Best Practices */}
      <section className="card">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-5 w-5 text-ink-muted" />
          <h2 className="text-lg font-semibold">API Key Security</h2>
        </div>
        <ul className="list-disc pl-5 space-y-2 text-sm text-ink-muted">
          <li>Keys are shown <strong>only once</strong> at creation — save them immediately</li>
          <li>Only the SHA-256 hash is stored in the database</li>
          <li>Use <strong>Regenerate</strong> to rotate keys without downtime risk</li>
          <li>Rate limiting is enforced per API key (default: 120 requests/minute)</li>
          <li>Keys can be revoked instantly from the API Keys page</li>
          <li>Never commit keys to version control — use environment variables</li>
        </ul>
      </section>
    </div>
  );
}
