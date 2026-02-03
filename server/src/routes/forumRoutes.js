const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/', forumController.getPosts);
router.post('/', authenticate, forumController.createPost);
router.get('/:id', forumController.getPostDetails);
router.post('/:id/comments', authenticate, forumController.createComment);

module.exports = router;