# NovaCart — Designed for Joy 🛍️

A vibrant, full-stack **MERN** e-commerce application built with the **"Vibrant Joy"**
design system — warm cream palette, squircle shapes, and playful micro-animations.

- **Frontend:** React 18 · Vite · Tailwind CSS · React Router
- **Backend:** Node.js · Express · MongoDB (Mongoose)
- **Auth:** JWT + bcrypt

## Features

- Product catalog with category filtering, search, and price sort
- Product detail pages with color swatches, quantity, and sticky add-to-cart
- Cart with quantity controls and order summary
- Checkout (shipping address) → order success with receipt
- JWT authentication (register / login)
- User dashboard with Joy Points, order history, and wishlist
- Admin CRM dashboard with sales KPIs and order pipeline

## Quick Start

### Option A — Local (Manual)

```bash
# 1. Install all dependencies (root)
npm run install-all

# 2. Seed the demo database (requires MongoDB running)
npm run seed

# 3. Run backend (http://localhost:5001) + frontend (http://localhost:5173)
npm run dev
```

### Option B — Docker (Recommended)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.

```bash
# 1. Start all services (MongoDB + Server + Client)
docker compose up -d --build

# 2. Seed the database (run inside server container)
docker exec -it novacart-server node seed/seed.js

# 3. Open in browser
open http://localhost:3000
```

**Useful Docker commands:**

```bash
# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f server
docker compose logs -f client

# Stop all services
docker compose down

# Stop and remove volumes (fresh start)
docker compose down -v

# Rebuild after code changes
docker compose up -d --build

# Check container health
docker compose ps
```

**Demo logins** — Admin: `admin@novacart.com` / `password123` · User:
`alex@novacart.com` / `password123`

## Testing

### API Tests (Server)

```bash
# Start server first
cd server && node server.js

# Run API tests (50 tests)
node tests/api.test.js
```

### E2E Tests (Docker)

```bash
# Run full E2E suite against Docker containers
docker compose -f docker-compose.yml -f docker-compose.test.yml up --build --abort-on-container-exit
```

## Documentation

Full documentation lives in [`docs/`](docs/README.md):

- [Getting Started](docs/GETTING_STARTED.md)
- [Developer Guide](docs/DEVELOPER_GUIDE.md)
- [Design System](docs/DESIGN_SYSTEM.md)
- [API Reference](docs/API_REFERENCE.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## Project Structure

```
├── client/          # React frontend (Vite + Tailwind)
│   ├── Dockerfile   # Multi-stage: build + nginx
│   └── nginx.conf   # Reverse proxy config
├── server/          # Express backend (models, controllers, routes)
│   └── Dockerfile   # Node 20 Alpine + non-root user
├── docs/            # Documentation + original design source files
├── docker-compose.yml   # Production stack (Mongo + Server + Client)
└── .dockerignore        # Docker build exclusions
```
