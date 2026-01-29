const prisma = require('../utils/prisma');

const logActivity = async (userId, type, message, metadata = null) => {
    try {
        return await prisma.activity.create({
            data: {
                userId,
                type,
                message,
                metadata: metadata ? JSON.stringify(metadata) : null
            }
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};

module.exports = {
    logActivity
};
