const Order = require('../models/Order');
const Product = require('../models/Product');
const Promotion = require('../models/Promotion');
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
    discountPrice,
    totalPrice,
    promoCode,
    notes,
  } = req.body;

  // Validate products exist, prices match, and stock is available
  const validatedItems = [];
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(400);
      throw new Error(`Product not found: ${item.name}`);
    }
    if (product.countInStock < item.qty) {
      res.status(400);
      throw new Error(`Insufficient stock for "${product.name}". Available: ${product.countInStock}, requested: ${item.qty}`);
    }
    validatedItems.push({
      name: product.name,
      qty: item.qty,
      image: product.images?.[0] || item.image,
      price: product.price,
      product: product._id,
    });
  }

  // Decrement stock atomically with negative stock guard
  for (const item of validatedItems) {
    const result = await Product.findOneAndUpdate(
      {
        _id: item.product,
        countInStock: { $gte: item.qty },
      },
      {
        $inc: { countInStock: -item.qty },
      },
      { new: true }
    );
    if (!result) {
      // Rollback previous decrements
      for (const prev of validatedItems) {
        if (prev.product.toString() === item.product.toString()) break;
        await Product.findByIdAndUpdate(
          prev.product,
          { $inc: { countInStock: prev.qty } },
          { new: true }
        );
      }
      res.status(400);
      throw new Error(`Stock changed for "${item.name}". Please try again.`);
    }
  }

  const order = new Order({
    orderItems: validatedItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod: paymentMethod || 'Card',
    itemsPrice,
    taxPrice,
    shippingPrice,
    discountPrice: discountPrice || 0,
    totalPrice,
    promoCode: promoCode || '',
    notes: notes || '',
    status: 'Pending',
    statusHistory: [{ status: 'Pending', date: Date.now(), note: 'Order placed' }],
    isPaid: paymentMethod === 'Card' || paymentMethod === 'UPI',
    paidAt: (paymentMethod === 'Card' || paymentMethod === 'UPI') ? Date.now() : undefined,
  });

  const createdOrder = await order.save();

  // Increment promo usage + track per-user usage
  if (promoCode) {
    const promotion = await Promotion.findOne({ code: promoCode.toUpperCase() });
    if (promotion) {
      promotion.usedCount += 1;
      promotion.usedByUsers.push(req.user._id);
      await promotion.save();
    }
  }

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
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
  res.json(orders);
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const { status, note } = req.body;

    if (!status || !validStatuses.includes(status)) {
      res.status(400);
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Status transition validation
    const statusTransitions = {
      Pending: ['Processing', 'Cancelled'],
      Processing: ['Shipped', 'Cancelled'],
      Shipped: ['Delivered'],
      Delivered: [],
      Cancelled: [],
    };

    const allowed = statusTransitions[order.status] || [];
    if (!allowed.includes(status)) {
      res.status(400);
      throw new Error(`Cannot transition from "${order.status}" to "${status}". Allowed: ${allowed.join(', ') || 'none'}`);
    }

    order.status = status;
    order.statusHistory.push({
      status,
      date: Date.now(),
      note: note || `Status updated to ${status}`,
    });

    if (status === 'Delivered') {
      order.deliveredAt = Date.now();
    }
    if (status === 'Cancelled') {
      order.cancelledAt = Date.now();
      order.cancelReason = note || '';

      // Restore stock
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { countInStock: item.qty } },
          { new: true }
        );
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

// @desc    Cancel order (user)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to cancel this order');
  }

  const cancelableStatuses = ['Pending', 'Processing'];
  if (!cancelableStatuses.includes(order.status)) {
    res.status(400);
    throw new Error(`Cannot cancel order with status "${order.status}". Only Pending or Processing orders can be cancelled.`);
  }

  order.status = 'Cancelled';
  order.cancelledAt = Date.now();
  order.cancelReason = req.body.reason || 'Cancelled by customer';
  order.statusHistory.push({
    status: 'Cancelled',
    date: Date.now(),
    note: req.body.reason || 'Cancelled by customer',
  });

  // Restore stock
  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { countInStock: item.qty } },
      { new: true }
    );
  }

  const updatedOrder = await order.save();
  res.json(updatedOrder);
};

module.exports = {
  addOrderItems: asyncHandler(addOrderItems),
  getOrderById: asyncHandler(getOrderById),
  updateOrderToPaid: asyncHandler(updateOrderToPaid),
  getMyOrders: asyncHandler(getMyOrders),
  getOrders: asyncHandler(getOrders),
  updateOrderStatus: asyncHandler(updateOrderStatus),
  cancelOrder: asyncHandler(cancelOrder),
};
