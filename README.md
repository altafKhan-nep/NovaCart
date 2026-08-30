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

```bash
# 1. Install all dependencies (root)
npm run install-all

# 2. Seed the demo database (requires MongoDB running)
npm run seed

# 3. Run backend (http://localhost:5001) + frontend (http://localhost:5173)
npm run dev
```

**Demo logins** — Admin: `admin@novacart.com` / `password123` · User:
`alex@novacart.com` / `password123`

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
├── client/   # React frontend (Vite + Tailwind)
├── server/   # Express backend (models, controllers, routes)
└── docs/     # Documentation + original design source files
```
