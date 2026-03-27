# NotifyStack — SaaS Notification Platform

A production-grade, multi-tenant notification SaaS built with **Node.js**, **Express**, **Kafka**, **Redis**, and **PostgreSQL**.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    NotifyStack Platform                       │
│                                                              │
│  ┌─────────┐    ┌────────────────────┐    ┌──────────────┐  │
│  │Dashboard │───▶│   API Server (3000) │◀───│  SDK Client  │  │
│  │ React UI │    │                    │    │  (Node.js)   │  │
│  │  :5173   │    │  JWT + API Key Auth │    │              │  │
│  └─────────┘    └─────────┬──────────┘    └──────────────┘  │
│                           │                                  │
│           ┌───────────────┼───────────────┐                  │
│           ▼               ▼               ▼                  │
│     ┌──────────┐   ┌──────────┐   ┌──────────────┐          │
│     │PostgreSQL│   │  Redis   │   │    Kafka     │          │
│     │  Users   │   │Rate Limit│   │ email_queue  │          │
│     │ Projects │   │Idempotent│   │  email_dlq   │          │
│     │  Events  │   │  Cache   │   │              │          │
│     └──────────┘   └──────────┘   └──────┬───────┘          │
│                                          │                   │
│                                   ┌──────▼───────┐          │
│                                   │   Worker     │          │
│                                   │ Email Sender │          │
│                                   │ Retry + DLQ  │          │
│                                   └──────────────┘          │
└──────────────────────────────────────────────────────────────┘
```

## Features

- **Multi-tenant** — Users → Projects → API Keys → Notifications
- **JWT Auth** with roles (USER / ADMIN)
- **Stripe-style API keys** (ntf_live_xxx, SHA-256 hashed, show once)
- **Event-driven templates** with {{variable}} resolution
- **Predefined events**: USER_LOGIN, USER_SIGNUP, ORDER_PLACED, PASSWORD_RESET
- **Node.js SDK** with auto-retry, idempotency, exponential backoff
- **Structured logging** with service, event, requestId, metadata
- **DLQ management** — retry single/bulk from dashboard
- **Rate limiting** per API key via Redis
- **Idempotency** via Redis (x-idempotency-key header)
- **Professional dashboard** — black & white Stripe-inspired UI

## Prerequisites

- Node.js 18+
- PostgreSQL
- Redis
- Apache Kafka (with Zookeeper)

## Quick Start

### 1. Database Setup
```bash
# Create database
createdb notifications

# Run migrations
cd api && npm install && npm run migrate
```

### 2. Start Infrastructure
```bash
# Start Redis
redis-server

# Start Kafka (with Zookeeper)
# Follow your Kafka installation guide

# Create Kafka topics
cd api && npm run create-topics
```

### 3. Start Services
```bash
# Terminal 1: API Server
cd api && npm run dev

# Terminal 2: Worker
cd worker && npm install && npm run dev

# Terminal 3: Dashboard
cd dashboard && npm install && npm run dev
```

### 4. Access
- **Dashboard**: http://localhost:5173
- **API**: http://localhost:3000
- **Health**: http://localhost:3000/health

## API Endpoints

### Auth (Public)
| Method | Path | Description |
|--------|------|-------------|
| POST | /v1/auth/signup | Register |
| POST | /v1/auth/login | Login |
| GET | /v1/auth/me | Current user (JWT) |

### Projects (JWT)
| Method | Path | Description |
|--------|------|-------------|
| POST | /v1/projects | Create project |
| GET | /v1/projects | List projects |
| GET | /v1/projects/:id | Project details + stats |
| DELETE | /v1/projects/:id | Delete project |

### API Keys (JWT, nested under project)
| Method | Path | Description |
|--------|------|-------------|
| POST | /v1/projects/:pid/keys | Create key |
| GET | /v1/projects/:pid/keys | List keys |
| DELETE | /v1/projects/:pid/keys/:kid | Revoke key |
| POST | /v1/projects/:pid/keys/:kid/regenerate | Regenerate key |

### Event Templates (JWT, nested under project)
| Method | Path | Description |
|--------|------|-------------|
| POST | /v1/projects/:pid/events | Create template |
| GET | /v1/projects/:pid/events | List templates |
| PUT | /v1/projects/:pid/events/:id | Update template |
| DELETE | /v1/projects/:pid/events/:id | Delete template |
| POST | /v1/projects/:pid/events/preview | Preview template |

### Notifications (API Key auth — for SDK)
| Method | Path | Description |
|--------|------|-------------|
| POST | /v1/notifications | Send notification |
| GET | /v1/notifications | List notifications |
| GET | /v1/notifications/dlq | Failed notifications |
| POST | /v1/notifications/dlq/:id/requeue | Retry one |
| POST | /v1/notifications/dlq/requeue-bulk | Retry many |

## SDK Usage

```js
const NotifySDK = require("notify-saas-sdk");

const notify = new NotifySDK("ntf_live_your_key", {
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
  body: "Direct notification"
});
```

## Environment Variables

### API (.env)
| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | API port |
| DATABASE_URL | — | PostgreSQL connection string |
| REDIS_URL | redis://127.0.0.1:6379 | Redis URL |
| KAFKA_BROKERS | localhost:9092 | Kafka brokers |
| JWT_SECRET | — | JWT signing secret |
| JWT_EXPIRES_IN | 7d | Token expiry |
| CORS_ORIGIN | http://localhost:5173 | Allowed CORS origin |
| RATE_LIMIT_MAX | 120 | Requests per window |

### Worker (.env)
| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | — | PostgreSQL connection string |
| KAFKA_BROKERS | localhost:9092 | Kafka brokers |
| SMTP_HOST | — | Email server host |
| SMTP_PORT | 587 | Email server port |
| SMTP_USER | — | Email username |
| SMTP_PASS | — | Email password |
| MAX_RETRIES | 3 | Max retry before DLQ |

## Folder Structure

```
notification/
├── api/                    # Express API server
│   ├── config/             # Environment config
│   ├── controllers/        # Route handlers
│   ├── db/                 # Schema, migrations, pool
│   ├── kafka/              # Producer, topic admin
│   ├── middleware/          # Auth, rate limit, logging
│   ├── redis/              # Cache, idempotency, rate limiter
│   ├── routes/             # Express route definitions
│   ├── services/           # Business logic
│   ├── utils/              # Logger
│   └── index.js            # Entry point
├── worker/                 # Kafka consumer + email sender
│   ├── config/
│   ├── db/
│   ├── kafka/              # Consumer, DLQ producer
│   ├── services/           # Email sender, log writer
│   └── index.js
├── dashboard/              # React + Tailwind UI
│   └── src/
│       ├── components/     # Toast, Modal, Pagination, Badge
│       ├── contexts/       # AuthContext, ProjectContext
│       ├── layouts/        # MainLayout
│       ├── lib/            # API client, utils
│       └── pages/          # All dashboard pages
├── sdk/                    # Node.js SDK
│   ├── index.js
│   └── README.md
└── README.md               # This file
```

## Scaling Considerations

- **Kafka partitions**: 6 for email_queue, 3 for DLQ — scale consumers horizontally
- **Redis**: Used for rate limiting + idempotency, can be clustered
- **PostgreSQL**: Add read replicas for dashboard queries
- **API**: Stateless — run behind a load balancer
- **Worker**: Scale by adding more consumer instances (same group ID)

## Security

- Passwords hashed with bcrypt (12 rounds)
- API keys stored as SHA-256 hashes only
- JWT tokens with configurable expiry
- Rate limiting per API key via Redis
- Input validation via express-validator
- Helmet.js security headers
- CORS with configurable origin whitelist
- No cross-tenant data access (enforced at DB + middleware)
