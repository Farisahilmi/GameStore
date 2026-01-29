const express = require('express');
const followController = require('../controllers/followController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/toggle/:publisherId', authenticate, followController.toggleFollow);
router.get('/status/:publisherId', authenticate, followController.getFollowingStatus);
router.get('/my', authenticate, followController.getMyFollowing);

module.exports = router;
