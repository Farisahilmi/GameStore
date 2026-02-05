const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const prisma = require('./src/utils/prisma');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173', // Local Dev
      process.env.FRONTEND_URL, // Production URL (from Env Var)
      'https://gamestore1.vercel.app' // Hardcode as fallback
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Store io in app to access it from controllers/services
app.set('io', io);
global.io = io; // Make io globally available for services

// Track online users: Map<userId, socketId>
const onlineUsers = new Map();
// Reverse lookup: Map<socketId, userId>
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', async (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their notification room`);
      
      // Track online status
      onlineUsers.set(userId, socket.id);
      userSockets.set(socket.id, userId);
      
      try {
        // Fetch friends to notify them
        const friends = await prisma.friendship.findMany({
          where: {
            OR: [
              { userId: userId, status: 'ACCEPTED' },
              { friendId: userId, status: 'ACCEPTED' }
            ]
          }
        });

        // Notify friends that this user is online
        friends.forEach(friendship => {
          const friendId = friendship.userId === userId ? friendship.friendId : friendship.userId;
          io.to(`user_${friendId}`).emit('friend_status', {
            userId: userId,
            status: 'ONLINE'
          });
        });
      } catch (error) {
        console.error('Error syncing online status:', error);
      }
    }
  });

  socket.on('disconnect', async () => {
    const userId = userSockets.get(socket.id);
    if (userId) {
      console.log(`User ${userId} disconnected`);
      onlineUsers.delete(userId);
      userSockets.delete(socket.id);

      try {
        // Notify friends that this user is offline
        const friends = await prisma.friendship.findMany({
          where: {
            OR: [
              { userId: userId, status: 'ACCEPTED' },
              { friendId: userId, status: 'ACCEPTED' }
            ]
          }
        });

        friends.forEach(friendship => {
          const friendId = friendship.userId === userId ? friendship.friendId : friendship.userId;
          io.to(`user_${friendId}`).emit('friend_status', {
            userId: userId,
            status: 'OFFLINE'
          });
        });
      } catch (error) {
        console.error('Error syncing offline status:', error);
      }
    } else {
      console.log('User disconnected');
    }
  });

  // Chat Events
  socket.on('send_message', async (data) => {
    // data: { senderId, receiverId, message }
    const { senderId, receiverId, message } = data;
    
    try {
      // Save to database
      await prisma.message.create({
        data: {
          senderId,
          receiverId,
          content: message,
          isRead: false
        }
      });

      // Emit to receiver immediately
      io.to(`user_${receiverId}`).emit('receive_message', {
        senderId,
        message,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });
});

const start = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

start();
