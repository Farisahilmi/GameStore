const prisma = require('../utils/prisma');

const getDashboardStats = async (req, res, next) => {
  try {
    const isPublisher = req.user.role === 'PUBLISHER';
    const publisherId = req.user.id;

    // 1. Total Users (Only for ADMIN)
    const totalUsers = isPublisher ? 0 : await prisma.user.count({
      where: { role: 'USER' }
    });

    // 2. Total Games (Filter by publisher if needed)
    const totalGames = await prisma.game.count({
        where: isPublisher ? { publisherId } : {}
    });

    // 3. Total Transactions & Revenue
    // Note: For simplicity in this demo, publishers see all revenue or we'd filter by games they own
    const transactions = await prisma.transaction.findMany({
      where: isPublisher ? {
          games: { some: { publisherId } }
      } : {},
      select: { total: true }
    });
    
    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce((acc, curr) => acc + Number(curr.total), 0);

    // 4. Recent Transactions
    const recentTransactions = await prisma.transaction.findMany({
      take: 5,
      where: isPublisher ? {
          games: { some: { publisherId } }
      } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    // 5. Chart Data (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesByDay = await prisma.transaction.findMany({
        where: {
            createdAt: { gte: sevenDaysAgo },
            ...(isPublisher ? { games: { some: { publisherId } } } : {})
        },
        select: {
            createdAt: true,
            total: true
        }
    });

    // Process data for Recharts
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayTotal = salesByDay
            .filter(t => t.createdAt.toISOString().split('T')[0] === dateStr)
            .reduce((acc, curr) => acc + Number(curr.total), 0);
            
        chartData.push({
            name: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
            sales: dayTotal
        });
    }

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalGames,
        totalTransactions,
        totalRevenue,
        recentTransactions,
        chartData
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
