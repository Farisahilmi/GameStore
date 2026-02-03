const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const categoryRoutes = require('./routes/categoryRoutes'); // Assuming this exists or I should check
const wishlistRoutes = require('./routes/wishlistRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const devProjectRoutes = require('./routes/devProjectRoutes');
const followRoutes = require('./routes/followRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const publisherRoutes = require('./routes/publisherRoutes');
const saleRoutes = require('./routes/saleRoutes');
const friendRoutes = require('./routes/friendRoutes');
const activityRoutes = require('./routes/activityRoutes');
const gameUpdateRoutes = require('./routes/gameUpdateRoutes');
const walletRoutes = require('./routes/walletRoutes');
const voucherRoutes = require('./routes/voucherRoutes');

const apiKeyMiddleware = require('./middlewares/apiKeyMiddleware');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', // Local Dev
    process.env.FRONTEND_URL // Production URL (from Env Var)
  ]
}));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads')); // Serve uploaded files statically

// Apply API Key Middleware globally or to specific routes
// User requested "PUBLIC KEY API", implying it's needed for access.
app.use('/api', apiKeyMiddleware);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dev-projects', devProjectRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/publishers', publisherRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/game-updates', gameUpdateRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/vouchers', voucherRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to GameStore API' });
});

// Error Handler
app.use(errorHandler);

module.exports = app;
