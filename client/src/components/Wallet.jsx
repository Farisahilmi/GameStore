import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCreditCard, faShieldAlt, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const Wallet = ({ user, refreshUser }) => {
  const { theme } = useTheme();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTopUp = async (value) => {
    if (!value || isNaN(value) || parseFloat(value) < 1) {
        toast.error('Minimum top-up amount is $1.00');
        return;
    }
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        await axios.post('/api/wallet/topup', { amount: parseFloat(value) }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(`Successfully added $${value} to wallet!`);
        await refreshUser();
        setAmount('');
    } catch (err) {
        toast.error(err.response?.data?.message || 'Top-up failed');
    } finally {
        setLoading(false);
    }
  };

  const predefinedAmounts = [5, 10, 20, 50, 100];

  return (
    <div className={`container mx-auto px-4 py-12 min-h-screen ${theme.colors.bg} ${theme.colors.text}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-10">
            {/* Left Column: Virtual Card */}
            <div className="lg:w-1/2">
                <h2 className="text-4xl font-black mb-8 tracking-tighter italic">My <span className="text-blue-500">Wallet</span></h2>
                
                <motion.div 
                    initial={{ rotateX: 20, rotateY: -10, scale: 0.9, opacity: 0 }}
                    animate={{ rotateX: 0, rotateY: 0, scale: 1, opacity: 1 }}
                    className="relative w-full h-64 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-8 shadow-[0_20px_50px_rgba(37,99,235,0.3)] border border-white/20 overflow-hidden group mb-10"
                >
                    {/* Decorative elements */}
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="absolute -left-10 -top-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
                    
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Store Credit Card</div>
                                <div className="text-xl font-bold tracking-widest">{user?.name || 'GAMESTORE USER'}</div>
                            </div>
                            <FontAwesomeIcon icon={faCreditCard} className="text-3xl opacity-40" />
                        </div>
                        
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Available Balance</div>
                            <div className="text-5xl font-black tracking-tighter flex items-baseline gap-2">
                                <span className="text-blue-200">$</span>
                                {Number(user?.walletBalance || 0).toFixed(2)}
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                            <div className="text-[10px] font-mono tracking-widest opacity-40">**** **** **** {user?.id?.toString().padStart(4, '0') || '0000'}</div>
                            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10">
                                <FontAwesomeIcon icon={faShieldAlt} className="text-green-400 text-[10px]" />
                                <span className="text-[9px] font-black uppercase tracking-wider">Secured</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-4">
                    <div className={`${theme.colors.card} p-5 rounded-3xl border ${theme.colors.border} shadow-lg`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs">
                                <FontAwesomeIcon icon={faArrowDown} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Income</span>
                        </div>
                        <div className="text-2xl font-black tracking-tighter">$1,240.00</div>
                    </div>
                    <div className={`${theme.colors.card} p-5 rounded-3xl border ${theme.colors.border} shadow-lg`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-xs">
                                <FontAwesomeIcon icon={faArrowUp} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Spent</span>
                        </div>
                        <div className="text-2xl font-black tracking-tighter">$845.20</div>
                    </div>
                </div>
            </div>

            {/* Right Column: Add Funds */}
            <div className="lg:w-1/2">
                <div className={`${theme.colors.card} rounded-[2.5rem] border ${theme.colors.border} shadow-2xl p-10 h-full`}>
                    <h3 className="text-2xl font-black mb-8 tracking-tight">Add <span className="text-blue-500">Funds</span></h3>
                    
                    <div className="space-y-8">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-4">Select Quick Amount</p>
                            <div className="grid grid-cols-3 gap-3">
                                {predefinedAmounts.map(amt => (
                                    <button
                                        key={amt}
                                        onClick={() => handleTopUp(amt)}
                                        disabled={loading}
                                        className={`py-4 rounded-2xl font-black border-2 transition-all ${
                                            loading 
                                            ? 'opacity-50' 
                                            : `border-white/5 bg-white/5 hover:border-blue-500 hover:bg-blue-500/10 ${theme.colors.text}`
                                        }`}
                                    >
                                        ${amt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-4">Or Enter Custom Amount</p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-blue-500">$</span>
                                    <input 
                                        type="number" 
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className={`w-full ${theme.name === 'Clean Light' ? 'bg-gray-100' : 'bg-white/5'} border-2 border-transparent focus:border-blue-500 rounded-2xl py-4 pl-10 pr-6 outline-none transition-all font-black text-xl`}
                                        min="1"
                                    />
                                </div>
                                <button 
                                    onClick={() => handleTopUp(amount)}
                                    disabled={loading || !amount}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-10 rounded-2xl font-black shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 whitespace-nowrap"
                                >
                                    {loading ? 'Processing...' : <><FontAwesomeIcon icon={faPlus} /> Add Funds</>}
                                </button>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                <FontAwesomeIcon icon={faShieldAlt} className="text-blue-400 text-xl" />
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-wider text-blue-400">Guaranteed Security</p>
                                    <p className="text-[10px] opacity-60">Your payment information is encrypted and never stored on our servers.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;