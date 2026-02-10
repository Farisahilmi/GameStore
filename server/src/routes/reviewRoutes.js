
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middlewares/authMiddleware');

// Get reviews for a game
router.get('/:gameId', reviewController.getGameReviews);

// Add a review
router.post('/:gameId', authenticate, reviewController.addReview);

// Update a review
router.put('/:id', authenticate, reviewController.updateReview);

// Delete a review
router.delete('/:id', authenticate, reviewController.deleteReview);

// Vote on a review
router.post('/vote/:id', authenticate, reviewController.voteReview);

module.exports = router;
