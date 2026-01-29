const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Only ADMIN and PUBLISHER can see stats
router.get('/dashboard', authenticate, authorize(['ADMIN', 'PUBLISHER']), analyticsController.getDashboardStats);

module.exports = router;
