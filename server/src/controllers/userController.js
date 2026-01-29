const prisma = require('../utils/prisma');

const upgradeToPublisher = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check if user is already a publisher or admin
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (user.role === 'PUBLISHER' || user.role === 'ADMIN') {
        const error = new Error('User is already a publisher or admin');
        error.statusCode = 400;
        throw error;
    }

    // In a real app, we would process payment here.
    // For now, we assume the dummy payment on frontend was successful.

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: 'PUBLISHER' }
    });

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Successfully upgraded to Publisher!'
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

const updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['USER', 'PUBLISHER', 'ADMIN'].includes(role)) {
            const error = new Error('Invalid role');
            error.statusCode = 400;
            throw error;
        }

        // Prevent modifying own role to avoid locking oneself out (optional but good practice)
        if (parseInt(id) === req.user.id) {
             const error = new Error('You cannot change your own role');
             error.statusCode = 403;
             throw error;
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { role }
        });

        res.status(200).json({
            success: true,
            data: updatedUser,
            message: `User role updated to ${role}`
        });
    } catch (error) {
        next(error);
    }
};

const deleteAccount = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Transaction to delete everything related to user
        await prisma.$transaction(async (prisma) => {
            // 1. Delete Wishlist items
            await prisma.wishlist.deleteMany({ where: { userId } });
            
            // 2. Delete Library items
            await prisma.library.deleteMany({ where: { userId } });
            
            // 3. Delete Reviews & Votes
            // Delete votes by user
            await prisma.reviewVote.deleteMany({ where: { userId } });
            // Delete reviews by user (cascade votes on those reviews if needed, but we don't have cascade in schema)
            // So we need to find reviews by user, delete their votes, then delete reviews.
            const userReviews = await prisma.review.findMany({ where: { userId }, select: { id: true } });
            const reviewIds = userReviews.map(r => r.id);
            if (reviewIds.length > 0) {
                await prisma.reviewVote.deleteMany({ where: { reviewId: { in: reviewIds } } });
                await prisma.review.deleteMany({ where: { userId } });
            }

            // 4. Delete Notifications
            await prisma.notification.deleteMany({ where: { userId } });

            // 5. Delete DevProject Comments
            await prisma.devProjectComment.deleteMany({ where: { userId } });

            // 6. Delete Transactions (Might want to keep for records, but for GDPR "delete account" usually means delete)
            // For this app, let's delete.
            // Transaction has many-to-many with Game (implicit). Prisma handles implicit table cleanup usually.
            await prisma.transaction.deleteMany({ where: { userId } });

            // 7. Handle Follows
            await prisma.follow.deleteMany({ where: { userId } }); // User following others
            await prisma.follow.deleteMany({ where: { publisherId: userId } }); // Others following user

            // 8. Handle Published Games & Projects (If publisher)
            // Option: Delete them, or set publisher to null. Let's delete for now to be clean.
            // Delete Projects
            const projects = await prisma.devProject.findMany({ where: { publisherId: userId }, select: { id: true } });
            const projectIds = projects.map(p => p.id);
            if (projectIds.length > 0) {
                await prisma.devProjectComment.deleteMany({ where: { projectId: { in: projectIds } } });
                await prisma.devProject.deleteMany({ where: { publisherId: userId } });
            }
            
            // Delete Games (Tricky, might be in others' libraries/wishlists)
            // If we delete games, we break others' libraries if no cascade.
            // Ideally, we keep the game but set publisherId = null (Ghost Publisher).
            await prisma.game.updateMany({
                where: { publisherId: userId },
                data: { publisherId: null }
            });

            // 9. Finally, delete User
            await prisma.user.delete({ where: { id: userId } });
        });

        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

const getUserProfile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user ? req.user.id : null;

        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });

        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        const library = await prisma.library.findMany({
            where: { userId: parseInt(id) },
            include: {
                game: {
                    include: {
                        categories: true
                    }
                }
            }
        });

        let friendStatus = null;
        if (currentUserId && currentUserId !== parseInt(id)) {
            const friendship = await prisma.friend.findFirst({
                where: {
                    OR: [
                        { userId: currentUserId, friendId: parseInt(id) },
                        { userId: parseInt(id), friendId: currentUserId }
                    ]
                }
            });
            if (friendship) {
                friendStatus = friendship.status;
            }
        }

        res.status(200).json({
            success: true,
            data: {
                user,
                library,
                friendStatus
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
  upgradeToPublisher,
  getProfile,
  getAllUsers,
  updateUserRole,
  deleteAccount,
  getUserProfile
};
