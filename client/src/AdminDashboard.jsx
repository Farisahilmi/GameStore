import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import { useTheme } from './context/ThemeContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminDashboard = ({ user }) => {
  const { theme } = useTheme();
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
    <div className={`flex justify-center items-center h-screen ${theme.colors.bg}`}>
      <div className={`animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 ${theme.colors.accent}`}></div>
    </div>
  );

  return (
    <div className={`container mx-auto px-4 py-8 ${theme.colors.bg} min-h-screen ${theme.colors.text}`}>
      <h2 className={`text-3xl font-bold mb-8 ${theme.colors.accent} border-b ${theme.colors.border} pb-4`}>
          {user.role === 'ADMIN' ? 'Global Administration' : 'Publisher Dashboard'}
      </h2>
      
      {/* Global Charts & Stats */}
      {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
              <div className={`${theme.colors.card} p-6 rounded-lg border ${theme.colors.border} shadow-xl lg:col-span-2`}>
                  <h3 className="opacity-50 font-bold mb-6 uppercase text-sm tracking-widest">Revenue (Last 7 Days)</h3>
                  <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats.chartData}>
                              <defs>
                                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor={theme.name === 'Clean Light' ? '#3b82f6' : '#66c0f4'} stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor={theme.name === 'Clean Light' ? '#3b82f6' : '#66c0f4'} stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke={theme.name === 'Clean Light' ? '#e5e7eb' : '#374151'} vertical={false} />
                              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: theme.name === 'Clean Light' ? '#fff' : '#1b2838', border: `1px solid ${theme.name === 'Clean Light' ? '#e5e7eb' : '#374151'}`, borderRadius: '8px' }}
                                itemStyle={{ color: theme.name === 'Clean Light' ? '#2563eb' : '#66c0f4' }}
                              />
                              <Area type="monotone" dataKey="sales" stroke={theme.name === 'Clean Light' ? '#2563eb' : '#66c0f4'} fillOpacity={1} fill="url(#colorSales)" />
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

      {/* Secondary Charts Row */}
      {stats && stats.categoryData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              <div className={`${theme.colors.card} p-6 rounded-lg border ${theme.colors.border} shadow-xl`}>
                  <h3 className="opacity-50 font-bold mb-6 uppercase text-sm tracking-widest">Sales by Category</h3>
                  <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                  data={stats.categoryData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  paddingAngle={5}
                                  dataKey="value"
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                  {stats.categoryData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ backgroundColor: theme.name === 'Clean Light' ? '#fff' : '#1b2838', border: `1px solid ${theme.name === 'Clean Light' ? '#e5e7eb' : '#374151'}`, borderRadius: '8px' }}
                              />
                              <Legend verticalAlign="bottom" height={36}/>
                          </PieChart>
                      </ResponsiveContainer>
                  </div>
              </div>
              
              {/* Top Games Summary (Admin Only or Publisher) */}
              <div className={`${theme.colors.card} p-6 rounded-lg border ${theme.colors.border} shadow-xl`}>
                  <h3 className="opacity-50 font-bold mb-6 uppercase text-sm tracking-widest">Recent Activity Pulse</h3>
                  <div className="space-y-4">
                      {stats.recentTransactions.slice(0, 4).map(tx => (
                          <div key={tx.id} className="flex items-center justify-between p-3 bg-black/10 rounded-lg">
                              <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full ${theme.colors.accent.replace('text-', 'bg-')} flex items-center justify-center text-xs font-bold text-white`}>
                                      {tx.user.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                      <div className="text-sm font-bold">{tx.user.name}</div>
                                      <div className="text-[10px] opacity-50">{new Date(tx.createdAt).toLocaleTimeString()}</div>
                                  </div>
                              </div>
                              <div className="text-green-500 font-bold">${Number(tx.total).toFixed(2)}</div>
                          </div>
                      ))}
                      {stats.recentTransactions.length === 0 && (
                          <div className="text-center py-10 opacity-30 italic">No recent activity</div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Publisher Stats */}
      {publisherStats && (
        <div className="mb-10">
            <h3 className="text-xl font-bold mb-6 opacity-50 uppercase tracking-widest">My Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className={`${theme.colors.card} p-6 rounded-lg border ${theme.colors.border} shadow-xl`}>
                    <h4 className="opacity-50 text-sm font-bold uppercase mb-2">My Total Revenue</h4>
                    <div className="text-3xl font-bold text-green-500">${publisherStats.totalRevenue.toFixed(2)}</div>
                </div>
                <div className={`${theme.colors.card} p-6 rounded-lg border ${theme.colors.border} shadow-xl`}>
                    <h4 className="opacity-50 text-sm font-bold uppercase mb-2">My Total Sales</h4>
                    <div className="text-3xl font-bold text-blue-500">{publisherStats.totalSales} units</div>
                </div>
                <div className={`${theme.colors.card} p-6 rounded-lg border ${theme.colors.border} shadow-xl`}>
                    <h4 className="opacity-50 text-sm font-bold uppercase mb-2">My Games</h4>
                    <div className="text-3xl font-bold text-purple-500">{publisherStats.gamesCount}</div>
                </div>
            </div>

            <div className={`${theme.colors.card} rounded-lg border ${theme.colors.border} overflow-hidden shadow-2xl`}>
                <div className={`p-4 ${theme.name === 'Clean Light' ? 'bg-gray-100' : 'bg-gray-800/50'} border-b ${theme.colors.border} font-bold`}>Game Performance Breakdown</div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className={`${theme.name === 'Clean Light' ? 'bg-gray-50' : 'bg-gray-900/50'} opacity-50 text-[10px] uppercase`}>
                                <th className="px-6 py-3">Game Title</th>
                                <th className="px-6 py-3">Price</th>
                                <th className="px-6 py-3">Discount</th>
                                <th className="px-6 py-3">Sales</th>
                                <th className="px-6 py-3">Reviews</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${theme.colors.border}`}>
                            {publisherStats.games.map(g => (
                                <tr key={g.id} className="hover:bg-black/5 transition text-sm">
                                    <td className={`px-6 py-4 font-bold ${theme.colors.text}`}>{g.title}</td>
                                    <td className="px-6 py-4 opacity-70">${Number(g.price).toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        {g.discount > 0 ? (
                                            <span className="bg-red-900/50 text-red-400 px-2 py-0.5 rounded border border-red-500/20">-{g.discount}%</span>
                                        ) : (
                                            <span className="opacity-30">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-blue-500">{g.salesCount}</td>
                                    <td className="px-6 py-4 opacity-70">{g.reviewCount}</td>
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
        <div className={`${theme.colors.card} rounded-lg shadow-lg border ${theme.colors.border} overflow-hidden`}>
            <div className={`p-6 border-b ${theme.colors.border} ${theme.name === 'Clean Light' ? 'bg-gray-100' : 'bg-gray-800/50'}`}>
                <h3 className={`text-xl font-bold ${theme.colors.text} uppercase tracking-wider`}>Global Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto rounded-lg border border-white/5">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className={`${theme.name === 'Clean Light' ? 'bg-gray-100' : 'bg-gray-800'} opacity-50 uppercase text-[10px] tracking-widest`}>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${theme.colors.border}`}>
                        {stats.recentTransactions.map(tx => (
                            <tr key={tx.id} className="hover:bg-blue-500/5 transition group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full ${theme.colors.accent.replace('text-', 'bg-')} flex items-center justify-center text-xs font-bold text-white`}>
                                            {tx.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium">{tx.user.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-green-500 font-bold tracking-tight">${Number(tx.total).toFixed(2)}</td>
                                <td className="px-6 py-4 opacity-70 text-sm">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-1 rounded-full border border-green-500/20 uppercase tracking-tighter">
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
