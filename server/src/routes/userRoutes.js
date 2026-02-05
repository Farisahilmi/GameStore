const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.put('/theme', authenticate, userController.updateTheme);
router.put('/status', authenticate, userController.updateStatus);
router.post('/:id/comments', userController.addProfileComment);
router.get('/:id/comments', userController.getProfileComments);
router.post('/heartbeat', authenticate, userController.heartbeat);
router.get('/:id/profile', authenticate, userController.getUserProfile);
router.put('/upgrade-to-publisher', authenticate, userController.upgradeToPublisher);
router.delete('/me', authenticate, userController.deleteAccount);

// Admin routes
router.get('/', authenticate, authorize(['ADMIN']), userController.getAllUsers);
router.put('/:id/role', authenticate, authorize(['ADMIN']), userController.updateUserRole);

module.exports = router;
