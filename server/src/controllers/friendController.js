const prisma = require('../utils/prisma');

const sendFriendRequest = async (req, res, next) => {
    try {
        const { friendId } = req.body;
        const userId = req.user.id;

        if (userId === parseInt(friendId)) {
            const error = new Error('You cannot add yourself as a friend');
            error.statusCode = 400;
            throw error;
        }

        // Check if friend exists
        const friend = await prisma.user.findUnique({
            where: { id: parseInt(friendId) }
        });

        if (!friend) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        // Check if already friends or pending
        const existing = await prisma.friend.findFirst({
            where: {
                OR: [
                    { userId, friendId: parseInt(friendId) },
                    { userId: parseInt(friendId), friendId: userId }
                ]
            }
        });

        if (existing) {
            const error = new Error('Friend request already exists or you are already friends');
            error.statusCode = 400;
            throw error;
        }

        const friendRequest = await prisma.friend.create({
            data: {
                userId,
                friendId: parseInt(friendId),
                status: 'PENDING'
            }
        });

        res.status(201).json({
            success: true,
            data: friendRequest,
            message: 'Friend request sent'
        });
    } catch (error) {
        next(error);
    }
};

const acceptFriendRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const userId = req.user.id;

        const request = await prisma.friend.findUnique({
            where: { id: parseInt(requestId) }
        });

        if (!request || request.friendId !== userId) {
            const error = new Error('Friend request not found or not for you');
            error.statusCode = 404;
            throw error;
        }

        const updated = await prisma.friend.update({
            where: { id: parseInt(requestId) },
            data: { status: 'ACCEPTED' }
        });

        // Log activity
        await prisma.activity.create({
            data: {
                userId: request.userId,
                type: 'FRIEND_ACCEPTED',
                message: `became friends with ${req.user.name}`,
                metadata: JSON.stringify({ friendId: userId })
            }
        });

        await prisma.activity.create({
            data: {
                userId: userId,
                type: 'FRIEND_ACCEPTED',
                message: `became friends with someone`, // Ideally get requester name
                metadata: JSON.stringify({ friendId: request.userId })
            }
        });

        res.status(200).json({
            success: true,
            data: updated,
            message: 'Friend request accepted'
        });
    } catch (error) {
        next(error);
    }
};

const getFriends = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const friends = await prisma.friend.findMany({
            where: {
                OR: [
                    { userId, status: 'ACCEPTED' },
                    { friendId: userId, status: 'ACCEPTED' }
                ]
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true }
                },
                friend: {
                    select: { id: true, name: true, email: true, role: true }
                }
            }
        });

        // Flatten the list
        const flattened = friends.map(f => {
            return f.userId === userId ? f.friend : f.user;
        });

        res.status(200).json({
            success: true,
            data: flattened
        });
    } catch (error) {
        next(error);
    }
};

const getPendingRequests = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const requests = await prisma.friend.findMany({
            where: {
                friendId: userId,
                status: 'PENDING'
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        res.status(200).json({
            success: true,
            data: requests
        });
    } catch (error) {
        next(error);
    }
};

const removeFriend = async (req, res, next) => {
    try {
        const { friendId } = req.params;
        const userId = req.user.id;

        await prisma.friend.deleteMany({
            where: {
                OR: [
                    { userId, friendId: parseInt(friendId) },
                    { userId: parseInt(friendId), friendId: userId }
                ]
            }
        });

        res.status(200).json({
            success: true,
            message: 'Friend removed'
        });
    } catch (error) {
        next(error);
    }
};

const searchUsers = async (req, res, next) => {
    try {
        const { q } = req.query;
        const userId = req.user.id;

        const users = await prisma.user.findMany({
            where: {
                name: { contains: q },
                id: { not: userId }
            },
            select: { id: true, name: true, email: true, role: true },
            take: 10
        });

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendFriendRequest,
    acceptFriendRequest,
    getFriends,
    getPendingRequests,
    removeFriend,
    searchUsers
};
