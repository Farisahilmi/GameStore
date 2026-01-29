const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/', activityController.getActivities);
router.get('/friends', authenticate, activityController.getFriendActivities);

module.exports = router;
