const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.get('/', friendController.getFriends);
router.get('/pending', friendController.getPendingRequests);
router.get('/search', friendController.searchUsers);
router.post('/request', friendController.sendFriendRequest);
router.put('/request/:requestId/accept', friendController.acceptFriendRequest);
router.delete('/:friendId', friendController.removeFriend);

module.exports = router;
