const prisma = require('../utils/prisma');

const updateStatus = async (userId, status, statusMessage = null) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { 
      status, 
      statusMessage,
      lastActive: new Date()
    }
  });
};

const getHeartbeat = async (userId) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { lastActive: new Date() }
  });
};

module.exports = {
  updateStatus,
  getHeartbeat
};