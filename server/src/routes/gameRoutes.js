const express = require('express');
const gameController = require('../controllers/gameController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public Routes
router.get('/', gameController.getAllGames);
router.get('/recommendations/my', authenticate, gameController.getRecommendations);
router.get('/discovery-queue', authenticate, gameController.getDiscoveryQueue);
router.get('/:id', gameController.getGameById);

// Protected Routes (Publisher & Admin)
router.post('/', authenticate, authorize(['PUBLISHER', 'ADMIN']), gameController.createGame);
router.put('/:id', authenticate, authorize(['PUBLISHER', 'ADMIN']), gameController.updateGame);
router.delete('/:id', authenticate, authorize(['PUBLISHER', 'ADMIN']), gameController.deleteGame);

module.exports = router;
