const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.post('/validate', authenticate, voucherController.validateVoucher);
router.post('/', authenticate, authorize(['ADMIN']), voucherController.createVoucher);
router.get('/', authenticate, authorize(['ADMIN']), voucherController.getAllVouchers);

module.exports = router;
