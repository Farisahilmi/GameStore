const express = require('express');
const saleController = require('../controllers/saleController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', saleController.getAllEvents);
router.get('/active', saleController.getActiveEvent);
router.post('/', authenticate, authorize(['ADMIN']), saleController.createEvent);
router.put('/:id', authenticate, authorize(['ADMIN']), saleController.updateEvent);
router.delete('/:id', authenticate, authorize(['ADMIN']), saleController.deleteEvent);

module.exports = router;
