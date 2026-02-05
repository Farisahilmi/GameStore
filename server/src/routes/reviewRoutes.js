const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authenticate } = require('../middlewares/authMiddleware');

// Get reviews for a game
router.get('/:gameId', async (req, res) => {
  try {
    const gameId = parseInt(req.params.gameId);
    
    const reviews = await prisma.review.findMany({
      where: { gameId },
      include: {
        user: {
          select: { id: true, name: true, theme: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ data: reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create a review
router.post('/', authenticate, async (req, res) => {
  try {
    const { gameId, rating, comment } = req.body;
    const userId = req.user.id;

    // Check if user owns the game (optional but recommended)
    // For now, let's allow review if they played it or just want to review
    // Ideally check Library or Transaction

    const review = await prisma.review.create({
      data: {
        userId,
        gameId: parseInt(gameId),
        rating: parseInt(rating),
        comment
      },
      include: {
        user: {
          select: { id: true, name: true }
        },
        game: {
            select: { title: true }
        }
      }
    });

    // Create Activity
    await prisma.activity.create({
        data: {
            userId,
            type: 'REVIEW',
            message: `reviewed ${review.game.title} - ${'★'.repeat(rating)}`,
            metadata: JSON.stringify({ gameId: review.gameId, rating })
        }
    });

    res.status(201).json({ data: review });
  } catch (error) {
    // Check for unique constraint violation (already reviewed)
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'You have already reviewed this game' });
    }
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to post review' });
  }
});

module.exports = router;