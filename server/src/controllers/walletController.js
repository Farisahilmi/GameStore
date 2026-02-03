const prisma = require('../utils/prisma');

const topUpWallet = async (req, res, next) => {
    try {
        const { amount } = req.body;
        const userId = req.user.id;

        if (!amount || amount < 1) {
            const error = new Error('Minimum top-up amount is $1.00');
            error.statusCode = 400;
            throw error;
        }

        // Create transaction
        const transaction = await prisma.transaction.create({
            data: {
                userId,
                total: amount,
                status: 'COMPLETED',
                type: 'TOPUP'
            }
        });

        // Update user balance
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                walletBalance: {
                    increment: amount
                }
            }
        });

        res.status(200).json({
            success: true,
            data: {
                balance: user.walletBalance,
                transaction
            },
            message: 'Wallet topped up successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    topUpWallet
};