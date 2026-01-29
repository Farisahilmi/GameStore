const express = require('express');
const transactionController = require('../controllers/transactionController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// User routes
router.post('/', authenticate, transactionController.createTransaction);
router.get('/my-transactions', authenticate, transactionController.getUserTransactions);

// Admin routes
router.get('/all', authenticate, authorize(['ADMIN']), transactionController.getAllTransactions);

module.exports = router;
