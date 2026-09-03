const express = require('express');
const router = express.Router();
const {
  getPromotions,
  createPromotion,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  validatePromotion,
  getActivePromotions,
} = require('../controllers/promotionController');
const { protect, admin, requirePermission } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getPromotions);
router.post('/', protect, requirePermission('promotions:create'), createPromotion);
router.get('/active', getActivePromotions);
router.post('/validate', validatePromotion);
router.get('/:id', protect, admin, getPromotionById);
router.put('/:id', protect, requirePermission('promotions:edit'), updatePromotion);
router.delete('/:id', protect, requirePermission('promotions:delete'), deletePromotion);

module.exports = router;
