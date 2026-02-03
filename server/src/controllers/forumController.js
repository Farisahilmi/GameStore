const prisma = require('../utils/prisma');

const createPost = async (req, res, next) => {
    try {
        const { title, content, type, gameId } = req.body;
        const post = await prisma.forumPost.create({
            data: {
                title,
                content,
                type: type || 'DISCUSSION',
                gameId: gameId ? parseInt(gameId) : null,
                userId: req.user.id
            },
            include: { user: { select: { name: true } } }
        });
        res.status(201).json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
};

const getPosts = async (req, res, next) => {
    try {
        const { gameId, type } = req.query;
        const where = {};
        if (gameId) where.gameId = parseInt(gameId);
        if (type) where.type = type;

        const posts = await prisma.forumPost.findMany({
            where,
            include: {
                user: { select: { name: true } },
                game: { select: { title: true } },
                _count: { select: { comments: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: posts });
    } catch (error) {
        next(error);
    }
};

const getPostDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = await prisma.forumPost.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: { select: { name: true } },
                game: { select: { title: true } },
                comments: {
                    include: { user: { select: { name: true } } },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
        if (!post) {
            const error = new Error('Post not found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
};

const createComment = async (req, res, next) => {
    try {
        const { id } = req.params; // postId
        const { content } = req.body;
        const comment = await prisma.forumComment.create({
            data: {
                content,
                postId: parseInt(id),
                userId: req.user.id
            },
            include: { user: { select: { name: true } } }
        });
        res.status(201).json({ success: true, data: comment });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPost,
    getPosts,
    getPostDetails,
    createComment
};