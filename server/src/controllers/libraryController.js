const prisma = require('../utils/prisma');

const getMyLibrary = async (req, res, next) => {
  try {
    const library = await prisma.library.findMany({
      where: { userId: req.user.id },
      include: {
        game: {
          include: {
            categories: true,
            publisher: {
                select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: library.map(l => ({
        ...l.game,
        purchaseDate: l.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

const removeFromLibrary = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    
    await prisma.library.delete({
      where: {
        userId_gameId: {
          userId: req.user.id,
          gameId: parseInt(gameId)
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Game removed from library'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyLibrary,
  removeFromLibrary
};
