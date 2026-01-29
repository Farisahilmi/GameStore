const prisma = require('../utils/prisma');

const toggleFollow = async (req, res, next) => {
  try {
    const { publisherId } = req.params;
    const userId = req.user.id;

    if (parseInt(publisherId) === userId) {
        const error = new Error('You cannot follow yourself');
        error.statusCode = 400;
        throw error;
    }

    // Check if publisher exists and is actually a publisher
    const publisher = await prisma.user.findUnique({
        where: { id: parseInt(publisherId) }
    });

    if (!publisher || (publisher.role !== 'PUBLISHER' && publisher.role !== 'ADMIN')) {
        const error = new Error('Publisher not found');
        error.statusCode = 404;
        throw error;
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        userId_publisherId: {
          userId,
          publisherId: parseInt(publisherId)
        }
      }
    });

    if (existingFollow) {
      await prisma.follow.delete({
        where: { id: existingFollow.id }
      });
      return res.status(200).json({ success: true, message: 'Unfollowed successfully', following: false });
    } else {
      await prisma.follow.create({
        data: {
          userId,
          publisherId: parseInt(publisherId)
        }
      });
      return res.status(201).json({ success: true, message: 'Followed successfully', following: true });
    }
  } catch (error) {
    next(error);
  }
};

const getFollowingStatus = async (req, res, next) => {
    try {
        const { publisherId } = req.params;
        const userId = req.user.id;

        const follow = await prisma.follow.findUnique({
            where: {
                userId_publisherId: {
                    userId,
                    publisherId: parseInt(publisherId)
                }
            }
        });

        res.status(200).json({ success: true, following: !!follow });
    } catch (error) {
        next(error);
    }
};

const getMyFollowing = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const following = await prisma.follow.findMany({
            where: { userId },
            include: {
                publisher: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.status(200).json({ success: true, data: following });
    } catch (error) {
        next(error);
    }
};

module.exports = {
  toggleFollow,
  getFollowingStatus,
  getMyFollowing
};
