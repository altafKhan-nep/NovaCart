const { User } = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { validateUser } = require('../middleware/validationMiddleware');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(startOfThisMonth.getTime() - 1);

  const totalSalesResult = await Order.aggregate([
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);
  const totalSales = totalSalesResult.length ? totalSalesResult[0].total : 0;

  const totalOrders = await Order.countDocuments();
  const totalCustomers = await User.countDocuments({ role: 'customer' });
  const totalProducts = await Product.countDocuments();

  const statusCountsResult = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const statusCounts = {
    Pending: 0,
    Processing: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0,
  };
  statusCountsResult.forEach((s) => {
    if (statusCounts[s._id] !== undefined) {
      statusCounts[s._id] = s.count;
    }
  });

  const recentOrders = await Order.find({})
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(10);

  const recentCustomers = await User.find({ role: 'customer' })
    .select('name email avatar createdAt')
    .sort({ createdAt: -1 })
    .limit(10);

  const lowStockProducts = await Product.countDocuments({
    countInStock: { $lt: 5 },
  });

  const monthlySales = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        total: { $sum: '$totalPrice' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const topProducts = await Product.find({})
    .sort({ numReviews: -1 })
    .limit(5)
    .select('name numReviews rating price images');

  const revenueThisMonthResult = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfThisMonth },
      },
    },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);
  const revenueThisMonth = revenueThisMonthResult.length
    ? revenueThisMonthResult[0].total
    : 0;

  const revenueLastMonthResult = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      },
    },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);
  const revenueLastMonth = revenueLastMonthResult.length
    ? revenueLastMonthResult[0].total
    : 0;

  const revenueChange =
    revenueLastMonth > 0
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
      : revenueThisMonth > 0
        ? 100
        : 0;

  const ordersThisMonth = await Order.countDocuments({
    createdAt: { $gte: startOfThisMonth },
  });
  const ordersLastMonth = await Order.countDocuments({
    createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
  });
  const ordersChange =
    ordersLastMonth > 0
      ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100
      : ordersThisMonth > 0
        ? 100
        : 0;

  res.json({
    totalSales,
    totalOrders,
    totalCustomers,
    totalProducts,
    statusCounts,
    recentOrders,
    recentCustomers,
    lowStockProducts,
    monthlySales,
    topProducts,
    revenue: {
      thisMonth: revenueThisMonth,
      lastMonth: revenueLastMonth,
      percentageChange: Math.round(revenueChange * 100) / 100,
    },
    orders: {
      thisMonth: ordersThisMonth,
      lastMonth: ordersLastMonth,
      percentageChange: Math.round(ordersChange * 100) / 100,
    },
  });
});

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 20;
  const page = Number(req.query.page) || 1;

  const filter = {};
  if (req.query.role) {
    filter.role = req.query.role;
  }
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }
  if (req.query.keyword) {
    filter.$or = [
      { name: { $regex: req.query.keyword, $options: 'i' } },
      { email: { $regex: req.query.keyword, $options: 'i' } },
    ];
  }

  const count = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    users,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const orderCount = await Order.countDocuments({ user: user._id });

  const totalSpentResult = await Order.aggregate([
    { $match: { user: user._id } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);
  const totalSpent = totalSpentResult.length ? totalSpentResult[0].total : 0;

  res.json({
    ...user.toJSON(),
    orderCount,
    totalSpent,
  });
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (req.body.name !== undefined) user.name = req.body.name;
  if (req.body.role !== undefined) user.role = req.body.role;
  if (req.body.permissions !== undefined) user.permissions = req.body.permissions;
  if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
  if (req.body.email !== undefined) user.email = req.body.email;
  if (req.body.phone !== undefined) user.phone = req.body.phone;
  if (req.body.password) {
    if (req.body.password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }
    user.password = req.body.password;
  }

  const updatedUser = await user.save();
  res.json(updatedUser);
});

// @desc    Delete user (soft delete)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'super_admin') {
    res.status(400);
    throw new Error('Cannot deactivate a super admin');
  }

  user.isActive = false;
  await user.save();

  res.json({ message: 'User deactivated successfully' });
});

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 20;
  const page = Number(req.query.page) || 1;

  const filter = {};
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.keyword) {
    filter._id = req.query.keyword;
  }

  const count = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    orders,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get order by ID
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json(order);
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const { status } = req.body;
  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];

  if (!status || !validStatuses.includes(status)) {
    res.status(400);
    throw new Error(
      `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    );
  }

  const statusTransitions = {
    Pending: ['Processing', 'Cancelled'],
    Processing: ['Shipped', 'Cancelled'],
    Shipped: ['Delivered'],
    Delivered: [],
  };

  if (!statusTransitions[order.status]?.includes(status)) {
    res.status(400);
    throw new Error(
      `Cannot transition from ${order.status} to ${status}`
    );
  }

  order.status = status;

  if (status === 'Delivered') {
    order.isPaid = true;
    order.paidAt = order.paidAt || new Date();
  }

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

// @desc    Cancel order
// @route   PUT /api/admin/orders/:id/cancel
// @access  Private/Admin
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.status === 'Delivered') {
    res.status(400);
    throw new Error('Cannot cancel a delivered order');
  }

  if (order.status === 'Cancelled') {
    res.status(400);
    throw new Error('Order is already cancelled');
  }

  order.status = 'Cancelled';
  const updatedOrder = await order.save();

  res.json(updatedOrder);
});

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();

  const revenueByMonth = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1),
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const ordersByStatus = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1),
        },
      },
    },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const topCategories = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const customerGrowth = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1),
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({
    revenueByMonth,
    ordersByStatus,
    topCategories,
    customerGrowth,
  });
});

module.exports = {
  getAdminStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAnalytics,
};
