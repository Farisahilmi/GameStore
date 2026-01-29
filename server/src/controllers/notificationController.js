const notificationService = require('../services/notificationService');

const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.id);
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAsRead(req.params.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead
};
