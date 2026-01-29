const express = require('express');
const libraryController = require('../controllers/libraryController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/my', authenticate, libraryController.getMyLibrary);
router.delete('/:gameId', authenticate, libraryController.removeFromLibrary);

module.exports = router;
