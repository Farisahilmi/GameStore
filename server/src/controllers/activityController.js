const prisma = require('../utils/prisma');

const getActivities = async (req, res, next) => {
    try {
        const activities = await prisma.activity.findMany({
            where: {
                type: {
                    in: ['REVIEW', 'GAME_PUBLISHED', 'SALE_START'] // Only safe/public types
                }
            },
            include: {
                user: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        res.status(200).json({
            success: true,
            data: activities
        });
    } catch (error) {
        next(error);
    }
};

const getFriendActivities = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get friend IDs
        const friends = await prisma.friend.findMany({
            where: {
                OR: [
                    { userId, status: 'ACCEPTED' },
                    { friendId: userId, status: 'ACCEPTED' }
                ]
            }
        });

        const friendIds = friends.map(f => f.userId === userId ? f.friendId : f.userId);
        
        // Include self
        const userIds = [...friendIds, userId];

        const activities = await prisma.activity.findMany({
            where: {
                userId: { in: userIds }
            },
            include: {
                user: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 30
        });

        res.status(200).json({
            success: true,
            data: activities
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getActivities,
    getFriendActivities
};
