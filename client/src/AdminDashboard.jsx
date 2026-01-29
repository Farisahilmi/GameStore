import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [publisherStats, setPublisherStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('/api/analytics/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data.data);
        
        if (user.role === 'PUBLISHER' || user.role === 'ADMIN') {
            const pubRes = await axios.get('/api/publishers/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPublisherStats(pubRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-steam-dark">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-steam-accent"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 bg-steam-dark min-h-screen text-white">
      <h2 className="text-3xl font-bold mb-8 text-steam-accent border-b border-gray-700 pb-4">
          {user.role === 'ADMIN' ? 'Global Administration' : 'Publisher Dashboard'}
      </h2>
      
      {/* Global Charts & Stats */}
      {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
              <div className="lg:col-span-2 bg-steam-light p-6 rounded-lg border border-gray-700 shadow-xl">
                  <h3 className="text-gray-400 font-bold mb-6 uppercase text-sm tracking-widest">Revenue (Last 7 Days)</h3>
                  <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats.chartData}>
                              <defs>
                                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#2a475e" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#2a475e" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#1b2838', border: '1px solid #374151', borderRadius: '8px' }}
                                itemStyle={{ color: '#66c0f4' }}
                              />
                              <Area type="monotone" dataKey="sales" stroke="#66c0f4" fillOpacity={1} fill="url(#colorSales)" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>
              <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-lg shadow-lg border border-blue-500/30">
                      <h3 className="text-blue-200 text-xs font-bold uppercase mb-1">Total Revenue</h3>
                      <div className="text-3xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-lg shadow-lg border border-green-500/30">
                      <h3 className="text-green-200 text-xs font-bold uppercase mb-1">Total Sales</h3>
                      <div className="text-3xl font-bold text-white">{stats.totalTransactions}</div>
                  </div>
                  {user.role === 'ADMIN' && (
                      <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-lg shadow-lg border border-purple-500/30">
                          <h3 className="text-purple-200 text-xs font-bold uppercase mb-1">Total Users</h3>
                          <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Publisher Stats */}
      {publisherStats && (
        <div className="mb-10">
            <h3 className="text-xl font-bold mb-6 text-gray-400 uppercase tracking-widest">My Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-steam-light p-6 rounded-lg border border-gray-700 shadow-xl">
                    <h4 className="text-gray-500 text-sm font-bold uppercase mb-2">My Total Revenue</h4>
                    <div className="text-3xl font-bold text-green-400">${publisherStats.totalRevenue.toFixed(2)}</div>
                </div>
                <div className="bg-steam-light p-6 rounded-lg border border-gray-700 shadow-xl">
                    <h4 className="text-gray-500 text-sm font-bold uppercase mb-2">My Total Sales</h4>
                    <div className="text-3xl font-bold text-blue-400">{publisherStats.totalSales} units</div>
                </div>
                <div className="bg-steam-light p-6 rounded-lg border border-gray-700 shadow-xl">
                    <h4 className="text-gray-500 text-sm font-bold uppercase mb-2">My Games</h4>
                    <div className="text-3xl font-bold text-purple-400">{publisherStats.gamesCount}</div>
                </div>
            </div>

            <div className="bg-steam-light rounded-lg border border-gray-700 overflow-hidden shadow-2xl">
                <div className="p-4 bg-gray-800/50 border-b border-gray-700 font-bold">Game Performance Breakdown</div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-900/50 text-gray-500 text-[10px] uppercase">
                                <th className="px-6 py-3">Game Title</th>
                                <th className="px-6 py-3">Price</th>
                                <th className="px-6 py-3">Discount</th>
                                <th className="px-6 py-3">Sales</th>
                                <th className="px-6 py-3">Reviews</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {publisherStats.games.map(g => (
                                <tr key={g.id} className="hover:bg-white/5 transition text-sm">
                                    <td className="px-6 py-4 font-bold text-white">{g.title}</td>
                                    <td className="px-6 py-4 text-gray-400">${Number(g.price).toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        {g.discount > 0 ? (
                                            <span className="bg-red-900/50 text-red-400 px-2 py-0.5 rounded border border-red-500/20">-{g.discount}%</span>
                                        ) : (
                                            <span className="text-gray-600">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-blue-400">{g.salesCount}</td>
                                    <td className="px-6 py-4 text-gray-400">{g.reviewCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {/* Recent Transactions Table (Admin Only) */}
      {user.role === 'ADMIN' && stats && (
        <div className="bg-steam-light rounded-lg shadow-lg border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700 bg-gray-800/50">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">Global Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-800 text-gray-400 uppercase text-xs">
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {stats.recentTransactions.map(tx => (
                            <tr key={tx.id} className="hover:bg-white/5 transition">
                                <td className="px-6 py-4 font-medium">{tx.user.name}</td>
                                <td className="px-6 py-4 text-green-400 font-bold">${Number(tx.total).toFixed(2)}</td>
                                <td className="px-6 py-4 text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-green-900 text-green-200 text-xs px-2 py-1 rounded-full border border-green-700">
                                        {tx.status || 'COMPLETED'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
