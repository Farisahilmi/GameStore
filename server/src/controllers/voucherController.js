const prisma = require('../utils/prisma');
const Joi = require('joi');

const voucherSchema = Joi.object({
    code: Joi.string().required().min(3).max(20).uppercase(),
    discountPercent: Joi.number().required().min(1).max(100),
    maxUses: Joi.number().optional().min(1).default(100),
    expiryDate: Joi.date().required().greater('now')
});

const validateVoucher = async (req, res, next) => {
    try {
        let { code } = req.body;
        const userId = req.user.id;

        if (!code) {
            const error = new Error('Voucher code is required');
            error.statusCode = 400;
            throw error;
        }

        code = code.toUpperCase();

        const voucher = await prisma.voucher.findUnique({
            where: { code }
        });

        if (!voucher) {
            const error = new Error('Invalid voucher code');
            error.statusCode = 404;
            throw error;
        }

        if (!voucher.isActive) {
            const error = new Error('Voucher is inactive');
            error.statusCode = 400;
            throw error;
        }

        if (new Date() > new Date(voucher.expiryDate)) {
            const error = new Error('Voucher has expired');
            error.statusCode = 400;
            throw error;
        }

        if (voucher.usedCount >= voucher.maxUses) {
            const error = new Error('Voucher usage limit reached');
            error.statusCode = 400;
            throw error;
        }

        // Check if user already used this voucher
        const usage = await prisma.voucherUsage.findUnique({
            where: {
                voucherId_userId: {
                    voucherId: voucher.id,
                    userId
                }
            }
        });

        if (usage) {
            const error = new Error('You have already used this voucher');
            error.statusCode = 400;
            throw error;
        }

        res.status(200).json({
            success: true,
            data: {
                code: voucher.code,
                discountPercent: voucher.discountPercent
            },
            message: 'Voucher is valid'
        });
    } catch (error) {
        next(error);
    }
};

const createVoucher = async (req, res, next) => {
    try {
        const { error, value } = voucherSchema.validate(req.body);
        if (error) {
            error.statusCode = 400;
            throw error;
        }

        let { code, discountPercent, maxUses, expiryDate } = value;

        // Check if exists
        const existing = await prisma.voucher.findUnique({ where: { code } });
        if (existing) {
            const error = new Error('Voucher code already exists');
            error.statusCode = 400;
            throw error;
        }

        const voucher = await prisma.voucher.create({
            data: {
                code,
                discountPercent,
                maxUses,
                expiryDate: new Date(expiryDate),
                publisherId: req.user.role === 'ADMIN' ? null : req.user.id
            }
        });

        res.status(201).json({
            success: true,
            data: voucher
        });
    } catch (error) {
        next(error);
    }
};

const getAllVouchers = async (req, res, next) => {
    try {
        const vouchers = await prisma.voucher.findMany({
            orderBy: { createdAt: 'desc' },
            include: { publisher: { select: { id: true, name: true } } }
        });
        res.status(200).json({
            success: true,
            data: vouchers
        });
    } catch (error) {
        next(error);
    }
};

const getMyVouchers = async (req, res, next) => {
    try {
        const where = req.user.role === 'ADMIN' ? {} : { publisherId: req.user.id };
        const vouchers = await prisma.voucher.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({
            success: true,
            data: vouchers
        });
    } catch (error) {
        next(error);
    }
};

const deleteVoucher = async (req, res, next) => {
    try {
        const { id } = req.params;
        const voucher = await prisma.voucher.findUnique({ where: { id: parseInt(id) } });

        if (!voucher) {
            const error = new Error('Voucher not found');
            error.statusCode = 404;
            throw error;
        }

        if (req.user.role !== 'ADMIN' && voucher.publisherId !== req.user.id) {
            const error = new Error('Not authorized to delete this voucher');
            error.statusCode = 403;
            throw error;
        }

        await prisma.voucher.delete({ where: { id: parseInt(id) } });

        res.status(200).json({
            success: true,
            message: 'Voucher deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateVoucher,
    createVoucher,
    getAllVouchers,
    getMyVouchers,
    deleteVoucher
};
