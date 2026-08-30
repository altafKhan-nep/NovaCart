const Settings = require('../models/Settings');
const asyncHandler = require('../utils/asyncHandler');

const DEFAULT_SETTINGS = {
  store: {
    name: 'NovaCart',
    tagline: 'Discover Joy in Every Box',
    logo: '',
    favicon: '',
    contactEmail: 'support@novacart.com',
    phone: '',
    address: '',
  },
  payment: {
    currency: 'USD',
    currencySymbol: '$',
    acceptCreditCards: true,
    acceptPaypal: false,
    stripePublicKey: '',
  },
  shipping: {
    freeShippingThreshold: 50,
    standardRate: 5.99,
    expressRate: 12.99,
    enableLocalDelivery: false,
  },
  tax: {
    enabled: true,
    rate: 0.08,
    includeInPrice: false,
  },
  notifications: {
    orderConfirmation: true,
    shippingUpdates: true,
    lowStockAlert: true,
    lowStockThreshold: 5,
    newOrderAlert: true,
  },
  security: {
    requireEmailVerification: false,
    enableTwoFactor: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
  },
  seo: {
    metaTitle: 'NovaCart - Discover Joy in Every Box',
    metaDescription: 'Shop vibrant fashion, quirky electronics, and home delights.',
    ogImage: '',
  },
};

const VALID_SECTIONS = ['store', 'payment', 'shipping', 'tax', 'notifications', 'security', 'seo'];

// @desc    Get all settings
// @route   GET /api/settings
// @access  Public
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create(DEFAULT_SETTINGS);
  }

  res.json(settings);
});

// @desc    Update settings by section
// @route   PUT /api/settings/:section
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
  const { section } = req.params;

  if (!VALID_SECTIONS.includes(section)) {
    res.status(400);
    throw new Error(`Invalid section. Must be one of: ${VALID_SECTIONS.join(', ')}`);
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400);
    throw new Error('Request body cannot be empty');
  }

  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create(DEFAULT_SETTINGS);
  }

  const updateData = {};
  const sectionData = settings[section] || {};

  Object.keys(req.body).forEach((key) => {
    if (sectionData.hasOwnProperty(key) || req.body[key] !== undefined) {
      updateData[`${section}.${key}`] = req.body[key];
    }
  });

  if (Object.keys(updateData).length === 0) {
    res.status(400);
    throw new Error('No valid fields to update');
  }

  settings = await Settings.findByIdAndUpdate(
    settings._id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  res.json(settings);
});

module.exports = {
  getSettings,
  updateSettings,
};
