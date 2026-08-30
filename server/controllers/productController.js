const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { validateProduct } = require('../middleware/validationMiddleware');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const pageSize = 9;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const category = req.query.category
    ? { category: req.query.category }
    : {};

  const flash = req.query.flash ? { isFlashDeal: true } : {};

  const sort = {};

  if (req.query.lowest) sort.price = 1;
  if (req.query.highest) sort.price = -1;

  const count = await Product.countDocuments({ ...keyword, ...category, ...flash });
  const products = await Product.find({ ...keyword, ...category, ...flash })
    .sort(sort)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize), count });
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
};

// @desc    Fetch product categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  const categories = await Product.distinct('category');
  res.json(categories);
};

// @desc    Fetch flash deals
// @route   GET /api/products/flash-deals
// @access  Public
const getFlashDeals = async (req, res) => {
  const products = await Product.find({ isFlashDeal: true });
  res.json(products);
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const validation = validateProduct(req.body);
  if (!validation.isValid) {
    res.status(400);
    throw new Error(validation.errors.join(', '));
  }

  const product = new Product({
    name: req.body.name,
    slug: req.body.slug,
    price: req.body.price,
    originalPrice: req.body.originalPrice || 0,
    category: req.body.category,
    description: req.body.description,
    countInStock: req.body.countInStock || 0,
    images: req.body.images || [],
    colors: req.body.colors || [],
    features: req.body.features || [],
    badge: req.body.badge || '',
    isFlashDeal: req.body.isFlashDeal || false,
    isNewArrival: req.body.isNewArrival || false,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const validation = validateProduct(req.body);
  if (!validation.isValid) {
    res.status(400);
    throw new Error(validation.errors.join(', '));
  }

  const {
    name,
    slug,
    category,
    description,
    price,
    originalPrice,
    countInStock,
    images,
    colors,
    features,
    badge,
    isFlashDeal,
    isNewArrival,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.slug = slug || product.slug;
    product.category = category || product.category;
    product.description = description || product.description;
    product.price = price !== undefined ? price : product.price;
    product.originalPrice = originalPrice !== undefined ? originalPrice : product.originalPrice;
    product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
    product.images = images || product.images;
    product.colors = colors || product.colors;
    product.features = features || product.features;
    product.badge = badge !== undefined ? badge : product.badge;
    product.isFlashDeal = isFlashDeal !== undefined ? isFlashDeal : product.isFlashDeal;
    product.isNewArrival = isNewArrival !== undefined ? isNewArrival : product.isNewArrival;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
};

module.exports = {
  getProducts: asyncHandler(getProducts),
  getProductById: asyncHandler(getProductById),
  getCategories: asyncHandler(getCategories),
  getFlashDeals: asyncHandler(getFlashDeals),
  deleteProduct: asyncHandler(deleteProduct),
  createProduct: asyncHandler(createProduct),
  updateProduct: asyncHandler(updateProduct),
};
