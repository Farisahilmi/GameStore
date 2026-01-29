const prisma = require('../utils/prisma');

const getPublisherProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const publisher = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        publishedGames: {
          include: { 
            categories: true,
            reviews: {
                select: { rating: true }
            }
          }
        }
      }
    });

    if (!publisher || publisher.role !== 'PUBLISHER') {
      const error = new Error('Publisher not found');
      error.statusCode = 404;
      throw error;
    }

    // Enrich games with ratings
    const gamesWithRatings = publisher.publishedGames.map(game => {
        const avgRating = game.reviews.length > 0 
            ? game.reviews.reduce((acc, r) => acc + r.rating, 0) / game.reviews.length 
            : 0;
        return { ...game, avgRating };
    });

    res.status(200).json({
      success: true,
      data: {
        ...publisher,
        publishedGames: gamesWithRatings
      }
    });
  } catch (error) {
    next(error);
  }
};

const getPublisherStats = async (req, res, next) => {
  try {
    const publisherId = req.user.id;

    const games = await prisma.game.findMany({
      where: { publisherId },
      include: {
        _count: {
          select: { transactions: true, reviews: true }
        }
      }
    });

    const gameIds = games.map(g => g.id);
    
    const transactions = await prisma.transaction.findMany({
      where: {
        games: {
          some: {
            id: { in: gameIds }
          }
        }
      },
      include: {
        games: {
          where: { id: { in: gameIds } }
        }
      }
    });

    let totalRevenue = 0;
    let totalSales = 0;
    
    transactions.forEach(t => {
      t.games.forEach(g => {
        totalRevenue += Number(g.price); 
        totalSales += 1;
      });
    });

    res.status(200).json({
      success: true,
      data: {
        gamesCount: games.length,
        totalSales,
        totalRevenue,
        games: games.map(g => ({
          id: g.id,
          title: g.title,
          price: g.price,
          discount: g.discount,
          salesCount: g._count.transactions,
          reviewCount: g._count.reviews
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublisherProfile,
  getPublisherStats
};
