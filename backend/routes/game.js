const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { protect } = require('../middleware/auth');

// All game routes require authentication
router.post('/start', protect, gameController.startGame);
router.post('/answer', protect, gameController.submitAnswer);

module.exports = router;