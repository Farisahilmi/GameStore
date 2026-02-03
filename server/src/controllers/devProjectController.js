const prisma = require('../utils/prisma');
const notificationService = require('../services/notificationService');

const getMyProjects = async (req, res, next) => {
  try {
    const projects = await prisma.devProject.findMany({
      where: { publisherId: req.user.id },
      orderBy: { lastUpdate: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

const getAllPublicProjects = async (req, res, next) => {
    try {
        const projects = await prisma.devProject.findMany({
            orderBy: { lastUpdate: 'desc' },
            take: 10
        });

        res.status(200).json({
            success: true,
            data: projects
        });
    } catch (error) {
        next(error);
    }
};

const createProject = async (req, res, next) => {
  try {
    const { title, status } = req.body;

    const project = await prisma.devProject.create({
      data: {
        publisherId: req.user.id,
        title,
        status: status || 'CONCEPT',
        progress: 0
      }
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, status, progress } = req.body;

    const project = await prisma.devProject.findUnique({
      where: { id: parseInt(id) }
    });

    if (!project || project.publisherId !== req.user.id) {
        const error = new Error('Project not found or unauthorized');
        error.statusCode = 404;
        throw error;
    }

    const updatedProject = await prisma.devProject.update({
      where: { id: parseInt(id) },
      data: {
        title,
        status,
        progress: parseInt(progress),
        lastUpdate: new Date()
      },
      include: {
          publisher: { select: { id: true, name: true } }
      }
    });

    // Notify Followers
    const followers = await prisma.follow.findMany({
        where: { publisherId: req.user.id },
        select: { userId: true }
    });

    if (followers.length > 0) {
        const message = `Publisher ${updatedProject.publisher.name} updated project "${updatedProject.title}" to status: ${updatedProject.status} (${updatedProject.progress}%)`;
        for (const follower of followers) {
            await notificationService.createNotification(
                follower.userId,
                message,
                'DEV_UPDATE'
            );
        }
    }

    res.status(200).json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await prisma.devProject.findUnique({
      where: { id: parseInt(id) }
    });

    if (!project || project.publisherId !== req.user.id) {
        const error = new Error('Project not found or unauthorized');
        error.statusCode = 404;
        throw error;
    }

    await prisma.devProject.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Project deleted'
    });
  } catch (error) {
    next(error);
  }
};

const getProjectComments = async (req, res, next) => {
    try {
        const { id } = req.params;
        const comments = await prisma.devProjectComment.findMany({
            where: { projectId: parseInt(id) },
            include: {
                user: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, data: comments });
    } catch (error) {
        next(error);
    }
};

const addComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!content) {
            const error = new Error('Comment content is required');
            error.statusCode = 400;
            throw error;
        }

        const comment = await prisma.devProjectComment.create({
            data: {
                projectId: parseInt(id),
                userId: req.user.id,
                content
            },
            include: {
                user: { select: { id: true, name: true } }
            }
        });

        res.status(201).json({ success: true, data: comment });
    } catch (error) {
        next(error);
    }
};

module.exports = {
  getMyProjects,
  getAllPublicProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectComments,
  addComment
};
