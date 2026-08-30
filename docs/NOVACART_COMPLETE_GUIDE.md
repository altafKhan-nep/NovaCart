# NovaCart - Complete Platform Guide

## 1. Overview

NovaCart is a full-stack MERN e-commerce platform with a built-in CRM and admin dashboard. It provides a complete online shopping experience for customers and a comprehensive management interface for administrators with role-based access control.

**Tech Stack:**

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Vite | 6.4.3 |
| Frontend | React | 18.3.1 |
| Frontend | React Router DOM | 7.18.3 |
| Styling | Tailwind CSS | 3.4.10 |
| Backend | Express | 4.19.2 |
| Database | MongoDB / Mongoose | 8.6.0 |
| Auth | JWT (jsonwebtoken) | 9.0.2 |
| Password Hashing | bcryptjs | 2.4.3 |
| Security | Helmet | 8.3.0 |
| Rate Limiting | express-rate-limit | 8.7.0 |
| Dev Tooling | Nodemon | 3.1.4 |
| Dev Tooling | Concurrently | 9.0.0 |

**Design System ("Vibrant Joy"):**

| Token | Value | Usage |
|-------|-------|-------|
| Cream (background) | `#fbf9f5` | Page background, surface |
| Coral primary | `#a43c12` / `#ff7f50` | Primary actions, links, accents |
| Turquoise secondary | `#006a62` / `#5ef6e6` | Secondary buttons, flash deals |
| Yellow tertiary | `#ffe16d` / `#e9c400` | Badges, highlights, tertiary accent |
| Dark text | `#1b1c1a` | Body text, headings |
| Font | Inter (400-900 weights) | All text |
| Icons | Material Symbols Outlined | All UI icons |

---

## 2. Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **MongoDB** running locally on port 27017, or a MongoDB Atlas connection string
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd "ecomerce site"

# Install all dependencies (root, server, client)
npm run install-all
```

Or install individually:

```bash
npm install              # root (concurrently)
cd server && npm install
cd ../client && npm install
```

### Environment Variables

Create `server/.env`:

```
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/novacart
JWT_SECRET=novacart_super_secret_jwt_key_change_me
JWT_EXPIRE=7d
```

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `5001` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/novacart` |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `JWT_EXPIRE` | JWT token expiry duration | `7d` |

### Running the Application

```bash
# Run both backend and frontend concurrently
npm run dev

# Or run separately:
npm run server    # Backend on http://localhost:5001
npm run client    # Frontend on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5001`.

### Seeding Data

```bash
npm run seed
# Or: cd server && node seed/seed.js
```

This populates the database with sample products, users, banners, categories, navigation items, promotions, and default settings.

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@novacart.com` | `password123` |
| Admin | `admin@novacart.com` | `password123` |
| Content Manager | `content@novacart.com` | `password123` |
| Order Manager | `orders@novacart.com` | `password123` |
| Customer | `alex@novacart.com` | `password123` |
| Customer | `maria@novacart.com` | `password123` |

---

## 3. Architecture

### 3.1 Project Structure

```
ecomerce site/
├── package.json                  # Root: concurrently scripts
├── server/
│   ├── server.js                 # Express app entry point
│   ├── .env                      # Environment variables
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── middleware/
│   │   ├── authMiddleware.js     # protect, admin, superAdmin, requirePermission
│   │   └── errorMiddleware.js    # notFound, errorHandler
│   ├── models/
│   │   ├── User.js               # User schema + RBAC constants
│   │   ├── Product.js            # Product schema
│   │   ├── Order.js              # Order schema
│   │   ├── Banner.js             # Banner schema
│   │   ├── Category.js           # Category schema (hierarchical)
│   │   ├── Navigation.js         # Navigation schema (hierarchical)
│   │   ├── Promotion.js          # Promotion schema
│   │   └── Settings.js           # Settings schema (singleton)
│   ├── controllers/
│   │   ├── userController.js     # Auth, profile, wishlist
│   │   ├── productController.js  # CRUD, categories, flash deals
│   │   ├── orderController.js    # Create, user orders, admin orders
│   │   ├── adminController.js    # Stats, users, orders, analytics
│   │   ├── bannerController.js   # CRUD, active by position, reorder
│   │   ├── categoryController.js # CRUD, tree, reorder
│   │   ├── navigationController.js # CRUD, tree, reorder
│   │   ├── promotionController.js  # CRUD, validate
│   │   └── settingsController.js   # Get, update by section
│   ├── routes/
│   │   ├── productRoutes.js
│   │   ├── userRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── bannerRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── navigationRoutes.js
│   │   ├── promotionRoutes.js
│   │   └── settingsRoutes.js
│   ├── utils/
│   │   ├── generateToken.js      # JWT token generation
│   │   └── asyncHandler.js       # Async error wrapper
│   └── seed/
│       └── seed.js               # Database seeder
├── client/
│   ├── package.json
│   ├── vite.config.js            # Vite config with API proxy
│   ├── tailwind.config.js        # Tailwind design tokens
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx              # React entry point
│       ├── App.jsx               # Routes + layout shells
│       ├── index.css             # Global styles + animations
│       ├── api/
│       │   └── index.js          # API client (fetch-based)
│       ├── context/
│       │   ├── AuthContext.jsx   # Auth state + RBAC helpers
│       │   └── CartContext.jsx   # Cart state (useReducer + localStorage)
│       ├── components/
│       │   ├── Navbar.jsx        # Customer navigation bar
│       │   ├── Footer.jsx        # Customer footer
│       │   ├── ProductCard.jsx   # Product display card
│       │   ├── CategorySidebar.jsx # Category filter sidebar
│       │   ├── ScrollToTop.jsx   # Scroll restoration
│       │   ├── ProtectedRoute.jsx # Route guard (admin/permission/role)
│       │   └── admin/
│       │       └── AdminLayout.jsx # Admin shell (sidebar + topbar)
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── ProductListingPage.jsx
│       │   ├── ProductDetailPage.jsx
│       │   ├── CartPage.jsx
│       │   ├── CheckoutPage.jsx
│       │   ├── OrderSuccessPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── UserDashboard.jsx
│       │   ├── AdminDashboard.jsx
│       │   └── admin/
│       │       ├── AdminDashboard.jsx
│       │       ├── AdminProducts.jsx
│       │       ├── AdminOrders.jsx
│       │       ├── AdminCustomers.jsx
│       │       ├── AdminCategories.jsx
│       │       ├── AdminBanners.jsx
│       │       ├── AdminNavigation.jsx
│       │       ├── AdminPromotions.jsx
│       │       ├── AdminInventory.jsx
│       │       ├── AdminAnalytics.jsx
│       │       └── AdminSettings.jsx
│       └── utils/
│           └── helpers.js       # formatPrice, createSlug, discountPercent
```

### 3.2 Backend Architecture

The Express server (`server/server.js`) sets up:

1. **Security headers** via `helmet()`
2. **CORS** restricted to `localhost:5173` and `localhost:5174` (and `127.0.0.1` variants)
3. **Body parsing** with `express.json({ limit: '100kb' })`
4. **Rate limiting** with three tiers:
   - General API: 300 requests / 15 min
   - Login: 20 requests / 15 min
   - Profile: 100 requests / 15 min
5. **Route mounting** for all 9 route groups
6. **Error handling** with `notFound` and `errorHandler` middleware

**Request flow:**

```
Client Request
    → helmet (security headers)
    → CORS (origin check)
    → rate limiter
    → body parser
    → route handler
        → protect middleware (JWT verify)
            → admin middleware (role check)
                → requirePermission middleware (granular check)
                    → controller function
    → error handler (if any error thrown)
```

### 3.3 Frontend Architecture

The React app (`client/src/App.jsx`) is organized into three layout shells:

- **MainShell** - Customer-facing pages with `Navbar` + `Footer`
- **AdminShell** - Admin pages wrapped in `ProtectedRoute` + `AdminLayout`
- **AuthLayout** - Minimal wrapper for login/register (no nav/footer)

**Context providers:**

- `AuthProvider` - Manages user state, login/register/logout, permission checks, wishlist toggle. Persists token in `localStorage` under `novacart_token`.
- `CartProvider` - Manages cart state via `useReducer`. Persists to `localStorage` under `novacart_cart`. Computes `itemsCount`, `itemsPrice`, `shippingPrice` (free over $100), `taxPrice` (8.5%), `totalPrice`.

**API client** (`client/src/api/index.js`): A plain `fetch`-based module with automatic `Authorization: Bearer <token>` header injection for authenticated requests. All responses are parsed as JSON with error handling.

---

## 4. Role-Based Access Control (RBAC)

### 4.1 Roles

| Role | Key | Description |
|------|-----|-------------|
| Super Admin | `super_admin` | Full system access. Bypasses all permission checks. |
| Admin | `admin` | Most CRM features. Cannot manage roles. |
| Content Manager | `content_manager` | Products, categories, banners, navigation, promotions (no delete on products/categories). |
| Order Manager | `order_manager` | Orders, shipping, customer viewing, inventory. |
| Customer | `customer` | Shopping only. No admin access. |

### 4.2 Permissions (34 total)

| Permission | Description |
|------------|-------------|
| `dashboard:view` | View admin dashboard stats |
| `products:view` | View product list |
| `products:create` | Create new products |
| `products:edit` | Edit existing products |
| `products:delete` | Delete products |
| `categories:view` | View category list |
| `categories:create` | Create new categories |
| `categories:edit` | Edit categories |
| `categories:delete` | Delete categories |
| `orders:view` | View order list and details |
| `orders:edit` | Update order status |
| `orders:cancel` | Cancel orders |
| `customers:view` | View customer list |
| `customers:edit` | Edit customer roles/permissions/status |
| `banners:view` | View banner list |
| `banners:create` | Create new banners |
| `banners:edit` | Edit banners |
| `banners:delete` | Delete banners |
| `navigation:view` | View navigation items |
| `navigation:create` | Create navigation items |
| `navigation:edit` | Edit navigation items |
| `navigation:delete` | Delete navigation items |
| `promotions:view` | View promotions list |
| `promotions:create` | Create new promotions |
| `promotions:edit` | Edit promotions |
| `promotions:delete` | Delete promotions |
| `inventory:view` | View inventory levels |
| `inventory:edit` | Update stock levels |
| `analytics:view` | View analytics dashboard |
| `settings:view` | View store settings |
| `settings:edit` | Update store settings |
| `roles:view` | View roles (reserved) |
| `roles:edit` | Edit roles (reserved) |

### 4.3 Role-Permission Matrix

| Permission | Super Admin | Admin | Content Manager | Order Manager | Customer |
|------------|:-----------:|:-----:|:---------------:|:-------------:|:--------:|
| `dashboard:view` | ✓ | ✓ | ✓ | ✓ | - |
| `products:view` | ✓ | ✓ | ✓ | - | - |
| `products:create` | ✓ | ✓ | ✓ | - | - |
| `products:edit` | ✓ | ✓ | ✓ | - | - |
| `products:delete` | ✓ | ✓ | - | - | - |
| `categories:view` | ✓ | ✓ | ✓ | - | - |
| `categories:create` | ✓ | ✓ | ✓ | - | - |
| `categories:edit` | ✓ | ✓ | ✓ | - | - |
| `categories:delete` | ✓ | ✓ | - | - | - |
| `orders:view` | ✓ | ✓ | - | ✓ | - |
| `orders:edit` | ✓ | ✓ | - | ✓ | - |
| `orders:cancel` | ✓ | ✓ | - | ✓ | - |
| `customers:view` | ✓ | ✓ | - | ✓ | - |
| `customers:edit` | ✓ | ✓ | - | - | - |
| `banners:view` | ✓ | ✓ | ✓ | - | - |
| `banners:create` | ✓ | ✓ | ✓ | - | - |
| `banners:edit` | ✓ | ✓ | ✓ | - | - |
| `banners:delete` | ✓ | ✓ | ✓ | - | - |
| `navigation:view` | ✓ | ✓ | ✓ | - | - |
| `navigation:create` | ✓ | ✓ | ✓ | - | - |
| `navigation:edit` | ✓ | ✓ | ✓ | - | - |
| `navigation:delete` | ✓ | ✓ | ✓ | - | - |
| `promotions:view` | ✓ | ✓ | ✓ | - | - |
| `promotions:create` | ✓ | ✓ | ✓ | - | - |
| `promotions:edit` | ✓ | ✓ | ✓ | - | - |
| `promotions:delete` | ✓ | ✓ | - | - | - |
| `inventory:view` | ✓ | ✓ | ✓ | ✓ | - |
| `inventory:edit` | ✓ | ✓ | - | - | - |
| `analytics:view` | ✓ | ✓ | - | - | - |
| `settings:view` | ✓ | ✓ | - | - | - |
| `settings:edit` | ✓ | ✓ | - | - | - |
| `roles:view` | ✓ | - | - | - | - |
| `roles:edit` | ✓ | - | - | - | - |

### 4.4 Backend Enforcement

Three middleware layers in `server/middleware/authMiddleware.js`:

**`protect`** - Extracts JWT from `Authorization: Bearer <token>`, verifies it, loads user from DB (excluding password), checks `isActive`. Returns 401 on failure.

**`admin`** - Calls `req.user.isAdminRole()` which returns `true` for any role other than `customer`. Returns 401 if not admin.

**`superAdmin`** - Checks `req.user.role === 'super_admin'`. Returns 403 if not super admin.

**`requirePermission(...permissions)`** - Checks if the user has at least one of the listed permissions. Super admin bypasses all checks. Uses `user.hasPermission()` which merges role-based permissions with user-specific permissions. Returns 403 on failure.

**Permission resolution order:**
1. If `role === 'super_admin'` → always granted
2. Check role-based permissions from `ROLE_PERMISSIONS` map
3. Check user-specific `permissions` array (additive overrides)
4. Union of both = effective permissions

### 4.5 Frontend Enforcement

**`ProtectedRoute`** (`client/src/components/ProtectedRoute.jsx`):

| Prop | Behavior |
|------|----------|
| `requireAdmin` | Redirects to `/` if user is not an admin role |
| `requirePermission` | Redirects to `/admin` if user lacks the permission |
| `requireRole` | Redirects to `/admin` if user role doesn't match (super_admin bypasses) |
| (none) | Redirects to `/login` if not authenticated |

**Admin sidebar filtering** (`AdminLayout.jsx`): The sidebar navigation items are filtered using `hasPermission(item.permission)` from `AuthContext`. Only menu items the user has permission for are rendered.

**Navbar admin link**: The customer Navbar shows a link to `/admin` for admin users, and `/account` for customers.

---

## 5. API Reference

### 5.1 Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/users/login` | Public | Login with email/password. Returns token + user data with role and permissions. |
| `POST` | `/api/users` | Public | Register new user (name, email, password). Returns token + user data. |
| `GET` | `/api/users/profile` | Auth | Get full profile with permissions, wishlist, address, loyalty points. |
| `PUT` | `/api/users/profile` | Auth | Update profile (name, email, phone, address, password). |
| `POST` | `/api/users/wishlist/:id` | Auth | Toggle product in wishlist (add if absent, remove if present). |

**Login response:**
```json
{
  "_id": "...",
  "name": "Super Admin",
  "email": "superadmin@novacart.com",
  "isAdmin": true,
  "role": "super_admin",
  "permissions": ["dashboard:view", "products:view", ...],
  "loyaltyPoints": 0,
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 5.2 Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/products` | Public | List products. Paginated (9/page). Filterable by `keyword`, `category`, `flash`. Sortable by `lowest`/`highest` price. |
| `GET` | `/api/products/:id` | Public | Get single product by ID. |
| `GET` | `/api/products/categories` | Public | Get distinct category names from products. |
| `GET` | `/api/products/flash-deals` | Public | Get all products with `isFlashDeal: true`. |
| `POST` | `/api/products` | Admin | Create product (sample data). |
| `PUT` | `/api/products/:id` | Admin | Update product fields. |
| `DELETE` | `/api/products/:id` | Admin | Delete product. |

**Query parameters for `GET /api/products`:**
- `pageNumber` (default: 1)
- `keyword` (search by name, regex)
- `category` (exact match)
- `flash` (if present, filter `isFlashDeal: true`)
- `lowest` (sort price ascending)
- `highest` (sort price descending)

### 5.3 Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/orders` | Auth | Create new order. |
| `GET` | `/api/orders/myorders` | Auth | Get current user's orders. |
| `GET` | `/api/orders/:id` | Auth | Get order by ID (populated with user name/email). |
| `PUT` | `/api/orders/:id/pay` | Auth | Mark order as paid. |
| `GET` | `/api/orders` | Admin | Get all orders (populated with user). |
| `PUT` | `/api/orders/:id/status` | Admin | Update order status. |

**Admin routes (via `/api/admin`):**

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| `GET` | `/api/admin/orders` | `orders:view` | Paginated order list. Filter by `status`, `keyword` (order ID). |
| `GET` | `/api/admin/orders/:id` | `orders:view` | Order detail with user info. |
| `PUT` | `/api/admin/orders/:id/status` | `orders:edit` | Update status with transition validation. |
| `PUT` | `/api/admin/orders/:id/cancel` | `orders:cancel` | Cancel order (cannot cancel delivered/already cancelled). |

**Valid status transitions:**
```
Pending → Processing, Cancelled
Processing → Shipped, Cancelled
Shipped → Delivered
Delivered → (none)
```

### 5.4 Users (Admin)

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| `GET` | `/api/admin/users` | `customers:view` | Paginated user list. Filter by `role`, `isActive`, `keyword`. |
| `GET` | `/api/admin/users/:id` | `customers:view` | User detail with `orderCount` and `totalSpent`. |
| `PUT` | `/api/admin/users/:id` | `customers:edit` | Update user (name, role, permissions, isActive, email, phone). |
| `DELETE` | `/api/admin/users/:id` | `customers:edit` | Soft delete (sets `isActive = false`). Cannot deactivate super_admin. |

### 5.5 Banners

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/banners` | Admin | List all banners. Filter by `position`, `isActive`. |
| `GET` | `/api/banners/active/:position` | Public | Get active banners by position, filtered by date range. |
| `GET` | `/api/banners/:id` | Public | Get banner by ID. |
| `POST` | `/api/banners` | `banners:create` | Create banner. Auto-increments order. |
| `PUT` | `/api/banners/:id` | `banners:edit` | Update banner fields. |
| `DELETE` | `/api/banners/:id` | `banners:delete` | Delete banner. |
| `PUT` | `/api/banners/reorder` | `banners:edit` | Reorder banners. Accepts `{ orderedIds: [...] }`. |

**Banner positions:** `hero`, `promo`, `footer`, `sidebar`

### 5.6 Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/categories` | Public | Get all categories as a tree structure (parent → children). |
| `GET` | `/api/categories/:id` | Public | Get category by ID with its children. |
| `POST` | `/api/categories` | `categories:create` | Create category. Validates unique name/slug. |
| `PUT` | `/api/categories/:id` | `categories:edit` | Update category. Prevents self-referencing parent. |
| `DELETE` | `/api/categories/:id` | `categories:delete` | Delete category. Fails if has subcategories. |
| `PUT` | `/api/categories/reorder` | `categories:edit` | Reorder categories. Accepts `{ orderedIds: [...] }`. |

### 5.7 Navigation

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/navigation` | Public | Get navigation items as tree. Filter by `position`, `isActive`. |
| `GET` | `/api/navigation/:id` | Public | Get navigation item by ID with children. |
| `POST` | `/api/navigation` | `navigation:create` | Create navigation item. |
| `PUT` | `/api/navigation/:id` | `navigation:edit` | Update navigation item. |
| `DELETE` | `/api/navigation/:id` | `navigation:delete` | Delete navigation item. Fails if has children. |
| `PUT` | `/api/navigation/reorder` | `navigation:edit` | Reorder navigation items. |

**Navigation positions:** `header`, `footer`, `mobile`

### 5.8 Promotions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/promotions` | Admin | List promotions. Paginated. Filter by `isActive`, `type`, `keyword`. |
| `GET` | `/api/promotions/:id` | Admin | Get promotion by ID. |
| `POST` | `/api/promotions` | `promotions:create` | Create promotion. Validates unique code (auto-uppercased). |
| `POST` | `/api/promotions/validate` | Auth | Validate a promotion code. Checks active, dates, usage limit, min purchase. Returns discount amount. |
| `PUT` | `/api/promotions/:id` | `promotions:edit` | Update promotion. |
| `DELETE` | `/api/promotions/:id` | `promotions:delete` | Delete promotion. |

**Promotion types:** `percentage`, `fixed`, `free_shipping`, `buy_x_get_y`

**Validate response:**
```json
{
  "valid": true,
  "promotion": {
    "_id": "...",
    "name": "Summer Blowout",
    "code": "SUMMER50",
    "type": "percentage",
    "value": 50,
    "maxDiscount": 75
  },
  "discount": 50.00
}
```

### 5.9 Settings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/settings` | Public | Get all settings (creates defaults if none exist). |
| `PUT` | `/api/settings/:section` | `settings:edit` | Update a settings section. |

**Valid sections:** `store`, `payment`, `shipping`, `tax`, `notifications`, `security`, `seo`

**Settings sections and fields:**

| Section | Fields |
|---------|--------|
| `store` | `name`, `tagline`, `logo`, `favicon`, `contactEmail`, `phone`, `address` |
| `payment` | `currency`, `currencySymbol`, `acceptCreditCards`, `acceptPaypal`, `stripePublicKey` |
| `shipping` | `freeShippingThreshold`, `standardRate`, `expressRate`, `enableLocalDelivery` |
| `tax` | `enabled`, `rate`, `includeInPrice` |
| `notifications` | `orderConfirmation`, `shippingUpdates`, `lowStockAlert`, `lowStockThreshold`, `newOrderAlert` |
| `security` | `requireEmailVerification`, `enableTwoFactor`, `sessionTimeout`, `maxLoginAttempts` |
| `seo` | `metaTitle`, `metaDescription`, `ogImage` |

### 5.10 Analytics

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| `GET` | `/api/admin/analytics` | `analytics:view` | Revenue by month (12 months), orders by status, top categories, customer growth. |

**Analytics response:**
```json
{
  "revenueByMonth": [{ "_id": { "year": 2026, "month": 8 }, "revenue": 1250.00, "orders": 15 }],
  "ordersByStatus": [{ "_id": "Pending", "count": 5 }],
  "topCategories": [{ "_id": "Electronics", "count": 6, "avgPrice: 189.66 }],
  "customerGrowth": [{ "_id": { "year": 2026, "month": 8 }, "count": 3 }]
}
```

### 5.11 Dashboard Stats

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| `GET` | `/api/admin/stats` | `dashboard:view` | Aggregate stats: total sales, orders, customers, products, status counts, recent orders/customers, low stock count, monthly sales, top products, revenue/orders change vs last month. |

---

## 6. Frontend Pages

### 6.1 Customer Pages

**HomePage** (`/`)
- Hero banner section with "Summer Sale!" tagline, gradient background, CTA button
- Category tiles grid (Electronics, Fashion, Home Decor, Toys) with Material icons
- Flash Deals section with custom `FlashDealCard` (discount badge, "Grab Deal" button in turquoise)
- Featured Products grid using `ProductCard` component
- `CategorySidebar` on the left (desktop)

**ProductListingPage** (`/shop`, `/shop/:category`)
- Product grid with `ProductCard` components
- Category sidebar filter
- Search by keyword (query param)
- Sort by price (lowest/highest)
- Pagination (9 products per page)

**ProductDetailPage** (`/product/:id`)
- Product images gallery
- Product name, price, original price, discount badge
- Color selection swatches
- Stock status
- "Add to Cart" button
- Product features list
- Reviews section

**CartPage** (`/cart`)
- Cart items list with image, name, price, quantity controls
- Remove item button
- Progress bar (visual indicator)
- Order summary sidebar
- "Proceed to Checkout" button

**CheckoutPage** (`/checkout`) - Protected
- Shipping address form (fullName, street, city, zip)
- Payment method selection
- Order summary
- "Place Order" button

**OrderSuccessPage** (`/order-success/:id`)
- Order confirmation message
- Order receipt/summary
- "Continue Shopping" link

**LoginPage** (`/login`)
- Email/password form
- Demo accounts section showing all 6 accounts
- Admin accounts redirect to `/admin` after login
- Link to register page

**RegisterPage** (`/register`)
- Name, email, password form
- Link to login page

**UserDashboard** (`/account`) - Protected
- User profile information
- Order history
- Wishlist
- Saved addresses

### 6.2 Admin Pages

All admin pages are rendered inside `AdminLayout` with a collapsible sidebar and top bar.

**AdminDashboard** (`/admin`)
- 4 stat cards: Total Sales, Total Orders, Total Customers, Total Products (with month-over-month change percentages)
- Revenue bar chart (last 6 months)
- Orders by status pipeline (Pending/Processing/Shipped/Delivered with percentage bars)
- Recent orders table (last 10, with order ID, customer, date, total, status badge)
- Recent customers list (last 5, with avatar initials, name, email)
- Low stock alerts (products with ≤5 stock, color-coded: red for out of stock, amber for low)
- Best sellers list (top 5 by review count)

**AdminProducts** (`/admin/items`)
- Product table with search, category filter, sort
- Bulk actions
- Add/Edit slide-in form panel with fields: name, slug, category, description, price, originalPrice, countInStock, images (URL array), colors (hex array), features (string array), badge, isFlashDeal toggle, isNewArrival toggle
- Delete confirmation dialog

**AdminOrders** (`/admin/orders`)
- Status tabs: All, Pending, Processing, Shipped, Delivered, Cancelled
- Order table with ID, customer, date, total, status badge
- Order details slide-in panel with status timeline
- Status update dropdown (with transition validation)
- Cancel order button

**AdminCustomers** (`/admin/customers`)
- Customer table with role badges (color-coded per role)
- Profile slide-in panel showing user details, order count, total spent
- Edit role modal with permission checkboxes
- Enable/disable toggle

**AdminCategories** (`/admin/categories`)
- Category table with icons, name, slug, product count
- Add/edit form: name, slug, description, icon (Material icon name), parent category (dropdown), image URL
- Hierarchy tree view
- Reorder functionality
- Delete with child protection

**AdminBanners** (`/admin/banners`)
- Banner grid cards with preview
- Position filter (hero/promo/footer/sidebar)
- Add/edit form: title, subtitle, description, image URL, link, ctaText, position, bgColor, startDate, endDate, isActive
- Reorder functionality
- Delete confirmation

**AdminNavigation** (`/admin/navigation`)
- Navigation tree view
- Position filter (header/footer/mobile)
- Add/edit form: label, url, parent (dropdown), position, isExternal, openInNewTab, icon
- Reorder functionality
- Delete with child protection

**AdminPromotions** (`/admin/promotions`)
- Promotions table with usage progress bars (usedCount/usageLimit)
- Status badges (active/inactive/expired)
- Add/edit form: name, code, description, type (percentage/fixed/free_shipping/buy_x_get_y), value, minPurchase, maxDiscount, usageLimit, applicableProducts, applicableCategories, startDate, endDate
- Delete confirmation

**AdminInventory** (`/admin/inventory`)
- Inventory table with inline stock editing
- Bulk stock update
- Filters: low stock, out of stock
- Color-coded stock levels (green > 10, amber 1-10, red = 0)

**AdminAnalytics** (`/admin/analytics`)
- 12-month revenue chart (bar chart)
- Orders by status donut/breakdown
- Top categories by product count
- Top products by review count
- Customer growth chart (monthly)
- Key metrics summary

**AdminSettings** (`/admin/settings`)
- 7-tab interface: Store, Payment, Shipping, Tax, Notifications, Security, SEO
- Each tab shows relevant fields
- Save button per section (updates via `PUT /api/settings/:section`)

### 6.3 Admin Layout

**Sidebar** (`AdminLayout.jsx`):
- Collapsible: 256px expanded, 72px collapsed (icon-only)
- Navigation items filtered by user permissions via `hasPermission(item.permission)`
- Items: Dashboard, Banners, Categories, Items, Navigation, Orders, Customers, Inventory, Promotions, Analytics, Settings
- Role badge at bottom (color-coded: purple=super_admin, blue=admin, teal=content_manager, amber=order_manager)
- Collapse toggle button

**Top bar:**
- Hamburger menu (mobile only)
- Global search bar (⌘K shortcut) - searches products
- Quick action buttons: "Add Product", "Add Category"
- Notifications bell with count badge
- Profile dropdown with user info, role badge, "My Profile", "Account Settings", "Logout"

**Responsive behavior:**
- Desktop: persistent sidebar + top bar
- Mobile: slide-out drawer sidebar with backdrop overlay, triggered by hamburger

---

## 7. Data Models

### 7.1 User (`server/models/User.js`)

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed with bcrypt salt rounds: 10),
  isAdmin: Boolean (default: false, auto-set to true for non-customer roles),
  role: String (enum: super_admin, admin, content_manager, order_manager, customer; default: customer),
  permissions: [String] (array of permission constants, additive to role permissions),
  isActive: Boolean (default: true),
  avatar: String (default: ''),
  phone: String (default: ''),
  wishlist: [ObjectId ref: Product],
  loyaltyPoints: Number (default: 0),
  address: {
    fullName: String,
    street: String,
    city: String,
    zip: String
  },
  lastLogin: Date,
  loginCount: Number (default: 0),
  timestamps: true (createdAt, updatedAt)
}
```

**Instance methods:**
- `matchPassword(enteredPassword)` - bcrypt compare
- `hasPermission(permission)` - checks role permissions + user permissions
- `hasAnyPermission(...perms)` - checks if any permission matches
- `getEffectivePermissions()` - returns union of role + user permissions
- `isAdminRole()` - returns `true` if role !== 'customer'

**Pre-save hooks:**
1. Hash password with bcrypt (salt rounds: 10) if modified
2. Set `isAdmin = true` if role is not 'customer'

### 7.2 Product (`server/models/Product.js`)

```javascript
{
  name: String (required),
  slug: String (required, unique),
  category: String (required),
  description: String (required),
  price: Number (required, default: 0),
  originalPrice: Number (default: 0),
  countInStock: Number (required, default: 0),
  rating: Number (default: 0),
  numReviews: Number (default: 0),
  images: [String] (default: []),
  colors: [String] (default: []),
  features: [String] (default: []),
  badge: String (default: ''),
  isFlashDeal: Boolean (default: false),
  isNewArrival: Boolean (default: false),
  timestamps: true
}
```

### 7.3 Order (`server/models/Order.js`)

```javascript
{
  user: ObjectId ref: User (required),
  orderItems: [{
    name: String (required),
    qty: Number (required),
    image: String (required),
    price: Number (required),
    product: ObjectId ref: Product (required)
  }],
  shippingAddress: {
    fullName: String (required),
    street: String (required),
    city: String (required),
    zip: String (required)
  },
  paymentMethod: String (required, default: 'Card'),
  itemsPrice: Number (required, default: 0),
  taxPrice: Number (required, default: 0),
  shippingPrice: Number (required, default: 0),
  totalPrice: Number (required, default: 0),
  status: String (required, default: 'Pending', enum: Pending, Processing, Shipped, Delivered),
  isPaid: Boolean (default: false),
  paidAt: Date,
  timestamps: true
}
```

### 7.4 Banner (`server/models/Banner.js`)

```javascript
{
  title: String (required),
  subtitle: String (default: ''),
  description: String (default: ''),
  image: String (required),
  link: String (default: '/'),
  ctaText: String (default: 'Shop Now'),
  position: String (enum: hero, promo, footer, sidebar; default: hero),
  isActive: Boolean (default: true),
  order: Number (default: 0),
  startDate: Date,
  endDate: Date,
  bgColor: String (default: '#ffffff'),
  timestamps: true
}
```

### 7.5 Category (`server/models/Category.js`)

```javascript
{
  name: String (required, unique),
  slug: String (required, unique),
  description: String (default: ''),
  image: String (default: ''),
  icon: String (default: 'category'),
  parent: ObjectId ref: Category (default: null),
  isActive: Boolean (default: true),
  order: Number (default: 0),
  productCount: Number (default: 0),
  timestamps: true
}
```

**Virtuals:** `children` (populated from Category where `parent === this._id`)

### 7.6 Navigation (`server/models/Navigation.js`)

```javascript
{
  label: String (required),
  url: String (required),
  parent: ObjectId ref: Navigation (default: null),
  order: Number (default: 0),
  isActive: Boolean (default: true),
  isExternal: Boolean (default: false),
  openInNewTab: Boolean (default: false),
  icon: String (default: ''),
  position: String (enum: header, footer, mobile; default: header),
  timestamps: true
}
```

**Virtuals:** `children` (populated from Navigation where `parent === this._id`)

### 7.7 Promotion (`server/models/Promotion.js`)

```javascript
{
  name: String (required),
  code: String (required, unique, uppercase: true),
  description: String (default: ''),
  type: String (required, enum: percentage, fixed, free_shipping, buy_x_get_y),
  value: Number (required, default: 0),
  minPurchase: Number (default: 0),
  maxDiscount: Number (default: 0),
  usageLimit: Number (default: 0),
  usedCount: Number (default: 0),
  applicableProducts: [ObjectId ref: Product],
  applicableCategories: [String],
  isActive: Boolean (default: true),
  startDate: Date (required),
  endDate: Date (required),
  timestamps: true
}
```

### 7.8 Settings (`server/models/Settings.js`)

Singleton document with nested sections:

```javascript
{
  store: {
    name: 'NovaCart',
    tagline: 'Discover Joy in Every Box',
    logo: '',
    favicon: '',
    contactEmail: 'support@novacart.com',
    phone: '',
    address: ''
  },
  payment: {
    currency: 'USD',
    currencySymbol: '$',
    acceptCreditCards: true,
    acceptPaypal: false,
    stripePublicKey: ''
  },
  shipping: {
    freeShippingThreshold: 50,
    standardRate: 5.99,
    expressRate: 12.99,
    enableLocalDelivery: false
  },
  tax: {
    enabled: true,
    rate: 0.08,
    includeInPrice: false
  },
  notifications: {
    orderConfirmation: true,
    shippingUpdates: true,
    lowStockAlert: true,
    lowStockThreshold: 5,
    newOrderAlert: true
  },
  security: {
    requireEmailVerification: false,
    enableTwoFactor: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5
  },
  seo: {
    metaTitle: 'NovaCart - Discover Joy in Every Box',
    metaDescription: 'Shop vibrant fashion, quirky electronics, and home delights.',
    ogImage: ''
  },
  timestamps: true
}
```

---

## 8. Security

### Authentication & Authorization
- **JWT tokens** with configurable expiry (`JWT_EXPIRE`, default `7d`)
- **bcrypt** password hashing with salt rounds: 10
- **Three-layer middleware**: `protect` → `admin` → `requirePermission`
- Super admin bypasses all permission checks

### HTTP Security (Helmet)
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS)
- X-XSS-Protection
- Referrer-Policy
- `x-powered-by` header disabled

### CORS
- Restricted origins: `localhost:5173`, `localhost:5174`, `127.0.0.1:5173`, `127.0.0.1:5174`
- Credentials enabled
- Custom CORS rejection handler returns 403

### Rate Limiting
| Limiter | Window | Max Requests | Applied To |
|---------|--------|--------------|------------|
| General API | 15 min | 300 | `/api/*` |
| Auth (login) | 15 min | 20 | `/api/users/login` |
| Profile | 15 min | 100 | `/api/users/*` |

### Request Limits
- Body size limit: 100kb (`express.json({ limit: '100kb' })`)

### Data Protection
- Passwords excluded from all API responses (`.select('-password')`)
- Soft delete for users (`isActive = false`) rather than hard delete
- Error stack traces hidden in production (`NODE_ENV === 'production'`)

### Error Handling
- `notFound` middleware catches unmatched routes → 404
- `errorHandler` middleware handles:
  - Mongoose `ValidationError` → 400
  - Mongoose `CastError` (invalid ObjectId) → 400
  - `TokenExpiredError` → 401
  - `JsonWebTokenError` → 401
  - `entity.too.large` → 413
  - Default → 500

### Frontend Security
- Token stored in `localStorage` (`novacart_token`)
- Automatic token injection via `Authorization: Bearer` header
- `ProtectedRoute` component guards admin and authenticated routes
- Permission-filtered sidebar navigation
- Admin link visibility based on user role

---

## 9. Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| **Primary** | `#a43c12` | Links, headings, primary actions |
| **Primary Container** | `#ff7f50` | Buttons, badges, active states |
| **On Primary Container** | `#6c2000` | Text on primary container |
| **Primary Fixed** | `#ffdbcf` | Light primary backgrounds |
| **Primary Fixed Dim** | `#ffb59c` | Medium primary backgrounds |
| **Secondary** | `#006a62` | Secondary text, teal accents |
| **Secondary Container** | `#5ef6e6` | Secondary buttons, flash deals |
| **On Secondary Container** | `#006f66` | Text on secondary container |
| **Tertiary** | `#705d00` | Tertiary text |
| **Tertiary Container** | `#c0a200` | Tertiary backgrounds |
| **Tertiary Fixed** | `#ffe16d` | Yellow badges, highlights |
| **Tertiary Fixed Dim** | `#e9c400` | Dimmed yellow |
| **Error** | `#ba1a1a` | Error states, destructive actions |
| **Error Container** | `#ffdad6` | Error backgrounds |
| **Surface** | `#fbf9f5` | Page background |
| **On Surface** | `#1b1c1a` | Body text |
| **Surface Container Lowest** | `#ffffff` | Cards, elevated surfaces |
| **Surface Container Low** | `#f5f3ef` | Sidebar, secondary surfaces |
| **Surface Container** | `#efeeea` | Dividers, borders |
| **Surface Container High** | `#eae8e4` | Hover states |
| **Surface Container Highest** | `#e4e2de` | Footer background |
| **Outline** | `#8b7169` | Borders, subtle text |
| **Outline Variant** | `#dec0b6` | Light borders |

### Typography

| Name | Size | Line Height | Weight | Usage |
|------|------|-------------|--------|-------|
| Display LG | 48px | 1.2 | 700 | Hero headings (desktop) |
| Display LG Mobile | 32px | 1.2 | 700 | Hero headings (mobile) |
| Headline MD | 24px | 1.3 | 600 | Section headings |
| Body MD | 16px | 1.5 | 400 | Standard body text |
| Body LG | 18px | 1.6 | 400 | Featured body text |
| Label Bold | 14px | 1.0 | 800 | Labels, badges |

Font family: `Inter, system-ui, -apple-system, Segoe UI, sans-serif`

### Component Classes

```css
.btn-primary    /* Coral gradient, scale on hover, bounce transition */
.btn-secondary  /* Turquoise gradient, scale on hover */
.btn-ghost      /* Transparent with coral border */
.product-card   /* Lift on hover (-8px translateY, scale 1.02) */
.card-lift      /* Subtle lift (-4px translateY) */
```

### Animations

| Class | Animation | Duration |
|-------|-----------|----------|
| `animate-fade-up` | Fade in + slide up 20px | 0.6s |
| `animate-wiggle` | Wiggle rotation ±3deg | 0.3s (on hover) |
| `animate-pulse-fast` | Scale 1→1.05 with opacity | 1s infinite |
| `animate-blob` | Floating blob movement | 7s infinite |
| `bounce-in` | Scale 0→1.1→1 | 0.8s |
| `animate-pop` | Scale 1→1.4→1 | 0.3s |
| `pulse-tag` | Subtle scale + ring pulse | 2s infinite |
| `card-lift` | translateY(-4px) + shadow | 0.3s |

### Responsive Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Default | < 768px | Mobile: stacked layout, hamburger nav, drawer sidebar |
| `md` | ≥ 768px | Side-by-side layouts, search bar visible |
| `lg` | ≥ 1024px | Persistent admin sidebar, horizontal customer nav |

---

## 10. Seed Data

Running `npm run seed` populates the database with:

### Products (14 items)

| Name | Category | Price | Stock | Flash Deal | New Arrival |
|------|----------|-------|-------|------------|-------------|
| Vibe Wireless Headphones | Electronics | $89.99 | 25 | ✓ | - |
| SnapJoy Instant Camera | Electronics | $59.00 | 18 | ✓ | - |
| Aura Smart Watch | Electronics | $119.00 | 30 | ✓ | - |
| NovaSound Headphones | Electronics | $249.99 | 12 | - | ✓ |
| GlowTab Tablet Pro | Electronics | $499.00 | 8 | - | - |
| PixelWatch Series 3 | Electronics | $199.00 | 15 | - | - |
| Terra Ceramic Mug | Home Decor | $24.00 | 50 | - | - |
| Cozy Knit Blanket | Home Decor | $45.00 | 20 | - | - |
| Flow Notebook | Home Decor | $18.00 | 100 | - | - |
| Joyful Ceramic Mug Set | Home Decor | $24.00 | 40 | - | - |
| Sunny Crossbody Bag | Fashion | $39.99 | 22 | - | - |
| Coral Comfort Sneakers | Fashion | $74.99 | 60 | - | - |
| Snuggle Plush Bear | Toys | $29.99 | 45 | - | - |
| Build-A-Joy Blocks | Toys | $34.99 | 35 | - | - |

### Users (6 accounts)

| Name | Email | Role | Loyalty Points |
|------|-------|------|----------------|
| Super Admin | superadmin@novacart.com | super_admin | 0 |
| Admin User | admin@novacart.com | admin | 0 |
| Content Manager | content@novacart.com | content_manager | 0 |
| Order Manager | orders@novacart.com | order_manager | 0 |
| Alex Johnson | alex@novacart.com | customer | 850 |
| Maria Garcia | maria@novacart.com | customer | 420 |

Alex Johnson has 2 wishlist items (Vibe Wireless Headphones, Terra Ceramic Mug).

### Banners (3 items)

| Title | Position | Active |
|-------|----------|--------|
| Summer Sale! | hero | ✓ |
| New Arrivals | hero | ✓ |
| Free Shipping | promo | ✓ |

### Categories (4 items)

| Name | Icon | Products |
|------|------|----------|
| Electronics | devices | 6 |
| Fashion | apparel | 2 |
| Home Decor | deck | 4 |
| Toys | toys | 2 |

### Navigation (7 items)

| Label | Position | URL |
|-------|----------|-----|
| Home | header | / |
| Shop | header | /shop |
| Deals | header | /shop?flash=true |
| New Arrivals | header | /shop?category=Electronics |
| Support | footer | /account |
| Privacy Policy | footer | /privacy |
| Terms of Service | footer | /terms |

### Promotions (3 items)

| Name | Code | Type | Value | Min Purchase |
|------|------|------|-------|--------------|
| Summer Blowout | SUMMER50 | percentage | 50% (max $75) | $100 |
| Welcome Discount | WELCOME10 | fixed | $10 | $30 |
| Free Shipping Friday | FRIDAYSHIP | free_shipping | - | - |

### Settings
Default settings document created with all 7 sections (store, payment, shipping, tax, notifications, security, seo).

---

## 11. Deployment

### Backend Deployment

1. Set environment variables on hosting platform:
   - `MONGO_URI` (MongoDB Atlas connection string)
   - `JWT_SECRET` (strong random string)
   - `JWT_EXPIRE` (e.g., `30d`)
   - `PORT` (often set automatically by platform)

2. Build and start:
   ```bash
   cd server
   npm install --production
   node server.js
   ```

**Supported platforms:** Heroku, Railway, Render, DigitalOcean App Platform, AWS Elastic Beanstalk

### Frontend Deployment

1. Update `client/src/api/index.js` to point to production API URL (or use environment variable)
2. Build:
   ```bash
   cd client
   npm run build
   ```
3. Deploy the `client/dist/` folder to static hosting

**Supported platforms:** Netlify, Vercel, Cloudflare Pages, AWS S3 + CloudFront, GitHub Pages

### Vite Proxy Configuration

The Vite dev server proxies `/api` to `http://localhost:5001`. For production, configure your hosting platform's reverse proxy or update the API URL in the client code.

### MongoDB

Use MongoDB Atlas for production:
1. Create a free cluster at [mongodb.com](https://mongodb.com)
2. Create a database user
3. Whitelist your server's IP address
4. Get the connection string and set it as `MONGO_URI`

### Environment Variables Summary

| Variable | Development | Production |
|----------|-------------|------------|
| `PORT` | `5001` | Platform-assigned |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/novacart` | MongoDB Atlas URI |
| `JWT_SECRET` | `novacart_super_secret_jwt_key_change_me` | Strong random string |
| `JWT_EXPIRE` | `7d` | `30d` recommended |
| `NODE_ENV` | (not set) | `production` |

---

## 12. Troubleshooting

### Rate Limiting During Development
If you hit rate limits while testing:
- Login limiter: 20 requests per 15 minutes. Wait or restart the server.
- General API: 300 requests per 15 minutes. Rarely hit in development.
- Reduce `max` values in `server/server.js` temporarily for testing.

### CORS Issues
- Ensure the frontend runs on port 5173 or 5174
- Check that `allowedOrigins` in `server/server.js` includes your frontend URL
- If using a custom port, add it to the `allowedOrigins` array

### JWT Token Expiry
- Default expiry: 7 days (`JWT_EXPIRE=7d`)
- If token expires, the user is logged out automatically
- The `AuthContext` attempts to refresh the profile on mount; if it fails, the token is cleared
- Error handler returns `"Session expired, please sign in again"` for expired tokens

### Database Connection
- Ensure MongoDB is running locally on port 27017
- Check `MONGO_URI` in `server/.env`
- For Atlas, ensure IP whitelist includes your machine
- The server exits with code 1 if connection fails

### Seeding Issues
- `npm run seed` drops all existing data before inserting
- Run seed only when you need fresh sample data
- Ensure MongoDB is running before seeding

### Build Errors
- Ensure all dependencies are installed: `npm run install-all`
- Clear `node_modules` and reinstall if needed
- Check Node.js version (>= 18 recommended)

### Frontend API Calls Failing
- Verify backend is running on port 5001
- Check browser console for CORS or network errors
- Ensure `localStorage` has a valid `novacart_token`
- The Vite proxy only works in dev mode; production needs a different approach

### Admin Pages Not Accessible
- Verify the user has `isAdmin: true` or a non-customer role
- Check that `ProtectedRoute` receives `requireAdmin` prop
- Ensure the JWT token is valid and not expired
- The `admin` middleware calls `user.isAdminRole()` which checks `role !== 'customer'`
