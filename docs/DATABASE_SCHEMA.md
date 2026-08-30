# Database Schema

NovaCart uses **MongoDB with Mongoose**. There are three collections: `products`, `users`,
and `orders`. The models live in `server/models/`.

## Product (`server/models/Product.js`)

```js
{
  name: String,            // required
  slug: String,            // required, unique
  category: String,        // required (Electronics, Fashion, Home Decor, Toys, ...)
  description: String,     // required
  price: Number,           // required, default 0
  originalPrice: Number,   // for showing deals / strikethrough
  countInStock: Number,    // required, default 0
  rating: Number,          // default 0
  numReviews: Number,      // default 0
  images: [String],        // product image URLs
  colors: [String],        // hex color options for the swatches
  features: [String],      // "Designed for Joy" feature list
  badge: String,           // e.g. "-30%", "Sale"
  isFlashDeal: Boolean,    // flagged for the Flash Deals section
  isNewArrival: Boolean,   // flagged as a new arrival
  timestamps: true         // createdAt, updatedAt
}
```

## User (`server/models/User.js`)

```js
{
  name: String,                 // required
  email: String,                // required, unique
  password: String,             // required (bcrypt-hashed via pre-save hook)
  isAdmin: Boolean,             // default false
  wishlist: [ObjectId],         // ref: 'Product'
  loyaltyPoints: Number,        // default 0 (used for "Joy Points" widget)
  address: {
    fullName: String,
    street: String,
    city: String,
    zip: String
  },
  timestamps: true
}
```

### Password handling

The `User` schema uses a **pre-save** hook that hashes the password with `bcrypt`
whenever the password field is modified. When seeding or registering, **do not
pre-hash the password** — pass the plaintext string and let the hook handle it.

`User.matchPassword(enteredPassword)` compares a candidate password against the stored
hash using `bcrypt.compare`.

## Order (`server/models/Order.js`)

```js
{
  user: ObjectId,               // ref: 'User', required
  orderItems: [
    {
      name: String,             // required (snapshot, not a ref)
      qty: Number,              // required
      image: String,            // required
      price: Number,            // required
      product: ObjectId         // ref: 'Product', required
    }
  ],
  shippingAddress: {
    fullName: String,           // required
    street: String,             // required
    city: String,               // required
    zip: String                 // required
  },
  paymentMethod: String,        // required, default 'Card'
  itemsPrice: Number,           // required, default 0
  taxPrice: Number,             // required, default 0
  shippingPrice: Number,        // required, default 0
  totalPrice: Number,           // required, default 0
  status: String,               // 'Pending' | 'Processing' | 'Shipped' | 'Delivered' (default 'Pending')
  isPaid: Boolean,              // default false
  paidAt: Date,
  timestamps: true
}
```

> **Note:** `orderItems` stores a snapshot of the product (name/image/price at purchase
> time) rather than references, so order history stays accurate even if the product is
> later edited.

## Seed data (`server/seed/seed.js`)

Running `npm run seed`:

1. Deletes all existing products, users, and orders.
2. Inserts **14 products** across 4 categories.
3. Creates two users:
   - `Admin User` → `admin@novacart.com` / `password123` (isAdmin: true)
   - `Alex Johnson` → `alex@novacart.com` / `password123` (loyaltyPoints: 850, wishlist prefilled)

> ⚠️ Seeding wipes the database. Run it only when you want to reset to demo data.
