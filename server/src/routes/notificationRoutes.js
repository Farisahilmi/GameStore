const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/my', authenticate, notificationController.getMyNotifications);
router.put('/:id/read', authenticate, notificationController.markAsRead);

module.exports = router;
