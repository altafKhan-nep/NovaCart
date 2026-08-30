# NovaCart Deployment Guide

## Vercel (Frontend) + Render (Backend) + MongoDB Atlas

This guide walks you through deploying the full NovaCart MERN stack to production.

---

## Architecture Overview

```
┌─────────────┐        ┌─────────────┐        ┌─────────────────┐
│   Vercel     │───/api──▶│   Render     │───────▶│  MongoDB Atlas   │
│  (Frontend)  │  proxy  │  (Backend)   │  Mongoose│  (Database)      │
│  Vite+React  │        │  Express API │         │                  │
└─────────────┘        └─────────────┘        └─────────────────┘
  novacart.vercel.app    novacart-api.onrender.com  mongodb+srv://...
```

- **Frontend** is served as static files from Vercel's CDN
- **Backend** runs as a Node.js web service on Render
- **Database** is hosted on MongoDB Atlas (free M0 cluster available)
- Vercel rewrites `/api/*` requests to the Render backend URL

---

## Prerequisites

- [GitHub account](https://github.com)
- [Vercel account](https://vercel.com) (free tier works)
- [Render account](https://render.com) (free tier available)
- [MongoDB Atlas account](https://www.mongodb.com/atlas) (free M0 cluster)
- Node.js 18+ installed locally
- Git installed

---

## Part 1: MongoDB Atlas Setup

### Step 1 — Create a Free Cluster

1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Click **Build a Database**
3. Choose **M0 Sandbox** (free forever)
4. Select a cloud provider and region closest to your users (e.g., AWS us-east-1)
5. Click **Create Cluster** (takes 1–3 minutes)

### Step 2 — Create a Database User

1. In the left sidebar, click **Database Access**
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Set username: `novacart-admin`
5. Generate a secure password and **save it somewhere safe**
6. Under **Database User Privileges**, select **Read and write to any database**
7. Click **Add User**

### Step 3 — Allow Network Access

1. In the left sidebar, click **Network Access**
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (adds `0.0.0.0/0`)
   - This is needed because Render's IP addresses are dynamic
4. Click **Confirm**

### Step 4 — Get the Connection String

1. In the left sidebar, click **Database**
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Driver: **Node.js**, Version: **6.0 or later**
5. Copy the connection string — it looks like:
   ```
   mongodb+srv://novacart-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with the actual password you created
7. Append the database name before the `?`:
   ```
   mongodb+srv://novacart-admin:yourpassword@cluster0.xxxxx.mongodb.net/novacart?retryWrites=true&w=majority
   ```

**Save this string — you'll need it for Render.**

---

## Part 2: Backend Deployment (Render)

### Step 1 — Push Code to GitHub

If your project isn't already on GitHub:

```bash
cd "/Users/altafkhan/Desktop/ecomerce site"
git init
git add .
git commit -m "Initial commit — NovaCart e-commerce platform"
```

Create a new repository on GitHub (e.g., `novacart`), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/novacart.git
git branch -M main
git push -u origin main
```

### Step 2 — Create a Render Web Service

1. Log in to [render.com](https://render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Select the `novacart` repository
5. Fill in the settings:

| Field | Value |
|-------|-------|
| **Name** | `novacart-api` |
| **Region** | Oregon (US West) or closest to you |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | Free (or Starter for production) |

### Step 3 — Set Environment Variables on Render

Click **Advanced** → **Add Environment Variable** for each:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5001` (or leave empty — Render sets PORT automatically) |
| `MONGO_URI` | `mongodb+srv://novacart-admin:yourpassword@cluster0.xxxxx.mongodb.net/novacart?retryWrites=true&w=majority` |
| `JWT_SECRET` | (generate a strong secret — see below) |
| `JWT_EXPIRE` | `7d` |

**To generate a strong JWT_SECRET, run locally:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4 — Deploy

1. Click **Create Web Service**
2. Render will build and deploy (takes 2–5 minutes)
3. Once live, your API URL will be something like:
   ```
   https://novacart-api.onrender.com
   ```
4. Test it by visiting `https://novacart-api.onrender.com/api/products`

### Step 5 — Update CORS for Production

The backend currently only allows `localhost` origins. For production, update `server/server.js` to allow your Vercel domain:

```javascript
// In server/server.js, update the allowedOrigins array:
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  process.env.FRONTEND_URL, // Add this
].filter(Boolean);
```

Then add `FRONTEND_URL` as an environment variable on Render:

| Key | Value |
|-----|-------|
| `FRONTEND_URL` | `https://novacart.vercel.app` |

Click **Save** and Render will auto-redeploy.

---

## Part 3: Frontend Deployment (Vercel)

### Step 1 — Update API Base URL

The frontend uses `/api` as the base URL (`client/src/api/index.js`), which is perfect — Vercel will proxy these to your backend.

### Step 2 — Create a Vercel Configuration

Create a `vercel.json` file in the **project root** (`/Users/altafkhan/Desktop/ecomerce site/vercel.json`):

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://novacart-api.onrender.com/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

> **Important**: Replace `https://novacart-api.onrender.com` with your actual Render URL.

### Step 3 — Import Project on Vercel

1. Log in to [vercel.com](https://vercel.com)
2. Click **Add New...** → **Project**
3. Import your GitHub repository (`novacart`)
4. Vercel will auto-detect it's a Vite project
5. Configure the project:

| Field | Value |
|-------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `client` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

6. Click **Deploy**
7. Vercel builds and deploys (takes 1–2 minutes)
8. Your site will be live at:
   ```
   https://novacart.vercel.app
   ```

### Step 4 — Add Environment Variables (Optional)

If you need any client-side env vars, add them in Vercel dashboard under **Settings** → **Environment Variables**.

For this project, no client-side env vars are needed since the API URL is handled by Vercel rewrites.

---

## Part 4: Seed the Production Database

After your backend is deployed and connected to MongoDB Atlas, seed it with initial data:

### Option A — Run Seed Locally Against Atlas

1. Temporarily update your local `.env` to use the Atlas URI:
   ```
   MONGO_URI=mongodb+srv://novacart-admin:yourpassword@cluster0.xxxxx.mongodb.net/novacart?retryWrites=true&w=majority
   ```

2. Run the seed script:
   ```bash
   cd server
   node seed/seed.js
   ```

3. **Restore your local `.env`** to use local MongoDB after seeding.

### Option B — Add a Seed Route Temporarily

Add this to `server/server.js` (remove after seeding):

```javascript
// TEMPORARY — remove after seeding
const seed = require('./seed/seed');
app.get('/api/seed', async (req, res) => {
  try {
    await seed();
    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

Deploy, visit `https://novacart-api.onrender.com/api/seed`, then **remove this route** and redeploy.

### Seed Data Summary

The seed script creates:

| Data | Count |
|------|-------|
| Users | 8 (4 admin + 4 customers) |
| Products | 14 |
| Categories | 4 (Electronics, Clothing, Home & Living, Accessories) |
| Orders | 6 sample orders |
| Banners | 3 (hero carousel) |
| Navigation | 7 items |
| Promotions | 3 (codes: NOVA10, WELCOME20, FREESHIP) |
| Settings | Default store settings |

### Default Login Credentials

**Admin Accounts:**

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@novacart.com` | `password123` |
| Admin | `admin@novacart.com` | `password123` |
| Content Manager | `content@novacart.com` | `password123` |
| Order Manager | `orders@novacart.com` | `password123` |

**Customer Accounts:**

| Name | Email | Password |
|------|-------|----------|
| Alex Johnson | `alex@novacart.com` | `password123` |
| Maria Garcia | `maria@novacart.com` | `password123` |
| David Kim | `david@novacart.com` | `password123` |
| Priya Patel | `priya@novacart.com` | `password123` |

---

## Part 5: Post-Deployment Verification

### Test the Backend API

```bash
# Health check
curl https://novacart-api.onrender.com/

# Get products
curl https://novacart-api.onrender.com/api/products

# Login
curl -X POST https://novacart-api.onrender.com/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@novacart.com","password":"password123"}'
```

### Test the Frontend

1. Visit `https://novacart.vercel.app`
2. Homepage should load with products, banners, categories
3. Click a product — detail page should work
4. Log in with `alex@novacart.com` / `password123`
5. Add an item to cart
6. Navigate to checkout
7. Log in as admin (`admin@novacart.com`) — admin dashboard should load

### Check for Common Issues

| Issue | Fix |
|-------|-----|
| CORS errors | Add your Vercel URL to `allowedOrigins` in `server.js` and `FRONTEND_URL` env var |
| API returns 404 | Check Vercel rewrites point to correct Render URL |
| "MongoDB connection error" | Verify Atlas connection string and IP allowlist |
| Blank page on Vercel | Check build logs — ensure Root Directory is set to `client` |
| 502 on Render | Check Render logs — usually a missing env variable |
| Slow first load | Render free tier spins down after inactivity — first request takes 30-60s |

---

## Part 6: Custom Domain (Optional)

### Vercel — Add Custom Domain

1. In Vercel dashboard, go to your project → **Settings** → **Domains**
2. Enter your domain (e.g., `novacart.com`)
3. Add the DNS records Vercel provides to your domain registrar:
   - **Type A**: `@` → `76.76.21.21`
   - **Type CNAME**: `www` → `cname.vercel-dns.com`
4. Wait for DNS propagation (up to 48 hours)
5. Vercel auto-provisions SSL certificate

### Render — Add Custom Domain

1. In Render dashboard, go to your web service → **Settings**
2. Scroll to **Custom Domains**
3. Add your domain (e.g., `api.novacart.com`)
4. Add a CNAME record at your DNS provider:
   - **Type CNAME**: `api` → `novacart-api.onrender.com`
5. Render auto-provisions SSL

---

## Part 7: Production Environment Variables Reference

### Render (Backend)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | No | Render sets this automatically |
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Strong random string for JWT signing |
| `JWT_EXPIRE` | No | Token expiry (default: `7d`) |
| `FRONTEND_URL` | Yes | Your Vercel URL for CORS |

### Vercel (Frontend)

No environment variables required — the API URL is handled by `vercel.json` rewrites.

---

## Part 8: Monitoring & Maintenance

### Render Logs

- Go to your web service → **Logs** tab
- Filter by severity to spot errors
- Free tier: logs retained for 1 day
- Starter/Pro: longer retention

### Vercel Analytics

- Go to your project → **Analytics** tab
- Enable Web Vitals tracking
- Monitor deployment previews

### MongoDB Atlas Monitoring

- Go to your cluster → **Metrics** tab
- Monitor connections, storage, operations
- Set up alerts for high usage

### Uptime Monitoring

Add a free monitoring service:

- [UptimeRobot](https://uptimerobot.com) — checks every 5 minutes
- [Better Stack](https://betterstack.com) — incident management included

Monitor both:
```
https://novacart-api.onrender.com/
https://novacart.vercel.app
```

---

## Part 9: Security Checklist

Before going live, verify:

- [ ] `JWT_SECRET` is a strong, random 64+ character string
- [ ] `NODE_ENV` is set to `production` on Render
- [ ] MongoDB Atlas password is strong and unique
- [ ] `FRONTEND_URL` is set to your actual Vercel domain
- [ ] No secrets in Git history (use `.env`, never commit it)
- [ ] Rate limiting is active on all endpoints
- [ ] CORS only allows your frontend domain
- [ ] Helmet security headers are active
- [ ] Input validation middleware is in place

---

## Part 10: Cost Estimate

### Free Tier (Good for Development/Learning)

| Service | Cost |
|---------|------|
| Vercel (Hobby) | Free — 100GB bandwidth/month |
| Render (Free) | Free — spins down after 15min inactivity |
| MongoDB Atlas (M0) | Free — 512MB storage |
| **Total** | **$0/month** |

### Production Tier (Recommended)

| Service | Cost |
|---------|------|
| Vercel (Pro) | $20/month — unlimited bandwidth |
| Render (Starter) | $7/month — no spin-down |
| MongoDB Atlas (M10) | $57/month — 10GB, auto-scaling |
| Custom Domain | ~$12/year |
| **Total** | **~$80/month** |

---

## Part 11: Troubleshooting

### "Application failed to respond" on Render

- Check Render logs for the actual error
- Ensure `MONGO_URI` is correct
- Ensure `JWT_SECRET` is set

### CORS errors in browser console

```
Access to XMLHttpRequest blocked by CORS policy
```

Fix: Add your Vercel URL to `allowedOrigins` in `server.js`:
```javascript
const allowedOrigins = [
  // ... existing origins
  'https://novacart.vercel.app',
];
```

### Render free tier spin-down

Render free tier sleeps after 15 minutes of inactivity. First request takes 30–60 seconds.

Solutions:
- Upgrade to Starter ($7/month)
- Use a cron job to ping the API every 10 minutes (e.g., UptimeRobot)
- Add to `server.js`:
  ```javascript
  // Keep-alive ping (for free tier only)
  if (process.env.NODE_ENV === 'production') {
    setInterval(() => {
      http.get(process.env.RENDER_EXTERNAL_URL || 'http://localhost:5001');
    }, 14 * 60 * 1000); // every 14 minutes
  }
  ```

### Build fails on Vercel

- Ensure **Root Directory** is set to `client`
- Check that `npm run build` works locally in the `client/` folder
- Verify `vite.config.js` has no errors

### MongoDB connection timeout

- Verify Atlas IP allowlist includes `0.0.0.0/0`
- Check the connection string has the database name (`novacart`)
- Ensure the database user has read/write permissions

---

## Quick Deploy Commands Summary

```bash
# 1. Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 2. Push to GitHub
cd "/Users/altafkhan/Desktop/ecomerce site"
git add . && git commit -m "Production ready" && git push

# 3. Seed production database (after backend is deployed)
MONGO_URI="your_atlas_uri" node server/seed/seed.js

# 4. Verify
curl https://novacart-api.onrender.com/api/products
open https://novacart.vercel.app
```

---

## File Structure Reference

```
novacart/
├── vercel.json                  # Vercel config (rewrites, headers)
├── client/                      # Frontend (Vite + React)
│   ├── src/
│   │   ├── api/index.js         # API client (uses /api)
│   │   ├── pages/               # All page components
│   │   ├── components/          # Reusable components
│   │   └── context/             # Auth context
│   ├── vite.config.js           # Vite config
│   └── package.json
├── server/                      # Backend (Express)
│   ├── server.js                # Main entry point
│   ├── config/db.js             # MongoDB connection
│   ├── middleware/               # Auth, validation, security
│   ├── models/                  # Mongoose schemas
│   ├── controllers/             # Route handlers
│   ├── routes/                  # API routes
│   ├── seed/seed.js             # Database seeder
│   └── package.json
└── docs/
    ├── NOVACART_COMPLETE_GUIDE.md
    └── DEPLOYMENT_GUIDE.md      # This file
```
