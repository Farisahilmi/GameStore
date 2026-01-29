import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';

const Settings = ({ user, setUser }) => {
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    if (!window.confirm("Confirm payment of $10.00 to become a Publisher? (Dummy Transaction)")) {
        return;
    }

    setIsUpgrading(true);
    const token = localStorage.getItem('token');
    
    // Simulate processing time
    setTimeout(async () => {
        try {
            const res = await axios.put('/api/users/upgrade-to-publisher', {}, {
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
    <div className="container mx-auto px-4 py-8 min-h-screen bg-steam-dark">
      <h2 className="text-3xl font-bold text-white mb-8 border-b border-gray-700 pb-4">Account Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Info */}
        <div className="bg-steam-light p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-xl font-bold text-steam-accent mb-4">Profile Information</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-gray-400 text-sm mb-1">Display Name</label>
                    <div className="text-white text-lg font-medium">{user.name}</div>
                </div>
                <div>
                    <label className="block text-gray-400 text-sm mb-1">Email Address</label>
                    <div className="text-white text-lg font-medium">{user.email}</div>
                </div>
                <div>
                    <label className="block text-gray-400 text-sm mb-1">Account Role</label>
                    <div className="inline-block px-3 py-1 rounded-full text-sm font-bold border border-gray-600 bg-gray-800 text-gray-300">
                        {user.role}
                    </div>
                </div>
            </div>
        </div>

        {/* Upgrade / Role Management */}
        <div className="bg-steam-light p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-xl font-bold text-steam-accent mb-4">Publisher Program</h3>
            
            {user.role === 'USER' ? (
                <div className="text-center py-4">
                    <p className="text-gray-300 mb-6">
                        Want to sell your own games on GameStore? <br/>
                        Upgrade your account to Publisher status for a one-time fee.
                    </p>
                    <div className="text-4xl font-bold text-white mb-6">$10.00</div>
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
                    <p className="text-xs text-gray-500 mt-4 italic">
                        *This is a dummy transaction. No real money is charged.
                    </p>
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="text-5xl mb-4 text-steam-accent"><FontAwesomeIcon icon={faCheckCircle} /></div>
                    <h4 className="text-2xl font-bold text-white mb-2">You are a Publisher!</h4>
                    <p className="text-green-400">
                        You have full access to manage and publish games.
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
