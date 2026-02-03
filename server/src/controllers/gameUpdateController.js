const prisma = require('../utils/prisma');

const createUpdate = async (req, res, next) => {
    try {
        const { gameId, title, content, version, type } = req.body;
        const userId = req.user.id;

        // Check if game exists and user is the publisher
        const game = await prisma.game.findUnique({
            where: { id: parseInt(gameId) }
        });

        if (!game) {
            const error = new Error('Game not found');
            error.statusCode = 404;
            throw error;
        }

        if (game.publisherId !== userId && req.user.role !== 'ADMIN') {
            const error = new Error('Not authorized to update this game');
            error.statusCode = 403;
            throw error;
        }

        const update = await prisma.gameUpdate.create({
            data: {
                gameId: parseInt(gameId),
                title,
                content,
                version,
                type: type || 'UPDATE'
            },
            include: { game: { include: { publisher: { select: { id: true, name: true } } } } }
        });

        // Notify followers
        try {
            const followers = await prisma.follow.findMany({
                where: { publisherId: update.game.publisherId },
                select: { userId: true }
            });

            if (followers.length > 0) {
                await prisma.notification.createMany({
                    data: followers.map(f => ({
                        userId: f.userId,
                        type: 'GAME_UPDATE',
                        message: `${update.game.publisher.name} has posted a new update for ${update.game.title}: ${update.title}!`
                    }))
                });
            }
        } catch (err) {
            console.error('Failed to send game update notifications', err);
        }

        res.status(201).json({
            success: true,
            data: update,
            message: 'Game update posted'
        });
    } catch (error) {
        next(error);
    }
};

const getGameUpdates = async (req, res, next) => {
    try {
        const { gameId } = req.params;

        const updates = await prisma.gameUpdate.findMany({
            where: { gameId: parseInt(gameId) },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({
            success: true,
            data: updates
        });
    } catch (error) {
        next(error);
    }
};

const deleteUpdate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const update = await prisma.gameUpdate.findUnique({
            where: { id: parseInt(id) },
            include: { game: true }
        });

        if (!update) {
            const error = new Error('Update not found');
            error.statusCode = 404;
            throw error;
        }

        if (update.game.publisherId !== userId && req.user.role !== 'ADMIN') {
            const error = new Error('Not authorized to delete this update');
            error.statusCode = 403;
            throw error;
        }

        await prisma.gameUpdate.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json({
            success: true,
            message: 'Update deleted'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createUpdate,
    getGameUpdates,
    deleteUpdate
};
