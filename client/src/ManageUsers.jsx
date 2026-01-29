import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`/api/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`User role updated to ${newRole}`);
      fetchUsers(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-900 text-red-200 border-red-700';
      case 'PUBLISHER': return 'bg-blue-900 text-blue-200 border-blue-700';
      default: return 'bg-green-900 text-green-200 border-green-700';
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-steam-dark">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-steam-accent"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-steam-dark">
      <h2 className="text-3xl font-bold text-white mb-8 border-b border-gray-700 pb-4">Manage Users</h2>
      
      <div className="bg-steam-light rounded-lg shadow-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-800 text-gray-400 uppercase text-xs">
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Joined Date</th>
                        <th className="px-6 py-4">Current Role</th>
                        <th className="px-6 py-4">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {users.map(user => (
                        <tr key={user.id} className="hover:bg-white/5 transition">
                            <td className="px-6 py-4">
                                <div className="font-medium text-white">{user.name}</div>
                            </td>
                            <td className="px-6 py-4 text-gray-300">{user.email}</td>
                            <td className="px-6 py-4 text-gray-400 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold border ${getRoleBadgeColor(user.role)}`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <select 
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    className="bg-gray-800 text-white text-sm border border-gray-600 rounded px-2 py-1 focus:border-steam-accent outline-none cursor-pointer"
                                >
                                    <option value="USER">User</option>
                                    <option value="PUBLISHER">Publisher</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
