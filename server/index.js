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
      process.env.FRONTEND_URL // Production URL (from Env Var)
    ],
    methods: ['GET', 'POST']
  }
});

// Store io in app to access it from controllers/services
app.set('io', io);
global.io = io; // Make io globally available for services


io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their notification room`);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
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
