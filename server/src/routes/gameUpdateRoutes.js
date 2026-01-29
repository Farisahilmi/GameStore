const express = require('express');
const router = express.Router();
const gameUpdateController = require('../controllers/gameUpdateController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/game/:gameId', gameUpdateController.getGameUpdates);
router.post('/', authenticate, gameUpdateController.createUpdate);
router.delete('/:id', authenticate, gameUpdateController.deleteUpdate);

module.exports = router;
