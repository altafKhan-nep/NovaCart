const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} = require('../controllers/categoryController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', protect, requirePermission('categories:create'), createCategory);
router.put('/:id', protect, requirePermission('categories:edit'), updateCategory);
router.delete('/:id', protect, requirePermission('categories:delete'), deleteCategory);
router.put('/reorder', protect, requirePermission('categories:edit'), reorderCategories);

module.exports = router;
