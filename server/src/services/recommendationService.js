const prisma = require('../utils/prisma');

const getRecommendations = async (userId) => {
  // 1. Get user's library
  const library = await prisma.library.findMany({
    where: { userId },
    include: {
      game: {
        include: { categories: true }
      }
    }
  });

  const ownedGameIds = library.map(l => l.gameId);

  // 2. If library is empty, recommend top rated games
  if (library.length === 0) {
    const topGames = await prisma.game.findMany({
      take: 10,
      include: {
        categories: true,
        reviews: true
      }
    });
    
    // Sort by avg rating manually for now
    const gamesWithRating = topGames.map(g => {
        const avg = g.reviews.length > 0 
            ? g.reviews.reduce((acc, r) => acc + r.rating, 0) / g.reviews.length 
            : 0;
        return { ...g, avgRating: avg };
    }).sort((a, b) => b.avgRating - a.avgRating);

    return gamesWithRating.slice(0, 6);
  }

  // 3. Extract categories from library
  const categoryCounts = {};
  library.forEach(l => {
    l.game.categories.forEach(cat => {
      categoryCounts[cat.name] = (categoryCounts[cat.name] || 0) + 1;
    });
  });

  // Sort categories by count
  const sortedCategories = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]);
  const topCategories = sortedCategories.slice(0, 3);

  // 4. Find games in these categories that user doesn't own
  const recommendedGames = await prisma.game.findMany({
    where: {
      id: { notIn: ownedGameIds },
      categories: {
        some: {
          name: { in: topCategories }
        }
      }
    },
    take: 6,
    include: {
      categories: true,
      publisher: {
        select: { name: true }
      }
    }
  });

  return recommendedGames;
};

const getDiscoveryQueue = async (userId) => {
    // 1. Get owned game IDs
    const library = await prisma.library.findMany({
        where: { userId },
        select: { gameId: true }
    });
    const ownedGameIds = library.map(l => l.gameId);

    // 2. Get 10 random games user doesn't own
    // In SQLite, we can use ORDER BY RANDOM()
    const discoveryQueue = await prisma.game.findMany({
        where: {
            id: { notIn: ownedGameIds }
        },
        take: 12,
        include: {
            categories: true,
            publisher: { select: { name: true } },
            reviews: { select: { rating: true } }
        },
        // We can't easily do random in Prisma findMany, so we get more and shuffle
        // Or use raw query if needed. Let's just take a batch and shuffle.
    });

    // Shuffle and format
    const shuffled = discoveryQueue
        .sort(() => 0.5 - Math.random())
        .slice(0, 10)
        .map(g => {
            const avgRating = g.reviews.length > 0 
                ? g.reviews.reduce((acc, r) => acc + r.rating, 0) / g.reviews.length 
                : 0;
            return { ...g, avgRating, reviewCount: g.reviews.length };
        });

    return shuffled;
};

module.exports = {
  getRecommendations,
  getDiscoveryQueue
};
