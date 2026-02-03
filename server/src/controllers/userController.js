const prisma = require('../utils/prisma');
const userService = require('../services/userService');

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
            select: { id: true, name: true, email: true, role: true, theme: true, walletBalance: true, bio: true, createdAt: true }
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

        // Cascade deletes will handle most relations defined in schema.prisma
        await prisma.user.delete({ where: { id: userId } });

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
            select: { 
                id: true, 
                name: true, 
                email: true, 
                role: true, 
                bio: true, 
                createdAt: true,
                status: true,
                statusMessage: true,
                _count: {
                    select: {
                        forumPosts: true,
                        forumComments: true,
                        reviews: true
                    }
                }
            }
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

        // Fetch user's friends list
        const userFriends = await prisma.friend.findMany({
            where: {
                OR: [
                    { userId: parseInt(id), status: 'ACCEPTED' },
                    { friendId: parseInt(id), status: 'ACCEPTED' }
                ]
            },
            include: {
                user: { select: { id: true, name: true, role: true, status: true } },
                friend: { select: { id: true, name: true, role: true, status: true } }
            }
        });

        const friends = userFriends.map(f => {
            return f.userId === parseInt(id) ? f.friend : f.user;
        });

        res.status(200).json({
            success: true,
            data: {
                user,
                library,
                friendStatus,
                friends
            }
        });
    } catch (error) {
        next(error);
    }
};

const updateTheme = async (req, res, next) => {
    try {
        const { theme } = req.body;
        const userId = req.user.id;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { theme },
            select: { id: true, name: true, email: true, role: true, theme: true, walletBalance: true, createdAt: true }
        });

        res.status(200).json({
            success: true,
            data: updatedUser,
            message: 'Theme updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const { name, bio } = req.body;
        const userId = req.user.id;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name, bio },
            select: { id: true, name: true, email: true, role: true, theme: true, walletBalance: true, bio: true, createdAt: true }
        });

        res.status(200).json({
            success: true,
            data: updatedUser,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

const updateStatus = async (req, res, next) => {
    try {
        const { status, statusMessage } = req.body;
        await userService.updateStatus(req.user.id, status, statusMessage);
        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
};

const heartbeat = async (req, res, next) => {
    try {
        await userService.getHeartbeat(req.user.id);
        res.status(200).json({ success: true });
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
  getUserProfile,
  updateTheme,
  updateProfile,
  updateStatus,
  heartbeat
};
