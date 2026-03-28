import { useState } from "react";
import { BookOpen, Terminal, Zap, Key, Shield, Code, Layers, ServerCrash, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

const sections = [
  { id: "quick-start", title: "Quick Start", icon: Layers },
  { id: "authentication", title: "Authentication", icon: Shield },
  { id: "event-system", title: "Event System", icon: Zap },
  { id: "providers", title: "Providers & Failover", icon: Share2 },
  { id: "sdk-usage", title: "SDK Usage (Node.js)", icon: Code },
  { id: "api-reference", title: "API Reference", icon: Terminal },
  { id: "security", title: "API Key Security", icon: Key },
];

function QuickStart() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink mb-2">Quick Start (5 minutes)</h2>
        <p className="text-sm text-ink-muted">Get your first notification sent using the API.</p>
      </div>

      <div className="card border-2 border-ink">
        <ol className="list-decimal pl-5 space-y-3 text-sm text-ink-muted">
          <li><strong className="text-ink">Sign up</strong> — Create an account on the dashboard</li>
          <li><strong className="text-ink">Create a project</strong> — Go to Projects → "New Project"</li>
          <li><strong className="text-ink">Generate an API key</strong> — Go to API Keys → "Create Key" → <span className="text-red-600 font-medium">copy it immediately</span></li>
          <li><strong className="text-ink">Send your first notification</strong> — Use the curl command below:</li>
        </ol>
        <pre className="mt-4 rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`# Send a notification in 1 line
curl -X POST http://localhost:3000/v1/notifications \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ntf_live_YOUR_KEY" \\
  -d '{"event":"USER_SIGNUP","data":{"email":"test@example.com","name":"Ayush"}}'`}
        </pre>
      </div>
    </div>
  );
}

function Authentication() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink mb-2">Authentication</h2>
        <p className="text-sm text-ink-muted">Secure your requests to the NotifyStack service.</p>
      </div>

      <div className="space-y-4 text-sm text-ink-muted">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card bg-surface-muted/50">
            <p className="font-semibold text-ink mb-2 flex items-center gap-2"><Key className="h-4 w-4" /> API Key (Server)</p>
            <p className="mb-3">Used by your backend to send notifications. Scoped to a single project.</p>
            <code className="text-xs bg-white px-2 py-1 rounded border border-surface-border block">x-api-key: ntf_live_xxxxxx</code>
          </div>
          <div className="card bg-surface-muted/50">
            <p className="font-semibold text-ink mb-2 flex items-center gap-2"><Shield className="h-4 w-4" /> JWT Token (Dashboard)</p>
            <p className="mb-3">Used by the dashboard to manage projects and keys.</p>
            <code className="text-xs bg-white px-2 py-1 rounded border border-surface-border block">Authorization: Bearer eyJhbG...</code>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventSystem() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink mb-2">Event System</h2>
        <p className="text-sm text-ink-muted">Create logic-free API calls. Keep templates in the dashboard.</p>
      </div>

      <div className="space-y-6 text-sm text-ink-muted">
        <div>
          <h3 className="text-base font-semibold text-ink mb-2">How it works</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Create an <strong>event template</strong> (e.g. <code>USER_LOGIN</code>) with variables like <code>{"{{name}}"}</code>.</li>
            <li>Call the API with that event name and a JSON payload containing exactly those variables.</li>
            <li>The worker safely injects the data into the template and dispatches the email.</li>
          </ol>
        </div>

        <div className="card overflow-hidden !p-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Event / Trigger Name</th>
                <th>Subject Example</th>
                <th>Variables</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="font-mono text-xs font-semibold">USER_SIGNUP</td><td>Welcome, {"{{name}}"}!</td><td className="font-mono text-[10px]">name, email</td></tr>
              <tr><td className="font-mono text-xs font-semibold">ORDER_PLACED</td><td>Order #{"{{orderId}}"} confirmed</td><td className="font-mono text-[10px]">name, orderId, total</td></tr>
              <tr><td className="font-mono text-xs font-semibold">PASSWORD_RESET</td><td>Password reset</td><td className="font-mono text-[10px]">email, resetLink</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProvidersFailover() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink mb-2 flex items-center gap-2">Built-in Failover Routing <Zap className="h-5 w-5 text-amber-500" /></h2>
        <p className="text-sm text-ink-muted leading-relaxed">
          The core advantage of NotifyStack is that <strong>you don't need to configure your own email or SMS providers</strong>. You send us a single API request, and we handle the complexity of multi-channel global delivery.
        </p>
      </div>

      <div className="space-y-8 text-sm text-ink-muted">
        <div className="card bg-amber-50/50 border-amber-200">
          <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2"><ServerCrash className="h-4 w-4" /> Global Circuit Breaker</h3>
          <p className="text-amber-800 leading-relaxed mb-3">
            If a primary node (like SendGrid) experiences an outage or yields a 5xx timeout, our system automatically <strong>skips the failing node</strong> for 60 seconds (Circuit Opened) and instantly shifts your traffic to fallback nodes (like Mailgun or external SMTP clusters) <strong>without dropping your request</strong>.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card border border-surface-border">
            <h3 className="font-semibold text-ink mb-2">Email Routing</h3>
            <p className="text-xs leading-relaxed text-ink-muted">
              We maintain active, load-balanced connections to enterprise-grade SendGrid and Mailgun clusters. You do not need to bring your own API keys. You simply use your <code>ntf_live_YOUR_KEY</code> and we guarantee delivery.
            </p>
          </div>
          <div className="card border border-surface-border">
            <h3 className="font-semibold text-ink mb-2">SMS Routing</h3>
            <p className="text-xs leading-relaxed text-ink-muted">
              SMS messages are natively routed through Twilio's global infrastructure. Our engine automatically formats the numbers and handles carrier-specific rate limiting on your behalf.
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-ink mb-2">How to test locally safely?</h3>
          <p className="mb-2">If you are testing your application locally and don't want to accidentally send real emails to your customers, simply use the <strong>Test Environment Key</strong> (coming soon) or use a local mock destination in your API request.</p>
        </div>
      </div>
    </div>
  );
}

function SdkUsage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink mb-2">SDK Usage</h2>
        <p className="text-sm text-ink-muted">Using the official Node.js SDK for maximum type safety.</p>
      </div>

      <div className="space-y-4">
        <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`npm install notify-saas-sdk`}
        </pre>
        <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`const NotifySDK = require("notify-saas-sdk");

// Init with automatic fallback handling handled silently on our end
const notify = new NotifySDK(process.env.NOTIFY_API_KEY);

// 1. Send via pre-defined template
await notify.track("ORDER_PLACED", {
  email: "buyer@example.com",
  orderId: "#10928",
  total: "$49.99"
});

// 2. Or send raw notification
await notify.send({
  to: "buyer@example.com",
  subject: "Shipping Update",
  body: "Your package #10928 has shipped via UPS."
});`}
        </pre>
      </div>
    </div>
  );
}

function ApiReference() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink mb-2">API Reference</h2>
        <p className="text-sm text-ink-muted">Raw REST access via cURL.</p>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Send Event</p>
          <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`curl -X POST http://localhost:3000/v1/notifications \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ntf_live_YOUR_KEY" \\
  -H "x-idempotency-key: unique-request-123" \\
  -d '{
    "event": "USER_LOGIN",
    "data": { "email": "user@test.com", "name": "Ayush" }
  }'`}
          </pre>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Retry Failed Notification</p>
          <pre className="rounded-lg border border-surface-border bg-neutral-900 p-4 text-sm text-green-400 overflow-x-auto">
{`curl -X POST http://localhost:3000/v1/notifications/dlq/ntf_abc123/requeue \\
  -H "x-api-key: ntf_live_YOUR_KEY"`}
          </pre>
        </div>
      </div>
    </div>
  );
}

function Security() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink mb-2">Security Guidelines</h2>
      </div>
      <ul className="list-disc pl-5 space-y-3 text-sm text-ink-muted">
        <li>Keys are shown <strong className="text-red-600">only once</strong> at creation — save them to your ENV immediately.</li>
        <li>System only stores SHA-256 hashes of your keys, making it impossible for DB leaks to compromise your active integrations.</li>
        <li>Rate limiting: <strong>120 requests/minute</strong> per API key to prevent spam overages.</li>
        <li>Include <code className="bg-surface-muted px-1 rounded">x-idempotency-key</code> in POST headers to permanently prevent duplicate charging and double-sends on retries.</li>
      </ul>
    </div>
  );
}

export default function Docs() {
  const [active, setActive] = useState("quick-start");

  const views = {
    "quick-start": QuickStart,
    "authentication": Authentication,
    "event-system": EventSystem,
    "providers": ProvidersFailover,
    "sdk-usage": SdkUsage,
    "api-reference": ApiReference,
    "security": Security
  };

  const ActiveComponent = views[active];

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[70vh]">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0 md:sticky md:top-6 h-fit bg-white/50 md:bg-transparent rounded-2xl md:rounded-none border border-surface-border md:border-none p-4 md:p-0">
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-ink-muted">Documentation</h2>
        </div>
        <nav className="space-y-1">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActive(sec.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left",
                active === sec.id
                  ? "bg-ink text-white shadow-sm"
                  : "text-ink-muted hover:bg-surface-muted hover:text-ink"
              )}
            >
              <sec.icon className={cn("h-4 w-4 shrink-0", active === sec.id ? "text-white" : "text-ink-subtle")} />
              {sec.title}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 bg-white rounded-2xl border border-surface-border p-6 md:p-10 shadow-sm relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-full"
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
