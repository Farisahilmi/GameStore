const prisma = require('../utils/prisma');
const notificationService = require('../services/notificationService');

const getAllEvents = async (req, res, next) => {
  try {
    const events = await prisma.saleEvent.findMany({
      orderBy: { startDate: 'desc' }
    });
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

const getActiveEvent = async (req, res, next) => {
    try {
      const now = new Date();
      const event = await prisma.saleEvent.findFirst({
        where: {
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now }
        }
      });
      res.status(200).json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  };

const createEvent = async (req, res, next) => {
  try {
    const { name, discountPercent, startDate, endDate, isActive } = req.body;
    
    const event = await prisma.saleEvent.create({
      data: {
        name,
        discountPercent: parseInt(discountPercent),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? isActive : true
      }
    });

    // Notify all users about the new sale event if active
    if (event.isActive) {
      const users = await prisma.user.findMany({ select: { id: true } });
      // In a real app, use a worker queue for this. 
      // For now, we'll do it in a loop or just a few for demo.
      users.forEach(async (user) => {
        await notificationService.sendNotification(
          req.app,
          user.id,
          `New Sale Event: ${event.name}! Get ${event.discountPercent}% off on all games!`,
          'SALE'
        );
      });
    }

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, discountPercent, startDate, endDate, isActive } = req.body;

    const event = await prisma.saleEvent.update({
      where: { id: parseInt(id) },
      data: {
        name,
        discountPercent: discountPercent ? parseInt(discountPercent) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive
      }
    });

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    await prisma.saleEvent.delete({ where: { id: parseInt(req.params.id) } });
    res.status(200).json({ success: true, message: 'Event deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEvents,
  getActiveEvent,
  createEvent,
  updateEvent,
  deleteEvent
};
