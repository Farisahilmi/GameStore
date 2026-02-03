const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticate } = require('../middlewares/authMiddleware');

router.post('/topup', authenticate, walletController.topUpWallet);

module.exports = router;