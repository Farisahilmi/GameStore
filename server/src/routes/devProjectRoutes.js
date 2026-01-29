const express = require('express');
const devProjectController = require('../controllers/devProjectController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/public', devProjectController.getAllPublicProjects);
router.get('/my', authenticate, authorize(['PUBLISHER', 'ADMIN']), devProjectController.getMyProjects);
router.get('/:id/comments', devProjectController.getProjectComments);
router.post('/:id/comments', authenticate, devProjectController.addComment);
router.post('/', authenticate, authorize(['PUBLISHER', 'ADMIN']), devProjectController.createProject);
router.put('/:id', authenticate, authorize(['PUBLISHER', 'ADMIN']), devProjectController.updateProject);
router.delete('/:id', authenticate, authorize(['PUBLISHER', 'ADMIN']), devProjectController.deleteProject);

module.exports = router;
