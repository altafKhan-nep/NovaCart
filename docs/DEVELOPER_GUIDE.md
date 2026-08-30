# Developer Guide

This guide explains how the NovaCart codebase is organized, how the pieces fit together,
and the conventions to follow when adding or changing code.

## Tech Stack

- **Frontend:** React 18, Vite 6, Tailwind CSS, React Router v7
- **Backend:** Node.js, Express 4, Mongoose (MongoDB ODM)
- **Auth:** JSON Web Tokens (JWT), bcrypt password hashing

## Repository Layout

```
.
├── package.json              # Root scripts (dev, server, client, seed, build)
├── docs/                     # Documentation (.md) + original design source files
├── client/                   # React frontend
│   ├── index.html
│   ├── vite.config.js        # Dev server + /api proxy
│   ├── tailwind.config.js    # "Vibrant Joy" design tokens
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx          # React entry point
│       ├── App.jsx           # Central route definitions + providers
│       ├── index.css         # Base styles + custom animations
│       ├── api/index.js      # All backend API calls
│       ├── context/          # React contexts (Auth, Cart)
│       ├── components/       # Reusable UI components
│       ├── pages/            # Route-level pages
│       └── utils/helpers.js  # Price/formatting helpers
└── server/                   # Express backend
    ├── server.js             # App entry point
    ├── .env                  # Environment configuration
    ├── config/db.js          # MongoDB connection
    ├── models/               # Mongoose models (Product, User, Order)
    ├── controllers/          # Route handlers
    ├── routes/               # Express routers
    ├── middleware/           # auth + error middleware
    ├── seed/seed.js          # Sample data loader
    └── utils/                # asyncHandler, generateToken
```

## Frontend Architecture

### Data flow

```
Page ──> api/index.js ──> Vite proxy ──> Express routes ──> Controllers ──> MongoDB
```

Pages never talk to the backend directly. All HTTP calls go through `client/src/api/index.js`,
which centralizes the API URL, auth headers, and response handling.

**Example:**

```js
import { api } from '../api';

useEffect(() => {
  api.getProducts({ category: 'Electronics' })
    .then((data) => setProducts(data.products));
}, []);
```

### Global state

- **`AuthContext`** (`src/context/AuthContext.jsx`): holds the logged-in user, provides
  `login`, `register`, `logout`, `refreshProfile`, and `toggleWishlist`. Powers the
  Navbar, protected routes, and dashboards.
- **`CartContext`** (`src/context/CartContext.jsx`): holds cart items, computes subtotal,
  tax, shipping, and total, and persists to `localStorage`. Provides `addToCart`,
  `removeFromCart`, `updateQty`, `clearCart`.

Both providers are mounted in `App.jsx`.

### Routing

All routes are defined in `client/src/App.jsx`.

| Route | Page / behavior |
| --- | --- |
| `/` | HomePage (hero, categories, flash deals, featured) |
| `/shop` | ProductListingPage (all products) |
| `/shop/:category` | ProductListingPage (filtered by category) |
| `/shop?keyword=...` | Search results |
| `/product/:id` | ProductDetailPage |
| `/cart` | CartPage |
| `/checkout` | CheckoutPage *(protected)* |
| `/order-success/:id` | OrderSuccessPage |
| `/account` | UserDashboard *(protected)* |
| `/admin` | AdminDashboard *(protected, admin only)* |
| `/login`, `/register` | Auth pages |

**Protected routes** are wrapped with `<ProtectedRoute>`, which redirects to `/login`
when unauthenticated and enforces admin-only access when `requireAdmin` is set.

### Reusable components

- `Navbar` — brand, nav links, search, cart badge, user menu
- `Footer`
- `ProductCard` — product grid card with wishlist + add-to-cart sparkle micro-animation
- `CategorySidebar` — left category navigation (used on Home + Shop)
- `ProtectedRoute` — route guard
- `ScrollToTop` — resets scroll position on route change

## Backend Architecture

### Request lifecycle

```
Request ──> server.js (middleware) ──> Router ──> Controller ──> Model ──> JSON response
                                            │
                                            └── asyncHandler ──> error middleware
```

### Controllers, models, and routes

- **Controllers** contain the business logic (e.g., `authUser`, `createProduct`).
- **Routes** map HTTP methods/paths to controllers and apply middleware
  (e.g., `protect`, `admin`).
- **Models** define the shape of documents in MongoDB.

### Error handling

Every async controller is wrapped in `asyncHandler` (see `server/utils/asyncHandler.js`),
which forwards rejected promises to the central error middleware
(`server/middleware/errorMiddleware.js`). The middleware classifies errors
and returns the right status code:

| Error kind | Status |
| --- | --- |
| `ValidationError` (Mongoose) | **400** |
| `CastError` (bad ObjectId) | **400** |
| `TokenExpiredError` / `JsonWebTokenError` | **401** |
| `entity.too.large` (body) | **413** |
| everything else | **500** |

In production (`NODE_ENV=production`) the `stack` field is omitted so internal
paths are never leaked to the client.

### Security hardening

The production-ready server attaches several hardening layers in `server/server.js`:

- **`helmet`** — sets CSP, `X-Frame-Options: SAMEORIGIN`,
  `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`,
  `Referrer-Policy`, and removes `X-Powered-By`.
- **CORS** — restricted to the app's own origins
  (`localhost:5173`, `localhost:5174`, `127.0.0.1:5173/5174`). Requests from
  any other origin receive **403**.
- **Rate limiting** — `300 req / 15 min` on `/api`, `20 / 15 min` on
  `/api/users/login` (brute-force protection), and `100 / 15 min` on the
  broader `/api/users` profile endpoints.
- **Body size** — JSON parsing limited to `100kb`.

### Authentication

1. A user logs in via `POST /api/users/login`.
2. The server verifies the password with `bcrypt`, then signs a JWT with the user id.
3. The token is returned to the client, which stores it in `localStorage`.
4. Subsequent authenticated requests include `Authorization: Bearer <token>`.
5. The `protect` middleware decodes the token and loads the user into `req.user`.
6. The `admin` middleware additionally requires `req.user.isAdmin === true`.

**Login redirect:** after a successful login `client/src/pages/LoginPage.jsx`
reads `data.isAdmin` from the response and navigates admins to `/admin` and
everyone else to `/`. The `AuthContext`'s `useEffect` also restores the
session from `localStorage` on page reload so protected routes stay working.

## Code Conventions

**Do not add comments unless necessary** — the code should be self-explanatory.

- Use **functional components** with hooks (no class components).
- Follow existing naming: files are `PascalCase.jsx` for components, `camelCase.js` for
  utilities and API modules.
- Tailwind classes use the design-system tokens defined in `tailwind.config.js`
  (e.g., `bg-surface-container-low`, `text-primary`, `font-label-bold`).
- Use `font-label-bold`, `font-body-md`, `font-body-lg`, `font-headline-md`,
  `font-display-lg` for typography to stay consistent with the design system.
- Component-relative micro-animations (like the add-to-cart sparkles) live in
  `src/components/ProductCard.jsx` via the exported `createSparkles` helper.

## Adding a Feature (Typical Workflow)

1. **Backend:** add a model (if needed) in `server/models/`, a controller in
   `server/controllers/`, and register a route in `server/routes/` + `server/server.js`.
2. **Frontend:** add the API call in `client/src/api/index.js`.
3. **Frontend:** create a component in `client/src/components/` or a page in
   `client/src/pages/`.
4. **Wire it up:** add the route in `client/src/App.jsx`.
5. **Verify:** run `npm run build` (frontend) and confirm backend endpoints with `curl`.

## Verification

```bash
# Frontend production build (catches JSX/import errors)
npm run build

# Backend: start, then hit endpoints
npm run server
curl http://localhost:5001/api/products
```
