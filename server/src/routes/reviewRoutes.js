const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/:gameId', reviewController.getGameReviews);
router.post('/:gameId', authenticate, reviewController.addReview);
router.post('/vote/:id', authenticate, reviewController.voteReview);
router.put('/:id', authenticate, reviewController.updateReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

module.exports = router;
