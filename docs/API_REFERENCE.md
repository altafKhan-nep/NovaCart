# API Reference

Base URL (development): `http://localhost:5001/api`

All routes are prefixed with `/api`. Authentication uses a **Bearer token** in the
`Authorization` header for protected routes.

## Conventions

- Requests and responses use `application/json`.
- Errors return a JSON object: `{ "message": "...", "stack": "..." }`.
- Paginated product responses include `page`, `pages`, `count`.

---

## Products

### `GET /api/products`

List products with optional filters.

**Query params**

| Param | Type | Description |
| --- | --- | --- |
| `keyword` | string | Case-insensitive name search |
| `category` | string | Filter by exact category |
| `flash` | boolean | Only flash deals (`true`) |
| `lowest` / `highest` | boolean | Sort by price |
| `pageNumber` | number | Page (default 1) |
| `pageSize` | number | Items per page |

**Response**

```json
{
  "products": [ { "name": "...", "price": 89.99, ... } ],
  "page": 1,
  "pages": 2,
  "count": 14
}
```

**Access:** Public

### `GET /api/products/:id`

Fetch a single product by id. **Access:** Public

### `GET /api/products/categories`

Returns the distinct list of categories. **Access:** Public

**Response:** `["Electronics","Fashion","Home Decor","Toys"]`

### `GET /api/products/flash-deals`

Returns all products flagged as flash deals. **Access:** Public

### `POST /api/products`

Create a sample product. **Access:** Admin

### `PUT /api/products/:id`

Update a product. **Access:** Admin

### `DELETE /api/products/:id`

Remove a product. **Access:** Admin

---

## Users & Auth

### `POST /api/users/register` — *actually `POST /api/users`*

Register a new user.

**Request**

```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123" }
```

**Response (201)** — user object + `token`. **Access:** Public

### `POST /api/users/login`

Authenticate a user.

**Request**

```json
{ "email": "jane@example.com", "password": "secret123" }
```

**Response** — user object + `token`:

```json
{
  "_id": "...",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "isAdmin": false,
  "loyaltyPoints": 0,
  "token": "<jwt>"
}
```

**Access:** Public

### `GET /api/users/profile`

Get the authenticated user's profile (includes populated `wishlist`). **Access:** Private

### `PUT /api/users/profile`

Update name, email, address, or password. **Access:** Private

### `POST /api/users/wishlist/:id`

Toggle a product in the user's wishlist. **Access:** Private

**Response**

```json
{ "wishlist": [ { "_id": "...", "name": "...", ... } ] }
```

---

## Orders

### `POST /api/orders`

Create a new order. **Access:** Private

**Request**

```json
{
  "orderItems": [
    { "name": "Vibe Headphones", "qty": 1, "image": "...", "price": 89.99, "product": "<productId>" }
  ],
  "shippingAddress": { "fullName": "...", "street": "...", "city": "...", "zip": "..." },
  "paymentMethod": "Card",
  "itemsPrice": 89.99,
  "taxPrice": 7.65,
  "shippingPrice": 0,
  "totalPrice": 97.64
}
```

**Response (201)** — the created order. **Access:** Private

### `GET /api/orders/myorders`

Get all orders for the authenticated user. **Access:** Private

### `GET /api/orders/:id`

Get a single order (populated with user). **Access:** Private

### `PUT /api/orders/:id/pay`

Mark an order as paid. **Access:** Private

### `GET /api/orders`

Get all orders (populated with user). **Access:** Admin

### `PUT /api/orders/:id/status`

Update an order's status (`Pending` / `Processing` / `Shipped` / `Delivered`).
**Access:** Admin

---

## Admin

All admin routes require JWT auth **and** `isAdmin: true`.

### `GET /api/admin/stats`

Dashboard summary.

**Response**

```json
{
  "totalSales": 24592.0,
  "totalOrders": 42,
  "totalUsers": 1200,
  "totalProducts": 14,
  "statusCounts": { "Pending": 42, "Processing": 18, "Shipped": 105, "Delivered": 892 },
  "users": [ ... ],
  "orders": [ ... ]
}
```

### `GET /api/admin/users`

Get all users (passwords excluded). **Access:** Admin

### `PUT /api/admin/users/:id`

Update a user (e.g., toggle `isAdmin`). **Access:** Admin

---

## Authentication header example

```bash
curl http://localhost:5001/api/users/profile \
  -H "Authorization: Bearer <your-jwt-token>"
```
