const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

router.get('/stats', protect, requirePermission('dashboard:view'), getAdminStats);

router.get('/users', protect, requirePermission('customers:view'), getAllUsers);
router.get('/users/:id', protect, requirePermission('customers:view'), getUserById);
router.put('/users/:id', protect, requirePermission('customers:edit'), updateUser);
router.delete('/users/:id', protect, requirePermission('customers:edit'), deleteUser);

router.get('/orders', protect, requirePermission('orders:view'), getAllOrders);
router.get('/orders/:id', protect, requirePermission('orders:view'), getOrderById);
router.put('/orders/:id/status', protect, requirePermission('orders:edit'), updateOrderStatus);
router.put('/orders/:id/cancel', protect, requirePermission('orders:cancel'), cancelOrder);

router.get('/analytics', protect, requirePermission('analytics:view'), getAnalytics);

module.exports = router;
