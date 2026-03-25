const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { protect } = require('../middleware/auth');

router.get('/items', protect, shopController.getShopItems);
router.post('/purchase', protect, shopController.purchaseItem);
router.post('/equip', protect, shopController.equipItem);

module.exports = router;
