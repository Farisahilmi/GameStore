const prisma = require('../utils/prisma');

const getActiveSaleEvent = async () => {
  const now = new Date();
  return await prisma.saleEvent.findFirst({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now }
    }
  });
};

const calculateFinalPrice = (originalPrice, publisherDiscount, saleEventDiscount = 0) => {
  const totalDiscount = Math.min(100, (publisherDiscount || 0) + (saleEventDiscount || 0));
  const finalPrice = parseFloat(originalPrice) * (1 - totalDiscount / 100);
  return {
    originalPrice: parseFloat(originalPrice),
    finalPrice: parseFloat(finalPrice.toFixed(2)),
    discountTotal: totalDiscount,
    isFree: finalPrice <= 0
  };
};

const attachGameMetadata = async (games, activeSale = null) => {
  const isArray = Array.isArray(games);
  const gameList = isArray ? games : [games];

  if (!activeSale) {
    activeSale = await getActiveSaleEvent();
  }

  const enrichedGames = await Promise.all(gameList.map(async (game) => {
    // 1. Calculate Ratings
    const aggregations = await prisma.review.aggregate({
      where: { gameId: game.id },
      _avg: { rating: true },
      _count: { id: true }
    });

    // 2. Calculate Price
    const priceInfo = calculateFinalPrice(
      game.price, 
      game.discount, 
      activeSale ? activeSale.discountPercent : 0
    );

    return {
      ...game,
      avgRating: aggregations._avg.rating || 0,
      reviewCount: aggregations._count.id,
      ...priceInfo,
      activeSaleName: activeSale ? activeSale.name : null
    };
  }));

  return isArray ? enrichedGames : enrichedGames[0];
};

const getAllGames = async (query) => {
  const { search, category, minPrice, maxPrice, sort, page = 1, limit = 10, publisherId } = query;
  
  const where = {};

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (category) {
    where.categories = {
      some: {
        name: category
      }
    };
  }

  if (publisherId) {
    where.publisherId = parseInt(publisherId);
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  let orderBy = { createdAt: 'desc' }; // Default
  if (sort) {
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'name_asc') orderBy = { title: 'asc' };
    else if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };
    else if (sort === 'rating_desc') {
        // We can't sort by aggregated field directly in prisma.findMany easily for now
        // Usually we would use a raw query or denormalize the rating.
        // For simplicity, we'll keep the current sort and maybe sort in memory if limit is small,
        // but that's not scalable. Let's stick to these for now.
    }
  }

  const games = await prisma.game.findMany({
    where,
    skip,
    take,
    include: {
      categories: true,
      publisher: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy
  });

  const enrichedGames = await attachGameMetadata(games);
  const total = await prisma.game.count({ where });

  return {
    games: enrichedGames,
    meta: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getGameById = async (id) => {
  const game = await prisma.game.findUnique({
    where: { id: parseInt(id) },
    include: {
      categories: true,
      screenshots: true,
      publisher: {
        select: {
          id: true,
          name: true
        }
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!game) {
    const error = new Error('Game not found');
    error.statusCode = 404;
    throw error;
  }

  return await attachGameMetadata(game);
};

const createGame = async (data, publisherId) => {
  const { 
    title, description, price, discount, imageUrl, releaseDate, 
    categoryNames, screenshots, isEarlyAccess, contentRating,
    minRequirements, recRequirements, socialLinks, pointsAwarded, flashSaleEnd 
  } = data;

  // Prepare category connections or creations
  let categoriesConnect = [];
  if (categoryNames && categoryNames.length > 0) {
    categoriesConnect = categoryNames.map(name => ({
      where: { name },
      create: { name }
    }));
  }

  const game = await prisma.game.create({
    data: {
      title,
      description,
      price,
      discount: discount || 0,
      imageUrl,
      releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
      publisherId,
      isEarlyAccess: isEarlyAccess || false,
      contentRating: contentRating || 'EVERYONE',
      minRequirements,
      recRequirements,
      socialLinks,
      pointsAwarded: pointsAwarded || 0,
      flashSaleEnd: flashSaleEnd ? new Date(flashSaleEnd) : null,
      categories: {
        connectOrCreate: categoriesConnect
      },
      screenshots: screenshots ? {
          create: screenshots.map(url => ({ url }))
      } : undefined
    },
    include: {
      categories: true,
      screenshots: true,
      publisher: { select: { id: true, name: true } }
    }
  });

  // Notify followers
  try {
    const followers = await prisma.follow.findMany({
      where: { publisherId },
      select: { userId: true }
    });

    if (followers.length > 0) {
      await prisma.notification.createMany({
        data: followers.map(f => ({
          userId: f.userId,
          type: 'NEW_GAME',
          message: `${game.publisher.name} has released a new game: ${game.title}!`
        }))
      });
    }
  } catch (err) {
    console.error('Failed to send new game notifications', err);
  }

  return await attachGameMetadata(game);
};

const updateGame = async (id, data, userId, userRole) => {
  const game = await prisma.game.findUnique({ where: { id: parseInt(id) } });

  if (!game) {
    const error = new Error('Game not found');
    error.statusCode = 404;
    throw error;
  }

  // Only Publisher (owner) or Admin can update
  if (userRole !== 'ADMIN' && game.publisherId !== userId) {
    const error = new Error('Forbidden: You are not the owner of this game');
    error.statusCode = 403;
    throw error;
  }

  const { 
    title, description, price, discount, imageUrl, releaseDate, 
    categoryNames, screenshots, isEarlyAccess, contentRating,
    minRequirements, recRequirements, socialLinks, pointsAwarded, flashSaleEnd 
  } = data;
  
  const updateData = {
    title,
    description,
    price,
    discount,
    imageUrl,
    releaseDate: releaseDate ? new Date(releaseDate) : undefined,
    isEarlyAccess,
    contentRating,
    minRequirements,
    recRequirements,
    socialLinks,
    pointsAwarded,
    flashSaleEnd: flashSaleEnd !== undefined ? (flashSaleEnd ? new Date(flashSaleEnd) : null) : undefined
  };

  // If categories are updated
  if (categoryNames) {
      updateData.categories = {
          set: [], // Clear existing relations
          connectOrCreate: categoryNames.map(name => ({
            where: { name },
            create: { name }
          }))
      };
  }

  // If screenshots are updated
  if (screenshots) {
      updateData.screenshots = {
          deleteMany: {}, // Clear existing
          create: screenshots.map(url => ({ url }))
      };
  }

  const updatedGame = await prisma.game.update({
    where: { id: parseInt(id) },
    data: updateData,
    include: {
      categories: true,
      screenshots: true
    }
  });

  return await attachGameMetadata(updatedGame);
};

const deleteGame = async (id, userId, userRole) => {
  const gameId = parseInt(id);
  const game = await prisma.game.findUnique({ where: { id: gameId } });

  if (!game) {
    const error = new Error('Game not found');
    error.statusCode = 404;
    throw error;
  }

  if (userRole !== 'ADMIN' && game.publisherId !== userId) {
    const error = new Error('Forbidden: You are not the owner of this game');
    error.statusCode = 403;
    throw error;
  }

  // Use transaction to delete related records first to avoid Foreign Key constraint errors
  await prisma.$transaction(async (tx) => {
      // 1. Delete explicit relations
      await tx.library.deleteMany({ where: { gameId } });
      await tx.wishlist.deleteMany({ where: { gameId } });
      await tx.review.deleteMany({ where: { gameId } });
      
      // 2. Implicit relations (Transactions)
      // Note: Deleting a game that has transactions is usually bad practice for audit,
      // but for this project we'll allow it. Prisma implicit m-n handles the join table deletion automatically.
      // However, if we had explicit TransactionItem model, we would need to delete it here.
      // Since it's implicit Game[] in Transaction, we don't need to do anything extra for the join table.
      
      // 3. Delete the game
      await tx.game.delete({ where: { id: gameId } });
  });

  return { message: 'Game deleted successfully' };
};

module.exports = {
  getAllGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame
};
