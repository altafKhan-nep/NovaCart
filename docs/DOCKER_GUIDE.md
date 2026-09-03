# NovaCart — Docker Implementation Guide

## Table of Contents
- [Overview](#overview)
- [What Was Added](#what-was-added)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Docker Commands Reference](#docker-commands-reference)
- [How It Works](#how-it-works)
- [Environment Variables](#environment-variables)
- [Networking](#networking)
- [Volumes & Data Persistence](#volumes--data-persistence)
- [Troubleshooting](#troubleshooting)
- [Development vs Production](#development-vs-production)

---

## Overview

NovaCart is containerized using Docker with 3 services running together:
- **MongoDB 7** — Database
- **Express Server** — Backend API (Node 20 Alpine)
- **Nginx + React** — Frontend (Vite build served by Nginx)

Everything starts with a single command and runs on `http://localhost:3000`.

---

## What Was Added

### Files Created

| File | Purpose |
|------|---------|
| `server/Dockerfile` | Builds the backend API container |
| `server/.dockerignore` | Excludes node_modules, .env from server build |
| `client/Dockerfile` | Multi-stage build: Vite → Nginx |
| `client/.dockerignore` | Excludes node_modules, dist from client build |
| `client/nginx.conf` | Nginx config for SPA routing + API proxy |
| `docker-compose.yml` | Defines all 3 services, networks, volumes |
| `docker-compose.test.yml` | E2E test runner overlay |
| `.dockerignore` | Root-level build context exclusions |
| `tests/Dockerfile.e2e` | E2E test container |
| `tests/e2e-docker.test.js` | 70 automated E2E tests |
| `tests/package.json` | CommonJS module config for tests |
| `server/server.js` | Added `/api/health` endpoint |
| `server/.env` | Added `LOGIN_RATE_LIMIT_MAX` env var |

### Server Dockerfile Explained

```dockerfile
FROM node:20-alpine          # Lightweight Node.js image
WORKDIR /app                 # Set working directory
COPY package*.json ./        # Copy package files first (for Docker layer caching)
RUN npm ci --omit=dev        # Install production dependencies only
COPY . .                     # Copy source code
RUN addgroup -g 1001 -S novacart && adduser -S novacart -u 1001 -G novacart
USER novacart                # Run as non-root user (security)
EXPOSE 5001                  # Expose API port
HEALTHCHECK ...              # Built-in health check
CMD ["node", "server.js"]    # Start the server
```

**Key decisions:**
- `npm ci --omit=dev` — Skips devDependencies (nodemon, etc.) to keep image small
- Non-root user — Security best practice, prevents container escape attacks
- Health check — Docker auto-restarts unhealthy containers

### Client Dockerfile Explained (Multi-Stage)

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build            # Produces /app/dist

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Why multi-stage?**
- Build stage has Node.js + all dev tools (~400MB)
- Serve stage has only Nginx + static files (~25MB)
- Final image is **10x smaller** than single-stage

### Nginx Configuration

```nginx
# SPA routing — all routes fallback to index.html
# index.html has no-cache headers so browser always fetches latest version
location / {
    try_files $uri $uri/ /index.html;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}

# Static assets (hashed filenames) — cache for 1 year
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# API proxy — forwards /api/* to the server container
location /api {
    proxy_pass http://server:5001;
    # ... headers, timeouts
}

# Gzip compression
gzip on;
gzip_types text/plain text/css application/json ...;
```

**Cache strategy:**
- `index.html` → `no-cache, no-store` (browser always fetches latest)
- JS/CSS assets with hashed filenames → `immutable` (cached 1 year, filename changes when content changes)
- This prevents the old bug where stale `index.html` was served from browser cache

### Docker Compose Structure

```yaml
services:
  mongo:        # MongoDB 7 with persistent volume
  server:       # Express API, depends on mongo
  client:       # Nginx + React, depends on server

volumes:
  mongo_data:   # Persists database across restarts
```

**Health checks ensure proper startup order:**
1. MongoDB starts first, health check verifies it's ready
2. Server starts after MongoDB is healthy
3. Client starts after Server is healthy

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                 Docker Network              │
│                 (novacart_default)           │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  MongoDB  │  │  Server  │  │  Client  │ │
│  │  :27017   │←─│  :5001   │←─│  :80     │ │
│  │           │  │  Express │  │  Nginx   │ │
│  │  mongo:7  │  │  Node 20 │  │  Alpine  │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│       ↑             ↑             ↑        │
│       └─────────────┴─────────────┘        │
│              docker network                │
└─────────────────────────────────────────────┘
         ↑                          ↑
    Port 27017                  Port 3000
    (external)                 (external)
```

**Port mapping:**
| Container | Internal Port | External Port | Purpose |
|-----------|--------------|---------------|---------|
| mongo | 27017 | 27017 | MongoDB (optional external access) |
| server | 5001 | 5001 | API (optional external access) |
| client | 80 | **3000** | Website (main entry point) |

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- At least 4GB RAM allocated to Docker
- Ports 3000, 5001, 27017 free

Check Docker is running:
```bash
docker --version
docker compose version
```

---

## Quick Start

### 1. Build and Start All Services

```bash
cd "ecomerce site"
docker compose up -d --build
```

**What this does:**
- Downloads MongoDB 7 image
- Builds server image (installs npm dependencies, copies code)
- Builds client image (compiles React, sets up Nginx)
- Starts all 3 containers with health checks
- Connects them on a private Docker network

**First time takes 2-5 minutes.** Subsequent starts use cached layers (~10 seconds).

### 2. Seed the Database

```bash
docker exec novacart-server node seed/seed.js
```

**This creates:**
- 14 products across Electronics, Home Decor, Fashion
- 8 users (admin, content manager, order manager, 4 customers)
- 6 orders with realistic data
- 3 banners, 4 categories, 7 nav items
- 3 promotions, default settings

### 3. Open in Browser

```
http://localhost:3000
```

### 4. Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@novacart.com` | `password123` |
| Admin | `admin@novacart.com` | `password123` |
| Content Manager | `content@novacart.com` | `password123` |
| Order Manager | `orders@novacart.com` | `password123` |
| Customer | `alex@novacart.com` | `password123` |
| Customer | `maria@novacart.com` | `password123` |

---

## Docker Commands Reference

### Starting & Stopping

```bash
# Start all services (background)
docker compose up -d

# Start with build (rebuild images first)
docker compose up -d --build

# Start and see live logs
docker compose up

# Stop all services
docker compose down

# Stop and remove volumes (fresh database)
docker compose down -v

# Restart a specific service
docker compose restart server
docker compose restart client
docker compose restart mongo
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f server
docker compose logs -f client
docker compose logs -f mongo

# Last 50 lines
docker compose logs --tail 50 server

# Logs with timestamps
docker compose logs -f --timestamps server
```

### Managing Containers

```bash
# List running containers
docker compose ps

# List all containers (including stopped)
docker compose ps -a

# Execute command in running container
docker exec novacart-server node seed/seed.js
docker exec novacart-mongo mongosh
docker exec novacart-client nginx -t          # Test nginx config

# Open interactive shell in container
docker exec -it novacart-server sh
docker exec -it novacart-mongo mongosh
docker exec -it novacart-client sh

# Stop a specific container
docker compose stop server

# Start a specific container
docker compose start server

# Remove a specific container
docker compose rm -f server
```

### Managing Images

```bash
# List Docker images
docker images | grep novacart
docker images | grep ecomercesite

# Remove all project images
docker rmi ecomercesite-server ecomercesite-client

# Remove all dangling images
docker image prune

# Remove all unused images (aggressive cleanup)
docker image prune -a

# Rebuild a specific image
docker compose build server
docker compose build client
docker compose build --no-cache server     # No cache, fresh build
```

### Managing Volumes

```bash
# List volumes
docker volume ls

# Inspect volume details
docker volume inspect ecomercesite_mongo_data

# Remove volume (DELETES ALL DATABASE DATA)
docker volume rm ecomercesite_mongo_data

# Remove all unused volumes
docker volume prune
```

### Complete Cleanup

```bash
# Nuclear option — remove everything
docker compose down -v --rmi all

# Then rebuild from scratch
docker compose up -d --build
docker exec novacart-server node seed/seed.js
```

---

## How It Works

### Request Flow

```
Browser → http://localhost:3000
    ↓
Nginx (client container, port 80)
    ↓
  ├── Static files (HTML, JS, CSS) → served from /usr/share/nginx/html
  ├── /api/* requests → proxy_pass to http://server:5001
  └── All other routes → index.html (SPA routing)
    ↓
Express Server (server container, port 5001)
    ↓
  ├── JWT authentication
  ├── Rate limiting
  ├── Input validation
  └── MongoDB queries
    ↓
MongoDB (mongo container, port 27017)
    ↓
  └── Database: novacart
```

### Health Checks

Each container has a health check that Docker monitors automatically:

| Container | Check | Interval | Timeout |
|-----------|-------|----------|---------|
| mongo | `mongosh --eval "db.adminCommand('ping')"` | 30s | 10s |
| server | `wget http://localhost:5001/api/health` | 30s | 10s |
| client | `wget http://localhost:80` | 30s | 5s |

If a container fails health checks 3 times, Docker restarts it automatically.

### Layer Caching

Docker uses layer caching for fast rebuilds:

```
1. COPY package*.json    ← Cached if package.json unchanged
2. RUN npm ci            ← Skipped if layer 1 cached
3. COPY . .              ← Rebuilds from here if code changed
4. RUN npm run build     ← Rebuilds with new code
```

**This means:** If you only change React components (no new npm packages), the npm install step is skipped and rebuild takes ~2 seconds.

---

## Environment Variables

### Server (.env in docker-compose.yml)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5001` | Server listen port |
| `NODE_ENV` | `production` | Environment mode |
| `MONGO_URI` | `mongodb://mongo:27017/novacart` | MongoDB connection string |
| `JWT_SECRET` | configurable | JWT signing secret |
| `JWT_EXPIRE` | `7d` | Token expiration |
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowed origin |
| `LOGIN_RATE_LIMIT_MAX` | `100` | Login attempts per 15min |

### Adding Custom Environment Variables

Edit `docker-compose.yml`:

```yaml
services:
  server:
    environment:
      - PORT=5001
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/novacart
      - JWT_SECRET=your_secret_here
      - YOUR_CUSTOM_VAR=value
```

Then rebuild:
```bash
docker compose up -d --build server
```

---

## Networking

### Default Network

Docker Compose creates a network named `ecomercesite_default`:

```bash
# List networks
docker network ls | grep novacart

# Inspect network (see connected containers)
docker network inspect ecomercesite_default
```

### Inter-Container Communication

Containers communicate using **service names** as hostnames:

```
server → mongo       (mongodb://mongo:27017/novacart)
client → server      (proxy_pass http://server:5001)
```

No ports need to be exposed between containers — Docker networking handles it.

### Exposing Additional Ports

To access MongoDB directly from your host (for debugging):

```yaml
services:
  mongo:
    ports:
      - "27017:27017"    # Already configured
```

Connect with MongoDB Compass:
```
mongodb://localhost:27017/novacart
```

---

## Volumes & Data Persistence

### MongoDB Data

The `mongo_data` volume persists database data across container restarts:

```yaml
volumes:
  mongo_data:
    driver: local
```

**Without volume:** Data is lost when container is removed.
**With volume:** Data survives `docker compose down` (but NOT `docker compose down -v`).

### Resetting the Database

```bash
# Option 1: Remove volume and reseed
docker compose down -v
docker compose up -d --build
docker exec novacart-server node seed/seed.js

# Option 2: Reseed without removing volume (overwrites data)
docker exec novacart-server node seed/seed.js
```

---

## Troubleshooting

### "Port already in use"

```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different ports in docker-compose.yml
```

### "Cannot connect to Docker daemon"

```bash
# Start Docker Desktop
open -a Docker

# Wait for it to be ready
docker info
```

### Server container won't start

```bash
# Check logs
docker compose logs server

# Common issues:
# - MongoDB not ready yet (health check handles this)
# - Port 5001 already in use
# - .env file missing
```

### Frontend shows blank page

```bash
# Check nginx logs
docker compose logs client

# Test nginx config
docker exec novacart-client nginx -t

# Rebuild client
docker compose up -d --build client
```

### Database is empty after restart

```bash
# Check if volume exists
docker volume ls | grep mongo

# If volume was removed, reseed
docker exec novacart-server node seed/seed.js
```

### "Rate limit" errors during testing

The login rate limiter is set to 100 requests per 15 minutes in Docker. If exceeded:

```bash
# Restart server to reset rate limits
docker compose restart server
```

### Rebuilding after code changes

```bash
# Smart rebuild (uses cache)
docker compose up -d --build

# Full rebuild (no cache)
docker compose up -d --build --no-cache

# Rebuild only server
docker compose up -d --build server

# Rebuild only client
docker compose up -d --build client
```

---

## Development vs Production

### Docker (Production-like)

| Aspect | Docker | Local Development |
|--------|--------|-------------------|
| MongoDB | Containerized | Local install |
| Server | Production mode | Nodemon (auto-restart) |
| Client | Nginx (static build) | Vite dev server (HMR) |
| Hot reload | No (rebuild needed) | Yes (instant) |
| Port | 3000 | 5173 (client) + 5001 (server) |

### When to Use Docker

- **Testing** — Reproducible environment for QA
- **Demo** — Show the app to others without setup
- **Deployment** — Same containers run on any cloud
- **CI/CD** — Automated testing pipeline

### When to Use Local Development

- **Active coding** — Hot reload with Vite is faster
- **Debugging** — Direct access to logs and tools
- **Rapid iteration** — No rebuild step needed

---

## E2E Testing in Docker

### Run Tests

```bash
# Run the full test suite against Docker containers
docker compose -f docker-compose.yml -f docker-compose.test.yml up --build --abort-on-container-exit
```

### Test Coverage (70 tests)

| Section | Tests | What It Tests |
|---------|-------|---------------|
| Infrastructure | 5 | Health endpoint, security headers, gzip |
| Authentication | 7 | Login, register, JWT validation, wrong password |
| Products API | 10 | CRUD, filtering, sorting, auth |
| Categories | 4 | CRUD operations |
| Orders | 5 | Create, list, status update, auth |
| Banners | 4 | CRUD, active banners |
| Promotions | 3 | CRUD operations |
| Admin Dashboard | 5 | Stats, users, analytics, RBAC |
| Navigation | 3 | CRUD operations |
| Settings | 2 | Read, update |
| Security | 6 | NoSQL injection, XSS, oversized payloads |
| Frontend | 5 | Homepage loads, HTML, assets |
| CRUD Lifecycle | 7 | Product → Order → Delete full flow |
| User Flow | 4 | Register → Profile → Orders |

---

## Quick Reference Card

```bash
# START
docker compose up -d --build
docker exec novacart-server node seed/seed.js
open http://localhost:3000

# STOP
docker compose down

# RESET
docker compose down -v
docker compose up -d --build
docker exec novacart-server node seed/seed.js

# LOGS
docker compose logs -f server

# SHELL
docker exec -it novacart-server sh

# CLEANUP
docker compose down -v --rmi all
```
