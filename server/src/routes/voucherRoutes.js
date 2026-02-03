const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.post('/validate', authenticate, voucherController.validateVoucher);
router.post('/', authenticate, authorize(['ADMIN', 'PUBLISHER']), voucherController.createVoucher);
router.get('/', authenticate, authorize(['ADMIN']), voucherController.getAllVouchers);
router.get('/my', authenticate, authorize(['ADMIN', 'PUBLISHER']), voucherController.getMyVouchers);
router.delete('/:id', authenticate, authorize(['ADMIN', 'PUBLISHER']), voucherController.deleteVoucher);

module.exports = router;
