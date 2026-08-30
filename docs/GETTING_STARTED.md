# Getting Started

Follow these steps to run NovaCart locally on your machine.

## Prerequisites

- **Node.js** v18 or later (v20+ recommended)
- **npm** (comes with Node.js)
- **MongoDB** running locally (or a MongoDB Atlas connection string)

Verify your environment:

```bash
node --version
npm --version
mongod --version   # or confirm your MongoDB Atlas URI
```

## 1. Install dependencies

From the project **root** directory:

```bash
npm run install-all
```

This installs dependencies for both the backend (`server/`) and frontend (`client/`).
Key versions: **Vite 6**, **React Router v7**, **Express**, **Mongoose**.

> **Note:** a root `npm audit` reports **0 vulnerabilities**. The
> `react-router-dom` and `vite`/`esbuild` vulnerabilities from earlier
> builds were resolved by upgrading to v7.18.3 and 6.4.3 respectively.

## 2. Configure the environment

Create a `.env` file in the `server/` folder. A `.env.example`-style default is already
provided at `server/.env`:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/novacart
JWT_SECRET=novacart_super_secret_jwt_key_change_me
JWT_EXPIRE=7d
```

> **Important:** Change `JWT_SECRET` to a strong, unique value before deploying.

By default the app connects to a local MongoDB database named `novacart`.

## 3. Seed the database

Load sample products and demo users:

```bash
npm run seed
```

This inserts 14 products across 4 categories plus two demo users
(`admin@novacart.com` / `password123` and `alex@novacart.com` / `password123`).

## 4. Start the development servers

From the root run both the backend and frontend together:

```bash
npm run dev
```

Or run them separately in two terminals:

```bash
# Terminal 1 — backend (http://localhost:5001)
npm run server

# Terminal 2 — frontend (http://localhost:5173)
npm run client
```

## 5. Open the app

- Frontend: **http://localhost:5173**
- Backend health check: **http://localhost:5001/**

The Vite dev server proxies all `/api/*` requests to the backend, so no extra CORS
configuration is needed during development.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `MongoNetworkError` | Ensure MongoDB is running (`brew services start mongodb-community` on macOS) or fix `MONGO_URI` |
| `Address already in use :::5001` | Another process is using port 5001; change `PORT` in `server/.env` and update the proxy in `client/vite.config.js` |
| Missing products on the home page | Re-run `npm run seed` |
| Login says invalid credentials | Re-run `npm run seed` (this resets demo users) |
| `Too many requests` / HTTP 429 | The server's rate limiter is active (300 req/15 min on `/api`). Wait a few minutes or spread requests. |

## Security hardening

The server attaches several security layers by default:

- **Helmet** — CSP, `X-Frame-Options`, `X-Content-Type-Options`,
  `Strict-Transport-Security`, and removes `X-Powered-By`.
- **CORS** — restricted to `localhost:5173/5174` and `127.0.0.1:5173/5174`.
  Requests from other origins are rejected with **403**.
- **Rate limiting** — to protect login and API endpoints from abuse.
- **Error handler** — validation errors return **400** (not 500); stack
  traces are omitted in production (`NODE_ENV=production`).
