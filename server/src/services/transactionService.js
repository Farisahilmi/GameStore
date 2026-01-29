const prisma = require('../utils/prisma');

const createTransaction = async (userId, gameIds, recipientId = null) => {
  if (!gameIds || gameIds.length === 0) {
    const error = new Error('No games selected');
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
    }
  });

  const saleDiscount = activeSale ? activeSale.discountPercent : 0;
  
  const total = games.reduce((sum, game) => {
    const publisherDiscount = game.discount || 0;
    const totalDiscount = Math.min(100, publisherDiscount + saleDiscount);
    const finalPrice = parseFloat(game.price) * (1 - totalDiscount / 100);
    return sum + finalPrice;
  }, 0);

  // 4. Create Transaction and Library entries in a transaction
  const result = await prisma.$transaction(async (prisma) => {
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
    where: { userId },
    include: {
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
