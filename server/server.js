const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const connectDB = require('./config/db');
const { sanitizeInput, preventInjection } = require('./middleware/sanitizeMiddleware');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const navigationRoutes = require('./routes/navigationRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

connectDB();

const app = express();

// --- Request ID middleware ---
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// --- Request timing middleware ---
app.use((req, res, next) => {
  req.startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${req.method}] ${req.originalUrl} - ${duration}ms [${req.id}]`);
    }
  });
  next();
});

// --- Security headers middleware ---
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  next();
});

// --- Helmet ---
app.disable('x-powered-by');
app.use(helmet());

// --- CORS ---
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  process.env.FRONTEND_URL,
].filter(Boolean);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// --- Compression ---
app.use(compression());

// --- Request logging ---
app.use(morgan('combined'));

// --- Request size validation ---
app.use((req, res, next) => {
  const contentLength = req.headers['content-length'];
  const maxSize = 1024 * 100; // 100KB
  if (contentLength && parseInt(contentLength, 10) > maxSize) {
    return res.status(413).json({ message: 'Request body too large' });
  }
  next();
});

// --- Body parser ---
app.use(express.json({ limit: '100kb' }));

// --- NoSQL injection prevention ---
app.use(mongoSanitize());

// --- XSS protection ---
app.use(xss());

// --- HTTP parameter pollution prevention ---
app.use(hpp());

// --- Input sanitization & injection check ---
app.use(sanitizeInput);
app.use(preventInjection);

// --- Rate limiters ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again later.' },
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts from this IP, please try again after 15 minutes.' },
});
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many order requests, please try again later.' },
});
const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);
app.use('/api/users/login', loginLimiter);
app.use('/api/users', authLimiter);
app.use('/api/orders', orderLimiter);

// --- CORS rejection handler ---
app.use((err, req, res, next) => {
  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS policy: this origin is not allowed' });
  }
  next(err);
});

// --- Routes ---
app.get('/', (req, res) => {
  res.send('NovaCart API is running...');
});

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/settings', settingsRoutes);

// --- Error handling ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
