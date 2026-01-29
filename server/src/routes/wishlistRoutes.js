const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.get('/', wishlistController.getWishlist);
router.post('/', wishlistController.addToWishlist);
router.delete('/:gameId', wishlistController.removeFromWishlist);

module.exports = router;
