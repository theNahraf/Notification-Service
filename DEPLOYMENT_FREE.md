# NotifyStack: 100% Free Production Hosting Guide

This guide explains how to host your NotifyStack SaaS platform entirely for free using modern cloud providers, without needing Docker or AWS.

---

## 🏗️ The Infrastructure Stack (Free Tier)

| Component | Provider | Setup link |
| :--- | :--- | :--- |
| **Frontend Dashboard** | [Vercel](https://vercel.com/) | [vercel.com/new](https://vercel.com/new) |
| **Backend API** | [Render](https://render.com/) | [dashboard.render.com](https://dashboard.render.com/) |
| **Background Worker** | [Render](https://render.com/) | [dashboard.render.com](https://dashboard.render.com/) |
| **Database (Postgres)** | [Neon](https://neon.tech/) | [neon.tech](https://neon.tech/) |
| **Redis (Cache/Rate-limit)**| [Upstash](https://upstash.com/redis) | [console.upstash.com](https://console.upstash.com/) |
| **Kafka (Streaming)** | [Redpanda Cloud](https://cloud.redpanda.com/) | [cloud.redpanda.com](https://cloud.redpanda.com/) |

---

## 1. Database Setup (Neon)
1. Sign up at [Neon.tech](https://neon.tech/).
2. Create a new project named `notifystack`.
3. Copy the **Connection String** from the dashboard.
4. **Important:** Ensure `?sslmode=require` is at the end of the URL.

## 2. Redis Setup (Upstash)
1. Sign up at [Upstash](https://upstash.com/).
2. Create a **Redis** database.
3. Copy the `REDIS_URL`.

## 3. Kafka Setup (Redpanda Cloud)
1. Sign up at [Redpanda Cloud](https://cloud.redpanda.com/).
2. Create a **Serverless** cluster.
3. In the cluster dashboard, click the **"Kafka API"** tab under "How to connect".
4. Copy the **Bootstrap Server** URL.
5. Go to **Security > Users** to create a new user. Copy the **Username** and **Password**.
6. Under **Topics**, create two topics: `email_queue` and `email_dlq`.

---

## 4. Deploying the Backend API (Render)
1. Go to [Render](https://render.com/) and create a **New Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Name:** `notifystack-api`
   - **Root Directory:** `api`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
4. Add **Environment Variables**:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: (Paste your Neon URL)
   - `REDIS_URL`: (Paste your Upstash Redis URL)
   - `JWT_SECRET`: (Generate a long random string)
   - `KAFKA_BROKERS`: (Paste Redpanda Bootstrap Server URL)
   - `KAFKA_SASL_USERNAME`: (Your Redpanda Username)
   - `KAFKA_SASL_PASSWORD`: (Your Redpanda Password)
   - `KAFKA_SSL`: `true`
   - `WORKER_URL`: (Paste your Render Worker URL once it is created)

## 5. Deploying the Worker (Render)
1. Create another **New Web Service** on Render.
2. Connect the same GitHub repository.
3. Configure settings:
   - **Name:** `notifystack-worker`
   - **Root Directory:** `worker`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
4. Add the **same Environment Variables** as the API, plus:
   - `APP_URL`: (Paste your Vercel Dashboard URL once it is created)

---

## 6. Deploying the Dashboard (Vercel)
1. Go to [Vercel](https://vercel.com/) and import your GitHub repository.
2. **Root Directory:** `dashboard`
3. Add **Environment Variables**:
   - `VITE_API_URL`: (Paste your Render API URL, e.g., `https://notifystack-api.onrender.com`)
4. Deploy!

---

## 7. Final Polish (Keep Alive)
> [!IMPORTANT]
> Render's free services "sleep" after 15 minutes. Use [Cron-job.org](https://cron-job.org/) to ping your Render `/health` endpoints every 10 minutes to keep them awake for free.
