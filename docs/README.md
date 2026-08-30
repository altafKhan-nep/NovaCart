# NovaCart — Full-Stack MERN E-commerce

NovaCart is a vibrant, full-stack e-commerce application built with the **MERN stack**
(MongoDB, Express.js, React, Node.js). Its UI follows the **"Vibrant Joy"** design system —
a fusion of Modern Minimalism and Soft-Organic styles with a warm cream palette, rounded
"squircle" shapes, and playful micro-animations.

This folder contains all the developer-facing documentation for the project.

## Documentation Index

| Document | Purpose |
| --- | --- |
| [Getting Started](GETTING_STARTED.md) | Install, configure, and run the app locally |
| [Developer Guide](DEVELOPER_GUIDE.md) | Project structure, architecture, code conventions, and workflows |
| [Design System](DESIGN_SYSTEM.md) | The "Vibrant Joy" design tokens: colors, typography, spacing, components |
| [API Reference](API_REFERENCE.md) | All REST API endpoints, requests, and responses |
| [Database Schema](DATABASE_SCHEMA.md) | MongoDB models: Product, User, Order |
| [Deployment Guide](DEPLOYMENT.md) | Build and deploy the app to production |

## Quick Overview

- **Frontend:** React 18 + Vite + Tailwind CSS (in `client/`)
- **Backend:** Express + MongoDB (Mongoose) (in `server/`)
- **Auth:** JWT (JSON Web Tokens) with protected routes
- **Key features:** catalog + search/filter, cart + checkout, order success, user
  dashboard + wishlist, admin CRM dashboard

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@novacart.com` | `password123` |
| User | `alex@novacart.com` | `password123` |

> **Note:** The original design source files (HTML/CSS mockups from Stitch, screenshot
> PNGs, and the original `DESIGN.md`) live in the `docs/stitch_...` subfolder.
