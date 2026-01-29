const gameService = require('../services/gameService');
const recommendationService = require('../services/recommendationService');
const Joi = require('joi');

const gameSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().min(0).required(),
  discount: Joi.number().min(0).max(100).optional(),
  imageUrl: Joi.string().uri().optional(),
  releaseDate: Joi.date().optional(),
  categoryNames: Joi.array().items(Joi.string()).optional()
});

const updateGameSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  price: Joi.number().min(0).optional(),
  discount: Joi.number().min(0).max(100).optional(),
  imageUrl: Joi.string().uri().optional(),
  releaseDate: Joi.date().optional(),
  categoryNames: Joi.array().items(Joi.string()).optional()
});

const getAllGames = async (req, res, next) => {
  try {
    const result = await gameService.getAllGames(req.query);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getGameById = async (req, res, next) => {
  try {
    const result = await gameService.getGameById(req.params.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const createGame = async (req, res, next) => {
  try {
    const { error, value } = gameSchema.validate(req.body);
    if (error) {
      error.statusCode = 400;
      throw error;
    }

    const result = await gameService.createGame(value, req.user.id);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const updateGame = async (req, res, next) => {
  try {
    const { error, value } = updateGameSchema.validate(req.body);
    if (error) {
      error.statusCode = 400;
      throw error;
    }

    const result = await gameService.updateGame(req.params.id, value, req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const deleteGame = async (req, res, next) => {
  try {
    const result = await gameService.deleteGame(req.params.id, req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getRecommendations = async (req, res, next) => {
  try {
    const result = await recommendationService.getRecommendations(req.user.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getDiscoveryQueue = async (req, res, next) => {
    try {
        const result = await recommendationService.getDiscoveryQueue(req.user.id);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
  getAllGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
  getRecommendations,
  getDiscoveryQueue
};
