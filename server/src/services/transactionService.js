const prisma = require('../utils/prisma');

const createTransaction = async (userId, gameIds, recipientId = null, paymentMethod = 'CREDIT_CARD', voucherCode = null) => {
  if (!gameIds || gameIds.length === 0) {
    const error = new Error('No games selected');
    error.statusCode = 400;
    throw error;
  }

  if (recipientId && parseInt(recipientId) === userId) {
    const error = new Error('You cannot send a gift to yourself');
    error.statusCode = 400;
    throw error;
  }

  const targetUserId = recipientId ? parseInt(recipientId) : userId;

  // 1. Fetch games to calculate total and verify existence
  const games = await prisma.game.findMany({
    where: {
      id: { in: gameIds }
    }
  });

  if (games.length !== gameIds.length) {
    const error = new Error('One or more games not found');
    error.statusCode = 404;
    throw error;
  }

  // 2. Check if user already owns any of these games
  const existingLibrary = await prisma.library.findMany({
    where: {
      userId: targetUserId,
      gameId: { in: gameIds }
    }
  });

  if (existingLibrary.length > 0) {
    const ownedGameIds = existingLibrary.map(l => l.gameId);
    const error = new Error(`${recipientId ? 'Friend' : 'User'} already owns games with IDs: ${ownedGameIds.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  // 3. Calculate total with discounts
  const now = new Date();
  const activeSale = await prisma.saleEvent.findFirst({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now }
    },
    orderBy: {
      discountPercent: 'desc' // Prioritize highest discount if multiple active
    }
  });

  const saleDiscount = activeSale ? activeSale.discountPercent : 0;
  
  let subtotal = games.reduce((sum, game) => {
    const publisherDiscount = game.discount || 0;
    // Calculate total discount, capped at 100%
    const totalDiscount = Math.min(100, publisherDiscount + saleDiscount);
    
    // Convert Decimal to number for calculation
    const basePrice = Number(game.price.toString());
    const finalPrice = basePrice * (1 - totalDiscount / 100);
    
    // Ensure 2 decimal places precision
    return sum + Number(finalPrice.toFixed(2));
  }, 0);

  let voucherData = null;
  if (voucherCode) {
    const vCode = voucherCode.toUpperCase();
    voucherData = await prisma.voucher.findUnique({ where: { code: vCode } });
    if (!voucherData || !voucherData.isActive || now > new Date(voucherData.expiryDate) || voucherData.usedCount >= voucherData.maxUses) {
        const error = new Error('Invalid or expired voucher');
        error.statusCode = 400;
        throw error;
    }
    
    // Preliminary check (will be re-verified inside transaction)
    const usage = await prisma.voucherUsage.findUnique({
        where: {
            voucherId_userId: {
                voucherId: voucherData.id,
                userId
            }
        }
    });

    if (usage) {
        const error = new Error('You have already used this voucher');
        error.statusCode = 400;
        throw error;
    }
    
    subtotal = subtotal * (1 - voucherData.discountPercent / 100);
  }

  const total = Math.max(0, Number(subtotal.toFixed(2)));

  // 4. Create Transaction and Library entries in a transaction
  const result = await prisma.$transaction(async (prisma) => {
    // Re-verify Voucher inside transaction
    if (voucherData) {
        const v = await prisma.voucher.findUnique({ 
            where: { id: voucherData.id }
        });

        if (v.usedCount >= v.maxUses) {
            const error = new Error('Voucher usage limit reached');
            error.statusCode = 400;
            throw error;
        }

        const usage = await prisma.voucherUsage.findUnique({
            where: {
                voucherId_userId: {
                    voucherId: v.id,
                    userId
                }
            }
        });

        if (usage) {
            const error = new Error('You have already used this voucher');
            error.statusCode = 400;
            throw error;
        }

        await prisma.voucher.update({
            where: { id: v.id },
            data: { usedCount: { increment: 1 } }
        });
        await prisma.voucherUsage.create({
            data: {
                voucherId: v.id,
                userId
            }
        });
    }

    // Handle Wallet Payment
    if (paymentMethod === 'WALLET') {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (Number(user.walletBalance) < total) {
            const error = new Error('Insufficient wallet balance');
            error.statusCode = 400;
            throw error;
        }
        await prisma.user.update({
            where: { id: userId },
            data: { walletBalance: { decrement: total } }
        });
    }

    // Create Transaction Record
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        recipientId: recipientId ? parseInt(recipientId) : null,
        total,
        status: 'SUCCESS',
        games: {
          connect: gameIds.map(id => ({ id }))
        }
      },
      include: {
        games: true,
        recipient: { select: { name: true } }
      }
    });

    // Award Loyalty Points to Buyer
    const pointsToAward = games.reduce((sum, game) => sum + (game.pointsAwarded || 0), 0);
    if (pointsToAward > 0) {
        await prisma.user.update({
            where: { id: userId },
            data: { loyaltyPoints: { increment: pointsToAward } }
        });
    }

    // Add to target User's Library
    await prisma.library.createMany({
      data: gameIds.map(gameId => ({
        userId: targetUserId,
        gameId
      }))
    });

    return transaction;
  });

  return result;
};

const getUserTransactions = async (userId) => {
  const transactions = await prisma.transaction.findMany({
    where: { 
      OR: [
        { userId },
        { recipientId: userId }
      ]
    },
    include: {
      user: { select: { name: true } },
      recipient: { select: { name: true } },
      games: {
        select: {
          id: true,
          title: true,
          price: true,
          imageUrl: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return transactions;
};

const getAllTransactions = async () => {
  const transactions = await prisma.transaction.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      games: {
        select: {
          id: true,
          title: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return transactions;
};

module.exports = {
  createTransaction,
  getUserTransactions,
  getAllTransactions
};
