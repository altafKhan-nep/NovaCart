const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();
const connectDB = require('../config/db');
const Product = require('../models/Product');
const { User } = require('../models/User');
const Order = require('../models/Order');
const Banner = require('../models/Banner');
const Category = require('../models/Category');
const Navigation = require('../models/Navigation');
const Promotion = require('../models/Promotion');
const Settings = require('../models/Settings');

const products = [
  {
    name: 'Vibe Wireless Headphones', slug: 'vibe-wireless-headphones', category: 'Electronics',
    description: 'Sleek, modern wireless headphones in a bright coral color that float in a clean studio environment. Immerse yourself in rich, joyful sound.',
    price: 89.99, originalPrice: 129.99, countInStock: 25, rating: 4.5, numReviews: 128,
    badge: '-30%', isFlashDeal: true,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
    colors: ['#ff7f50', '#006a62', '#1b1c1a'], features: ['Wireless', 'Noise cancelling', '30hr battery'],
  },
  {
    name: 'SnapJoy Instant Camera', slug: 'snapjoy-instant-camera', category: 'Electronics',
    description: 'A trendy, compact instant camera in bright turquoise. Capture joyful moments and watch them print instantly.',
    price: 59.0, originalPrice: 69.0, countInStock: 18, rating: 4.0, numReviews: 84,
    badge: '-15%', isFlashDeal: true,
    images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600'],
    colors: ['#40E0D0', '#006a62', '#ffffff'], features: ['Instant print', 'HD lens', 'Vintage filter'],
  },
  {
    name: 'Aura Smart Watch', slug: 'aura-smart-watch', category: 'Electronics',
    description: 'A stylish, minimalist smart watch with a bright yellow band. Track your day, your health, and your joy.',
    price: 119.0, originalPrice: 199.0, countInStock: 30, rating: 4.8, numReviews: 210,
    badge: '-40%', isFlashDeal: true,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'],
    colors: ['#e9c400', '#ff7f50', '#006a62'], features: ['Heart rate', 'GPS', '10-day battery'],
  },
  {
    name: 'NovaSound Headphones', slug: 'novasound-headphones', category: 'Electronics',
    description: 'High-end noise-canceling headphones resting on a minimalist display stand. Premium matte finish and sleek curves.',
    price: 249.99, countInStock: 12, rating: 4.7, numReviews: 156, badge: 'New', isNewArrival: true,
    images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600'],
    colors: ['#1b1c1a', '#ff7f50', '#fbf9f5'], features: ['Active noise cancelling', 'Hi-Fi sound', '40hr battery'],
  },
  {
    name: 'GlowTab Tablet Pro', slug: 'glowtab-tablet-pro', category: 'Electronics',
    description: 'An ultra-thin tablet displaying a colorful abstract wallpaper. Vibrant screen, modern design, lightweight.',
    price: 499.0, countInStock: 8, rating: 5.0, numReviews: 84,
    images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600'],
    colors: ['#006a62', '#1b1c1a', '#ffffff'], features: ['10.9" display', '128GB storage', 'All-day battery'],
  },
  {
    name: 'PixelWatch Series 3', slug: 'pixelwatch-series-3', category: 'Electronics',
    description: 'A modern smartwatch with a vibrant digital face and soft coral silicone band. Dynamic, playful, bright.',
    price: 199.0, originalPrice: 249.0, countInStock: 15, rating: 4.2, numReviews: 42, badge: 'Sale',
    images: ['https://images.unsplash.com/photo-1544117519-31c9f4e4f9c1?w=600'],
    colors: ['#ff7f50', '#1b1c1a', '#40E0D0'], features: ['Fitness tracking', 'Tests & calls', 'Water resistant'],
  },
  {
    name: 'Terra Ceramic Mug', slug: 'terra-ceramic-mug', category: 'Home Decor',
    description: 'A minimalist ceramic coffee mug in a soft terracotta color. Clean, joyful, and perfect for your morning ritual.',
    price: 24.0, countInStock: 50, rating: 4.6, numReviews: 210,
    images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600'],
    colors: ['#a43c12', '#ff7f50', '#ffffff'], features: ['Handmade', 'Microwave safe', '12oz capacity'],
  },
  {
    name: 'Cozy Knit Blanket', slug: 'cozy-knit-blanket', category: 'Home Decor',
    description: 'A cozy, pastel-colored knitted blanket that conveys warmth and comfort in a bright, modern setting.',
    price: 45.0, countInStock: 20, rating: 4.4, numReviews: 96,
    images: ['https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=600'],
    colors: ['#5ef6e6', '#ffb59c', '#fbf9f5'], features: ['Soft knit', 'Machine washable', '50" x 60"'],
  },
  {
    name: 'Flow Notebook', slug: 'flow-notebook', category: 'Home Decor',
    description: 'A stylish, soft-cover notebook with a minimalist design in pastel teal. Perfect for jotting down joyful ideas.',
    price: 18.0, countInStock: 100, rating: 4.3, numReviews: 150,
    images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=600'],
    colors: ['#40E0D0', '#a43c12', '#ffffff'], features: ['120 pages', 'Dotted grid', 'Lay-flat binding'],
  },
  {
    name: 'Joyful Ceramic Mug Set', slug: 'joyful-ceramic-mug-set', category: 'Home Decor',
    description: 'A bright yellow ceramic mug with a soft, minimalist aesthetic, placed on a light beige surface. Warm, joyful mood.',
    price: 24.0, countInStock: 40, rating: 4.8, numReviews: 300,
    images: ['https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=600'],
    colors: ['#e9c400', '#ff7f50', '#a43c12'], features: ['Set of 2', 'Dishwasher safe', 'Holds warmth'],
  },
  {
    name: 'Sunny Crossbody Bag', slug: 'sunny-crossbody-bag', category: 'Fashion',
    description: 'A vibrant turquoise crossbody bag that adds a pop of color to any outfit. Compact, stylish, and joyful.',
    price: 39.99, originalPrice: 55.0, countInStock: 22, rating: 4.1, numReviews: 67, badge: '-27%',
    images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600'],
    colors: ['#40E0D0', '#006a62', '#ff7f50'], features: ['Adjustable strap', 'Water-resistant', 'Multiple pockets'],
  },
  {
    name: 'Coral Comfort Sneakers', slug: 'coral-comfort-sneakers', category: 'Fashion',
    description: 'Lightweight, breathable sneakers in a cheerful coral color. Designed for all-day comfort and everyday joy.',
    price: 74.99, countInStock: 60, rating: 4.5, numReviews: 190,
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600'],
    colors: ['#ff7f50', '#ffffff', '#1b1c1a'], features: ['Memory foam', 'Breathable', 'Rubber sole'],
  },
  {
    name: 'Snuggle Plush Bear', slug: 'snuggle-plush-bear', category: 'Toys',
    description: 'A soft, huggable plush bear in a gentle pastel tone. The perfect companion for cozy, joyful moments.',
    price: 29.99, countInStock: 45, rating: 4.9, numReviews: 320,
    images: ['https://images.unsplash.com/photo-1559454403-b8a6b6b7b6c5?w=600'],
    colors: ['#ffb59c', '#fbf9f5', '#e9c400'], features: ['Extra soft', 'Machine washable', '20 inches'],
  },
  {
    name: 'Build-A-Joy Blocks', slug: 'build-a-joy-blocks', category: 'Toys',
    description: 'Colorful building blocks in vibrant coral, teal, and yellow. Spark creativity and hours of playful joy.',
    price: 34.99, countInStock: 35, rating: 4.7, numReviews: 140,
    images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600'],
    colors: ['#ff7f50', '#40E0D0', '#e9c400'], features: ['100 pieces', 'Non-toxic', 'Educational'],
  },
];

const banners = [
  { title: 'Summer Sale!', subtitle: 'Up to 50% off', description: 'Shop the biggest sale of the season', image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200', link: '/shop', ctaText: 'Shop Now', position: 'hero', isActive: true, order: 0, bgColor: '#fff5f0' },
  { title: 'New Arrivals', subtitle: 'Fresh drops weekly', description: 'Check out the latest products', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200', link: '/shop', ctaText: 'Explore', position: 'hero', isActive: true, order: 1, bgColor: '#f0fffe' },
  { title: 'Free Shipping', subtitle: 'On orders over $50', description: 'Free standard shipping on qualifying orders', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200', link: '/shop', ctaText: 'Shop Now', position: 'promo', isActive: true, order: 0, bgColor: '#fbf9f5' },
];

const categories = [
  { name: 'Electronics', slug: 'electronics', description: 'Gadgets, devices, and tech essentials', icon: 'devices', isActive: true, order: 0, productCount: 6 },
  { name: 'Fashion', slug: 'fashion', description: 'Trendy clothing and accessories', icon: 'apparel', isActive: true, order: 1, productCount: 2 },
  { name: 'Home Decor', slug: 'home-decor', description: 'Beautiful items for your living space', icon: 'deck', isActive: true, order: 2, productCount: 4 },
  { name: 'Toys', slug: 'toys', description: 'Fun and educational toys for all ages', icon: 'toys', isActive: true, order: 3, productCount: 2 },
];

const navigationItems = [
  { label: 'Home', url: '/', order: 0, isActive: true, position: 'header' },
  { label: 'Shop', url: '/shop', order: 1, isActive: true, position: 'header' },
  { label: 'Deals', url: '/shop?flash=true', order: 2, isActive: true, position: 'header' },
  { label: 'New Arrivals', url: '/shop?category=Electronics', order: 3, isActive: true, position: 'header' },
  { label: 'Support', url: '/account', order: 0, isActive: true, position: 'footer' },
  { label: 'Privacy Policy', url: '/privacy', order: 1, isActive: true, position: 'footer' },
  { label: 'Terms of Service', url: '/terms', order: 2, isActive: true, position: 'footer' },
];

const promotions = [
  { name: 'Summer Blowout', code: 'SUMMER50', description: '50% off all orders', type: 'percentage', value: 50, minPurchase: 100, maxDiscount: 75, usageLimit: 500, usedCount: 127, isActive: true, startDate: new Date('2026-06-01'), endDate: new Date('2026-09-01') },
  { name: 'Welcome Discount', code: 'WELCOME10', description: '$10 off first order', type: 'fixed', value: 10, minPurchase: 30, usageLimit: 0, usedCount: 89, isActive: true, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31') },
  { name: 'Free Shipping Friday', code: 'FRIDAYSHIP', description: 'Free shipping on all orders', type: 'free_shipping', value: 0, minPurchase: 0, usageLimit: 200, usedCount: 45, isActive: true, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31') },
];

const seed = async () => {
  try {
    await connectDB();

    await Product.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});
    await Banner.deleteMany({});
    await Category.deleteMany({});
    await Navigation.deleteMany({});
    await Promotion.deleteMany({});
    await Settings.deleteMany({});

    const createdProducts = await Product.insertMany(products);
    console.log(`Seeded ${createdProducts.length} products`);

    const users = [
      {
        name: 'Jordan Mitchell',
        email: 'superadmin@novacart.com',
        password: 'password123',
        isAdmin: true,
        role: 'super_admin',
        phone: '+1 (415) 555-0100',
        avatar: '',
        address: { fullName: 'Jordan Mitchell', street: '100 Market Street, Suite 500', city: 'San Francisco', zip: '94105' },
        loyaltyPoints: 0,
        isActive: true,
      },
      {
        name: 'Sarah Chen',
        email: 'admin@novacart.com',
        password: 'password123',
        isAdmin: true,
        role: 'admin',
        phone: '+1 (415) 555-0101',
        avatar: '',
        address: { fullName: 'Sarah Chen', street: '250 Brannan Street', city: 'San Francisco', zip: '94107' },
        loyaltyPoints: 0,
        isActive: true,
      },
      {
        name: 'Marcus Rivera',
        email: 'content@novacart.com',
        password: 'password123',
        isAdmin: true,
        role: 'content_manager',
        phone: '+1 (415) 555-0102',
        avatar: '',
        address: { fullName: 'Marcus Rivera', street: '88 Colin P Kelly Jr Street', city: 'San Francisco', zip: '94107' },
        loyaltyPoints: 0,
        isActive: true,
      },
      {
        name: 'Emily Nakamura',
        email: 'orders@novacart.com',
        password: 'password123',
        isAdmin: true,
        role: 'order_manager',
        phone: '+1 (415) 555-0103',
        avatar: '',
        address: { fullName: 'Emily Nakamura', street: '425 Market Street, Floor 12', city: 'San Francisco', zip: '94105' },
        loyaltyPoints: 0,
        isActive: true,
      },
      {
        name: 'Alex Johnson',
        email: 'alex@novacart.com',
        password: 'password123',
        role: 'customer',
        phone: '+1 (555) 234-5678',
        avatar: '',
        address: { fullName: 'Alex Johnson', street: '742 Evergreen Terrace', city: 'Springfield', zip: '62704' },
        loyaltyPoints: 850,
        wishlist: [createdProducts[0]._id, createdProducts[6]._id],
        isActive: true,
      },
      {
        name: 'Maria Garcia',
        email: 'maria@novacart.com',
        password: 'password123',
        role: 'customer',
        phone: '+1 (555) 345-6789',
        avatar: '',
        address: { fullName: 'Maria Garcia', street: '1600 Pennsylvania Avenue', city: 'Washington', zip: '20500' },
        loyaltyPoints: 420,
        wishlist: [createdProducts[2]._id, createdProducts[12]._id],
        isActive: true,
      },
      {
        name: 'David Kim',
        email: 'david@novacart.com',
        password: 'password123',
        role: 'customer',
        phone: '+1 (555) 456-7890',
        avatar: '',
        address: { fullName: 'David Kim', street: '350 Fifth Avenue', city: 'New York', zip: '10118' },
        loyaltyPoints: 1200,
        wishlist: [createdProducts[3]._id],
        isActive: true,
      },
      {
        name: 'Priya Patel',
        email: 'priya@novacart.com',
        password: 'password123',
        role: 'customer',
        phone: '+1 (555) 567-8901',
        avatar: '',
        address: { fullName: 'Priya Patel', street: '233 S Wacker Drive', city: 'Chicago', zip: '60606' },
        loyaltyPoints: 675,
        wishlist: [createdProducts[4]._id, createdProducts[9]._id],
        isActive: true,
      },
    ];

    for (const userData of users) {
      await User.create(userData);
    }
    console.log(`Seeded ${users.length} users`);

    const customerIds = await User.find({ role: 'customer' }).select('_id');
    if (customerIds.length > 0) {
      const sampleOrders = [
        {
          user: customerIds[0]._id,
          orderItems: [
            { name: createdProducts[0].name, qty: 1, image: createdProducts[0].images[0], price: createdProducts[0].price, product: createdProducts[0]._id },
            { name: createdProducts[6].name, qty: 2, image: createdProducts[6].images[0], price: createdProducts[6].price, product: createdProducts[6]._id },
          ],
          shippingAddress: { fullName: 'Alex Johnson', street: '742 Evergreen Terrace', city: 'Springfield', zip: '62704' },
          paymentMethod: 'Card', itemsPrice: 137.99, taxPrice: 11.04, shippingPrice: 0, totalPrice: 149.03,
          status: 'Delivered', isPaid: true, paidAt: new Date('2026-08-15'),
        },
        {
          user: customerIds[0]._id,
          orderItems: [
            { name: createdProducts[3].name, qty: 1, image: createdProducts[3].images[0], price: createdProducts[3].price, product: createdProducts[3]._id },
          ],
          shippingAddress: { fullName: 'Alex Johnson', street: '742 Evergreen Terrace', city: 'Springfield', zip: '62704' },
          paymentMethod: 'Card', itemsPrice: 249.99, taxPrice: 20.00, shippingPrice: 0, totalPrice: 269.99,
          status: 'Shipped', isPaid: true, paidAt: new Date('2026-08-25'),
        },
        {
          user: customerIds[1]._id,
          orderItems: [
            { name: createdProducts[2].name, qty: 1, image: createdProducts[2].images[0], price: createdProducts[2].price, product: createdProducts[2]._id },
            { name: createdProducts[10].name, qty: 1, image: createdProducts[10].images[0], price: createdProducts[10].price, product: createdProducts[10]._id },
          ],
          shippingAddress: { fullName: 'Maria Garcia', street: '1600 Pennsylvania Avenue', city: 'Washington', zip: '20500' },
          paymentMethod: 'Card', itemsPrice: 158.99, taxPrice: 12.72, shippingPrice: 5.99, totalPrice: 177.70,
          status: 'Processing', isPaid: true, paidAt: new Date('2026-08-28'),
        },
        {
          user: customerIds[2]._id,
          orderItems: [
            { name: createdProducts[4].name, qty: 1, image: createdProducts[4].images[0], price: createdProducts[4].price, product: createdProducts[4]._id },
          ],
          shippingAddress: { fullName: 'David Kim', street: '350 Fifth Avenue', city: 'New York', zip: '10118' },
          paymentMethod: 'PayPal', itemsPrice: 499.00, taxPrice: 39.92, shippingPrice: 0, totalPrice: 538.92,
          status: 'Pending', isPaid: false,
        },
        {
          user: customerIds[3]._id,
          orderItems: [
            { name: createdProducts[8].name, qty: 3, image: createdProducts[8].images[0], price: createdProducts[8].price, product: createdProducts[8]._id },
            { name: createdProducts[12].name, qty: 1, image: createdProducts[12].images[0], price: createdProducts[12].price, product: createdProducts[12]._id },
          ],
          shippingAddress: { fullName: 'Priya Patel', street: '233 S Wacker Drive', city: 'Chicago', zip: '60606' },
          paymentMethod: 'Card', itemsPrice: 83.97, taxPrice: 6.72, shippingPrice: 5.99, totalPrice: 96.68,
          status: 'Delivered', isPaid: true, paidAt: new Date('2026-08-20'),
        },
        {
          user: customerIds[0]._id,
          orderItems: [
            { name: createdProducts[11].name, qty: 1, image: createdProducts[11].images[0], price: createdProducts[11].price, product: createdProducts[11]._id },
          ],
          shippingAddress: { fullName: 'Alex Johnson', street: '742 Evergreen Terrace', city: 'Springfield', zip: '62704' },
          paymentMethod: 'Card', itemsPrice: 74.99, taxPrice: 6.00, shippingPrice: 5.99, totalPrice: 86.98,
          status: 'Cancelled', isPaid: false,
        },
      ];
      await Order.insertMany(sampleOrders);
      console.log(`Seeded ${sampleOrders.length} orders`);
    }

    await Banner.insertMany(banners);
    console.log(`Seeded ${banners.length} banners`);

    await Category.insertMany(categories);
    console.log(`Seeded ${categories.length} categories`);

    await Navigation.insertMany(navigationItems);
    console.log(`Seeded ${navigationItems.length} navigation items`);

    await Promotion.insertMany(promotions);
    console.log(`Seeded ${promotions.length} promotions`);

    await Settings.create({});
    console.log('Created default settings');

    console.log('\n--- Demo Accounts ---');
    console.log('Super Admin:    superadmin@novacart.com / password123 (Jordan Mitchell)');
    console.log('Admin:          admin@novacart.com / password123 (Sarah Chen)');
    console.log('Content Mgr:    content@novacart.com / password123 (Marcus Rivera)');
    console.log('Order Mgr:      orders@novacart.com / password123 (Emily Nakamura)');
    console.log('Customer:       alex@novacart.com / password123 (Alex Johnson)');
    console.log('Customer:       maria@novacart.com / password123 (Maria Garcia)');
    console.log('Customer:       david@novacart.com / password123 (David Kim)');
    console.log('Customer:       priya@novacart.com / password123 (Priya Patel)');

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seed();
