const prisma = require('../utils/prisma');

const sendNotification = async (app, userId, message, type) => {
  try {
    // 1. Save to DB
    const notification = await prisma.notification.create({
      data: {
        userId,
        message,
        type
      }
    });

    // 2. Emit via Socket.io
    const io = app.get('io');
    if (io) {
      io.to(`user_${userId}`).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};

const getUserNotifications = async (userId) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
};

const markAsRead = async (notificationId) => {
  return await prisma.notification.update({
    where: { id: parseInt(notificationId) },
    data: { isRead: true }
  });
};

module.exports = {
  sendNotification,
  getUserNotifications,
  markAsRead
};
