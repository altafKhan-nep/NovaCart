# Deployment Guide

Follow these steps to build and deploy NovaCart in production.

## 1. Frontend Production Build

From the root:

```bash
npm run build
```

This runs `vite build` in `client/`, producing static files in `client/dist/`.

## 2. Serve the Frontend

You can serve `client/dist/` with any static-file server (Nginx, Apache, a CDN, or a
Node static server). A common approach is to have Express serve the built frontend so
the whole app runs from one server.

## 3. Backend Environment Variables

Set these on your production server (see `server/.env` for the development defaults):

```env
PORT=5001
MONGO_URI=<your production MongoDB connection string>
JWT_SECRET=<a long, random, secret string>
JWT_EXPIRE=7d
NODE_ENV=production
```

> **Critical:** Use a strong, unique `JWT_SECRET` and never commit real secrets to the
> repository. With `NODE_ENV=production`, the error handler omits stack traces.

## 4. Running the Backend

Install production dependencies and start the server:

```bash
cd server
npm install --omit=dev
npm start
```

## 5. Recommended Production Configurations

### Option A — Single Express server (simplest)

Have Express serve `client/dist` statically and fall back to `index.html` for the SPA:

```js
const path = require('path');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'))
  );
}
```

### Option B — Reverse proxy (Nginx)

Serve frontend from Nginx and proxy `/api` to the Node backend:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/novacart/client/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 6. Database

- Use **MongoDB Atlas** or a managed instance in production.
- Run the seed once against production to load demo data (`npm run seed` with the
  production `MONGO_URI`), or load your real catalog via the admin API.
- Always back up your database before and after deployment.

## 7. Manage the process

Use a process manager such as PM2:

```bash
npm install -g pm2
pm2 start server/server.js --name novacart-api
pm2 save
pm2 startup
```
