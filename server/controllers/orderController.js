const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const { validateOrder } = require('../middleware/validationMiddleware');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  const validation = validateOrder(req.body);
  if (!validation.isValid) {
    res.status(400);
    throw new Error(validation.errors.join(', '));
  }

  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = new Order({
    orderItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdminRole()) {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdminRole()) {
      res.status(403);
      throw new Error('Not authorized to update this order');
    }
    order.isPaid = true;
    order.paidAt = Date.now();
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!req.body.status || !validStatuses.includes(req.body.status)) {
      res.status(400);
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    order.status = req.body.status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

module.exports = {
  addOrderItems: asyncHandler(addOrderItems),
  getOrderById: asyncHandler(getOrderById),
  updateOrderToPaid: asyncHandler(updateOrderToPaid),
  getMyOrders: asyncHandler(getMyOrders),
  getOrders: asyncHandler(getOrders),
  updateOrderStatus: asyncHandler(updateOrderStatus),
};
