import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSpinner, faPalette } from '@fortawesome/free-solid-svg-icons';
import { useTheme, themes } from '../context/ThemeContext';

const Settings = ({ user, setUser }) => {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { currentTheme, changeTheme, theme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [email] = useState(user?.email || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
        const token = localStorage.getItem('token');
        const res = await axios.put('/api/users/profile', { name, bio }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.data);
        localStorage.setItem('user', JSON.stringify(res.data.data));
        toast.success('Profile updated successfully!');
    } catch (err) {
        toast.error('Failed to update profile');
    } finally {
        setIsUpdating(false);
    }
  };

  const handleUpgrade = async () => {
    if (!window.confirm("Confirm payment of $10.00 to become a Publisher? (Dummy Transaction)")) {
        return;
    }

    setIsUpgrading(true);
    const token = localStorage.getItem('token');
    
    // Simulate processing time
    setTimeout(async () => {
        try {
            await axios.put('/api/users/upgrade-to-publisher', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update local user state
            const updatedUser = { ...user, role: 'PUBLISHER' };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            
            toast.success('Congratulations! You are now a Publisher.');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Upgrade failed');
        } finally {
            setIsUpgrading(false);
        }
    }, 2000);
  };

  if (!user) return null;

  return (
    <div className={`container mx-auto px-4 py-8 min-h-screen ${theme.colors.bg}`}>
      <h2 className={`text-3xl font-bold ${theme.colors.text} mb-8 border-b ${theme.colors.border} pb-4`}>Account Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-8">
          <div className={`${theme.colors.card} p-8 rounded-2xl border ${theme.colors.border} shadow-xl`}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className={`w-2 h-8 ${theme.colors.accent.replace('text-', 'bg-')} rounded-full`}></div>
                Profile Settings
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Display Name</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full ${theme.name === 'Clean Light' ? 'bg-gray-100' : 'bg-black/20'} ${theme.colors.text} border ${theme.colors.border} rounded-xl px-4 py-3 outline-none focus:border-steam-accent transition`}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Email Address</label>
                        <input 
                            type="email" 
                            value={email}
                            disabled
                            className={`w-full bg-black/5 opacity-50 ${theme.colors.text} border ${theme.colors.border} rounded-xl px-4 py-3 cursor-not-allowed`}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Bio / About Me</label>
                    <textarea 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell others about yourself..."
                        className={`w-full ${theme.name === 'Clean Light' ? 'bg-gray-100' : 'bg-black/20'} ${theme.colors.text} border ${theme.colors.border} rounded-xl px-4 py-3 outline-none focus:border-steam-accent transition min-h-[120px]`}
                    />
                </div>
                <div className="flex justify-end">
                    <button 
                        type="submit"
                        disabled={isUpdating}
                        className="bg-steam-accent hover:bg-blue-500 text-white font-bold py-3 px-10 rounded-xl transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
          </div>

          <div className={`${theme.colors.card} p-8 rounded-2xl border ${theme.colors.border} shadow-xl`}>
            <h3 className={`text-xl font-bold ${theme.colors.accent} mb-4`}>
                <FontAwesomeIcon icon={faPalette} className="mr-2" />
                Appearance
            </h3>
            <p className="opacity-70 mb-4 text-sm">Customize your experience by choosing a theme.</p>
            
            <div className="grid grid-cols-1 gap-3">
                {Object.entries(themes).map(([key, t]) => (
                    <button
                        key={key}
                        onClick={() => changeTheme(key)}
                        className={`p-4 rounded-lg border-2 transition-all flex items-center justify-between group ${
                            currentTheme === key 
                            ? `border-blue-500 ${t.colors.bg}` 
                            : `border-transparent hover:border-gray-500 ${t.colors.card}`
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${t.colors.gradient} border border-gray-500 shadow-sm`}></div>
                            <span className={`font-bold ${currentTheme === key ? t.colors.text : ''}`}>{t.name}</span>
                        </div>
                        {currentTheme === key && <FontAwesomeIcon icon={faCheckCircle} className="text-blue-500" />}
                    </button>
                ))}
            </div>
        </div>

        {/* Upgrade / Role Management */}
        <div className={`md:col-span-2 ${theme.colors.card} p-6 rounded-lg shadow-lg border ${theme.colors.border}`}>
            <h3 className={`text-xl font-bold ${theme.colors.accent} mb-4`}>Publisher Program</h3>
            
            {user.role === 'USER' ? (
                <div className="text-center py-4">
                    <p className="opacity-70 mb-6">
                        Want to sell your own games on GameStore? <br/>
                        Upgrade your account to Publisher status for a one-time fee.
                    </p>
                    <div className="text-4xl font-bold mb-6">$10.00</div>
                    <button 
                        onClick={handleUpgrade}
                        disabled={isUpgrading}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 w-full md:w-auto mx-auto"
                    >
                        {isUpgrading ? (
                             <>
                                <FontAwesomeIcon icon={faSpinner} spin />
                                Processing Payment...
                             </>
                        ) : 'Upgrade to Publisher'}
                    </button>
                    <p className="text-xs opacity-50 mt-4 italic">
                        *This is a dummy transaction. No real money is charged.
                    </p>
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className={`text-5xl mb-4 ${theme.colors.accent}`}><FontAwesomeIcon icon={faCheckCircle} /></div>
                    <h4 className="text-2xl font-bold mb-2">You are a Publisher!</h4>
                    <p className="text-green-500">
                        You have full access to manage and publish games.
                    </p>
                </div>
            )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
