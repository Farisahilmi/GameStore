const prisma = require('../utils/prisma');
const notificationService = require('../services/notificationService');
const activityService = require('../services/activityService');

const getGameReviews = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { gameId: parseInt(gameId) },
      include: {
        user: {
          select: { id: true, name: true }
        },
        votes: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format reviews to include upvote/downvote counts
    const formattedReviews = reviews.map(review => {
        const upvotes = review.votes.filter(v => v.isUpvote).length;
        const downvotes = review.votes.filter(v => !v.isUpvote).length;
        const userVote = req.user ? review.votes.find(v => v.userId === req.user.id) : null;
        
        return {
            ...review,
            upvotes,
            downvotes,
            userVote: userVote ? (userVote.isUpvote ? 'up' : 'down') : null,
            votes: undefined // Remove raw votes array
        };
    });

    res.status(200).json({
      success: true,
      data: formattedReviews
    });
  } catch (error) {
    next(error);
  }
};

const voteReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { type } = req.body; // 'up' or 'down'
        const userId = req.user.id;

        if (type !== 'up' && type !== 'down') {
            const error = new Error('Invalid vote type');
            error.statusCode = 400;
            throw error;
        }

        const isUpvote = type === 'up';

        const existingVote = await prisma.reviewVote.findUnique({
            where: {
                reviewId_userId: {
                    reviewId: parseInt(id),
                    userId
                }
            }
        });

        if (existingVote) {
            if (existingVote.isUpvote === isUpvote) {
                // Remove vote if same type (toggle off)
                await prisma.reviewVote.delete({
                    where: { id: existingVote.id }
                });
                return res.status(200).json({ success: true, message: 'Vote removed' });
            } else {
                // Change vote type
                await prisma.reviewVote.update({
                    where: { id: existingVote.id },
                    data: { isUpvote }
                });
                return res.status(200).json({ success: true, message: 'Vote updated' });
            }
        } else {
            // Create new vote
            await prisma.reviewVote.create({
                data: {
                    reviewId: parseInt(id),
                    userId,
                    isUpvote
                }
            });
            return res.status(201).json({ success: true, message: 'Vote added' });
        }
    } catch (error) {
        next(error);
    }
};

const addReview = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { rating, comment } = req.body;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      const error = new Error('Rating must be between 1 and 5');
      error.statusCode = 400;
      throw error;
    }

    // Check if user already reviewed this game
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: req.user.id,
        gameId: parseInt(gameId)
      }
    });

    if (existingReview) {
      const error = new Error('You have already reviewed this game');
      error.statusCode = 400;
      throw error;
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        gameId: parseInt(gameId),
        rating: parseInt(rating),
        comment
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    // Notify Publisher
    const game = await prisma.game.findUnique({
      where: { id: parseInt(gameId) },
      select: { publisherId: true, title: true }
    });

    if (game && game.publisherId) {
      await notificationService.sendNotification(
        req.app, 
        game.publisherId, 
        `User ${review.user.name} reviewed your game "${game.title}" with ${rating} stars.`, 
        'REVIEW'
      );
    }

    // Log Activity
    await activityService.logActivity(
        req.user.id,
        'REVIEW',
        `reviewed ${game.title} with ${rating} stars`,
        { gameId: parseInt(gameId), rating: parseInt(rating) }
    );

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) }
    });

    if (!review) {
      const error = new Error('Review not found');
      error.statusCode = 404;
      throw error;
    }

    if (review.userId !== req.user.id) {
      const error = new Error('Not authorized to edit this review');
      error.statusCode = 403;
      throw error;
    }

    const updatedReview = await prisma.review.update({
      where: { id: parseInt(id) },
      data: {
        rating: rating ? parseInt(rating) : undefined,
        comment
      },
      include: {
        user: { select: { id: true, name: true } }
      }
    });

    res.status(200).json({
      success: true,
      data: updatedReview
    });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) }
    });

    if (!review) {
      const error = new Error('Review not found');
      error.statusCode = 404;
      throw error;
    }

    // Allow user to delete their own review, or ADMIN
    if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
      const error = new Error('Not authorized to delete this review');
      error.statusCode = 403;
      throw error;
    }

    await prisma.review.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Review deleted'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGameReviews,
  addReview,
  updateReview,
  deleteReview,
  voteReview
};
