const transactionService = require('../services/transactionService');
const notificationService = require('../services/notificationService');
const activityService = require('../services/activityService');
const Joi = require('joi');

const transactionSchema = Joi.object({
  gameIds: Joi.array().items(Joi.number()).required(),
  recipientId: Joi.number().optional().allow(null)
});

const createTransaction = async (req, res, next) => {
  try {
    const { error, value } = transactionSchema.validate(req.body);
    if (error) {
      error.statusCode = 400;
      throw error;
    }

    const transaction = await transactionService.createTransaction(
      req.user.id,
      value.gameIds,
      value.recipientId
    );
    
    // Send Notification
    const gameTitles = transaction.games.map(g => g.title).join(', ');
    await notificationService.createNotification(
      req.user.id,
      `Purchase successful! Games added to ${value.recipientId ? `${transaction.recipient.name}'s` : 'your'} library: ${gameTitles}`,
      'PURCHASE'
    );

    if (value.recipientId) {
        await notificationService.createNotification(
            value.recipientId,
            `You received a gift from ${req.user.name}: ${gameTitles}!`,
            'GIFT'
        );
    }

    // Log Activity
    await activityService.logActivity(
        req.user.id,
        'PURCHASE',
        value.recipientId ? `sent ${gameTitles} as a gift to ${transaction.recipient.name}` : `purchased ${gameTitles}`,
        { gameIds: value.gameIds, recipientId: value.recipientId }
    );

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

const getUserTransactions = async (req, res, next) => {
  try {
    const result = await transactionService.getUserTransactions(req.user.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getAllTransactions = async (req, res, next) => {
  try {
    const result = await transactionService.getAllTransactions();
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getUserTransactions,
  getAllTransactions
};
