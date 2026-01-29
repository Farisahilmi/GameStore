const prisma = require('../utils/prisma');
const activityService = require('../services/activityService');

const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: {
        game: {
          include: {
            categories: true
          }
        }
      }
    });

    // Calculate final prices for games in wishlist (handling null/undefined issues)
    const formattedWishlist = wishlist.map(item => {
        const game = item.game;
        // Ensure price is treated as number
        const price = Number(game.price);
        const discount = game.discount || 0;
        const finalPrice = price - (price * (discount / 100));
        
        return {
            ...item,
            game: {
                ...game,
                originalPrice: price,
                finalPrice: finalPrice,
                discountTotal: discount,
                activeSaleName: null // Wishlist controller doesn't seem to join with sales yet, but GameCard expects this structure
            }
        };
    });

    res.status(200).json({
      success: true,
      data: formattedWishlist
    });
  } catch (error) {
    next(error);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const { gameId } = req.body;
    
    // Check if game exists
    const game = await prisma.game.findUnique({
      where: { id: parseInt(gameId) }
    });

    if (!game) {
      const error = new Error('Game not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if already in wishlist
    const exists = await prisma.wishlist.findUnique({
      where: {
        userId_gameId: {
          userId: req.user.id,
          gameId: parseInt(gameId)
        }
      }
    });

    if (exists) {
      return res.status(200).json({
        success: true,
        message: 'Game already in wishlist',
        data: exists
      });
    }

    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: req.user.id,
        gameId: parseInt(gameId)
      },
      include: {
        game: true
      }
    });

    // Log Activity
    await activityService.logActivity(
        req.user.id,
        'WISHLIST',
        `added ${game.title} to their wishlist`,
        { gameId: game.id }
    );

    res.status(201).json({
      success: true,
      data: wishlistItem
    });
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const { gameId } = req.params;

    // Use deleteMany to avoid error if not found (or check first)
    // But since we have unique constraint, delete is fine if we have the ID.
    // However, the param is gameId, not wishlist ID.
    
    const result = await prisma.wishlist.deleteMany({
      where: {
        userId: req.user.id,
        gameId: parseInt(gameId)
      }
    });

    if (result.count === 0) {
      const error = new Error('Game not found in wishlist');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Removed from wishlist'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
