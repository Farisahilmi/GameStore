const prisma = require('../utils/prisma');

const createNotification = async (userId, message, type) => {
  try {
    // 1. Save to DB
    const notification = await prisma.notification.create({
      data: {
        userId,
        message,
        type
      }
    });

    // 2. Emit via Socket.io if io instance is available globally or passed
    // Note: In this architecture, accessing 'app' or 'io' directly in service might be tricky without dependency injection.
    // We'll rely on the controller or a global io object if set.
    // For now, let's just return the notification.
    // If you need real-time, you might need to export a setIo function or access global.io if you set it.
    
    if (global.io) {
        global.io.to(`user_${userId}`).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    // throw error; // Optionally rethrow if you want to block the transaction, but usually notifications are side effects
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
  createNotification,
  getUserNotifications,
  markAsRead
};
