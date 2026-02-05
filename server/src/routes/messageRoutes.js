const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authenticate } = require('../middlewares/authMiddleware');

// Get chat history with a specific friend
router.get('/:friendId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const friendId = parseInt(req.params.friendId);

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.json({ data: messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Mark messages as read
router.put('/:friendId/read', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const friendId = parseInt(req.params.friendId);

    await prisma.message.updateMany({
      where: {
        senderId: friendId,
        receiverId: userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

module.exports = router;