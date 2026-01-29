const express = require('express');
const publisherController = require('../controllers/publisherController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/profile/:id', publisherController.getPublisherProfile);
router.get('/stats', authenticate, authorize(['PUBLISHER']), publisherController.getPublisherStats);

module.exports = router;
