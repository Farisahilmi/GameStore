import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faSpinner, faCheckCircle, faGamepad, faBook, faGift } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';

const Cart = ({ cart, removeFromCart, clearCart, library, refreshLibrary, refreshUser, user }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [purchasedGames, setPurchasedGames] = useState([]);
  
  const [isGift, setIsGift] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriendId, setSelectedFriendId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  const subtotal = cart.reduce((sum, game) => sum + Number(game.finalPrice || game.price), 0);
  const discountAmount = appliedVoucher ? (subtotal * appliedVoucher.discountPercent / 100) : 0;
  const totalPrice = subtotal - discountAmount;

  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) return;
    
    setIsValidatingVoucher(true);
    try {
        const token = localStorage.getItem('token');
        const res = await axios.post('/api/vouchers/validate', { code: voucherCode }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setAppliedVoucher(res.data.data);
        toast.success(`Voucher applied! ${res.data.data.discountPercent}% discount`);
    } catch (err) {
        toast.error(err.response?.data?.error || 'Invalid voucher code');
        setAppliedVoucher(null);
    } finally {
        setIsValidatingVoucher(false);
    }
  };

  const handleCheckoutClick = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }

    // Fetch friends for gifting
    try {
        const res = await axios.get('/api/friends', {
            headers: { Authorization: `Bearer ${token}` }
        });
        // Filter out current user from friends list just in case
        setFriends(res.data.data.filter(f => f.id !== user?.id));
    } catch (err) {
        console.error('Failed to fetch friends');
    }

    setIsCheckoutModalOpen(true);
  };

  const handleConfirmCheckout = async (e) => {
    e.preventDefault();
    if (isGift && !selectedFriendId) {
        toast.error('Please select a friend to gift these games to');
        return;
    }

    if (!isGift && library && cart.some(g => library.includes(g.id))) {
        toast.error('You already own some games in your cart. Please remove them or buy as a gift.');
        return;
    }

    if (paymentMethod === 'WALLET') {
        if (!user || Number(user.walletBalance || 0) < totalPrice) {
            toast.error('Insufficient wallet balance. Please top up.');
            return;
        }
    }

    setIsProcessing(true);
    const token = localStorage.getItem('token');

    try {
      const res = await axios.post('/api/transactions', { 
        gameIds: cart.map(g => g.id),
        recipientId: isGift ? parseInt(selectedFriendId) : null,
        paymentMethod,
        voucherCode: appliedVoucher ? appliedVoucher.code : null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPurchasedGames(res.data.data.games);
      setRecipientName(res.data.data.recipient?.name || '');
      setIsProcessing(false);
      setIsCheckoutModalOpen(false);
      setIsSuccess(true);
      clearCart();
      if (refreshLibrary) refreshLibrary(); // Refresh library after purchase
      if (refreshUser) refreshUser(); // Refresh user wallet balance
      toast.success(isGift ? 'Gift sent successfully!' : 'Purchase successful!');
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      toast.error(err.response?.data?.error || 'Checkout failed');
    }
  };

  if (isSuccess) {
      return (
          <div className={`min-h-screen ${theme.colors.bg} ${theme.colors.text} flex flex-col items-center justify-center p-4`}>
              <div className={`${theme.colors.card} p-10 rounded-xl border ${theme.colors.border} shadow-2xl max-w-2xl w-full text-center`}>
                  <div className="text-green-500 text-7xl mb-6">
                      <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                  <h2 className="text-4xl font-bold mb-2">{isGift ? 'Gift Sent!' : 'Thank You!'}</h2>
                  <p className="opacity-70 text-lg mb-8">
                      {isGift 
                        ? `Your gift has been sent to ${recipientName}. They can find it in their library.` 
                        : 'Your purchase was successful and the games have been added to your library.'}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button 
                        onClick={() => navigate('/library')}
                        className="bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition transform hover:scale-105"
                      >
                          <FontAwesomeIcon icon={faBook} /> Go to Library
                      </button>
                      <button 
                        onClick={() => navigate('/')}
                        className="bg-gray-700 hover:bg-gray-600 text-white py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition transform hover:scale-105"
                      >
                          <FontAwesomeIcon icon={faGamepad} /> View More Games
                      </button>
                  </div>

                  <div className={`mt-10 pt-8 border-t ${theme.colors.border}`}>
                      <h4 className="opacity-50 font-bold uppercase text-xs tracking-widest mb-4">Purchased Games</h4>
                      <div className="flex flex-wrap justify-center gap-4">
                          {purchasedGames.map(game => (
                              <div key={game.id} className={`text-sm ${theme.colors.bg} px-3 py-1 rounded-full border ${theme.colors.border} opacity-80`}>
                                  {game.title}
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  if (cart.length === 0) {
    return (
      <div className={`min-h-screen ${theme.colors.bg} ${theme.colors.text} flex flex-col items-center justify-center p-4`}>
        <div className="bg-white/5 p-12 rounded-3xl border border-white/5 text-center max-w-lg w-full">
            <div className="text-6xl mb-6 opacity-20">🛒</div>
            <h2 className="text-3xl font-black italic mb-4">Your Cart is <span className="text-blue-500">Empty</span></h2>
            <p className="opacity-60 mb-8 font-medium">Looks like you haven&apos;t added any games yet. Start exploring now!</p>
            <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95">
              Start Shopping
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.colors.bg} ${theme.colors.text} pt-12 pb-24 px-4`}>
      <div className="container mx-auto max-w-6xl">
        <h1 className={`text-4xl font-black mb-10 border-l-8 border-blue-600 pl-6 uppercase italic tracking-tighter`}>Your Shopping <span className="text-blue-500">Cart</span></h1>
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="flex-1 space-y-6">
            {cart.map((game, index) => (
              <div key={`${game.id}-${index}`} className={`${theme.colors.card} p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center gap-6 border ${theme.colors.border} shadow-xl group hover:border-blue-500/30 transition-all`}>
                <Link to={`/games/${game.id}`} className="shrink-0 overflow-hidden rounded-2xl">
                    <img src={game.imageUrl} alt={game.title} className="w-full sm:w-40 h-24 object-cover group-hover:scale-110 transition-transform duration-500" />
                </Link>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start mb-2">
                      <Link to={`/games/${game.id}`} className="font-black text-xl hover:text-blue-400 transition truncate pr-4">{game.title}</Link>
                      <button 
                        onClick={() => removeFromCart(game.id)}
                        className="text-xs font-bold text-red-500 opacity-60 hover:opacity-100 uppercase tracking-wider shrink-0"
                      >
                        Remove
                      </button>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider opacity-60 mb-3">
                     {game.categories?.map(c => (
                         <span key={c.id} className="bg-white/10 px-2 py-1 rounded-md">{c.name}</span>
                     ))}
                  </div>
                  {library && library.includes(game.id) && (
                      <div className="inline-flex items-center gap-2 text-[10px] font-black bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-lg">
                          <FontAwesomeIcon icon={faGift} />
                          Already Owned (Gift Only)
                      </div>
                  )}
                </div>
                <div className="text-right shrink-0 w-full sm:w-auto flex flex-row sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 border-white/10 pt-4 sm:pt-0 mt-2 sm:mt-0">
                  <div className="text-xs font-bold opacity-40 uppercase tracking-widest sm:mb-1">Price</div>
                  <div className="font-black text-2xl text-blue-400">${Number(game.price).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="lg:w-96 shrink-0">
            <div className={`${theme.colors.card} p-8 rounded-3xl border ${theme.colors.border} shadow-2xl sticky top-24`}>
              <h3 className={`text-xl font-black uppercase italic tracking-wider mb-6 pb-4 border-b ${theme.colors.border}`}>Order Summary</h3>
              
              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-sm font-bold opacity-60">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                {appliedVoucher && (
                    <div className="flex justify-between text-sm font-bold text-green-500">
                        <span>Voucher ({appliedVoucher.code})</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between text-sm font-bold opacity-60">
                    <span>Tax (Estimated)</span>
                    <span>$0.00</span>
                </div>
              </div>

              {/* Voucher Input */}
              <div className="mb-8">
                  <label className="block text-[10px] font-black uppercase opacity-40 mb-2 tracking-widest">Promo Code</label>
                  <div className="flex gap-2">
                      <input 
                          type="text" 
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                          placeholder="ENTER CODE"
                          className={`flex-1 ${theme.colors.bg} ${theme.colors.text} border ${theme.colors.border} rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500 transition`}
                      />
                      <button 
                          onClick={handleValidateVoucher}
                          disabled={isValidatingVoucher || !voucherCode}
                          className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition disabled:opacity-50"
                      >
                          Apply
                      </button>
                  </div>
              </div>

              <div className={`border-t ${theme.colors.border} pt-6 mb-8 flex justify-between items-end`}>
                <span className="font-black text-sm uppercase opacity-60 tracking-widest mb-1">Total</span>
                <span className={`font-black text-4xl text-blue-500`}>${totalPrice.toFixed(2)}</span>
              </div>
              
              <button 
                onClick={handleCheckoutClick}
                disabled={!isGift && library && cart.some(g => library.includes(g.id))}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-green-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Proceed to Checkout
              </button>
              
              <Link to="/" className="block text-center mt-6 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-blue-400 transition">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
          <div className={`${theme.colors.card} p-8 rounded-lg shadow-2xl w-full max-w-md border ${theme.colors.border}`}>
            <h3 className={`text-2xl font-bold ${theme.colors.text} mb-6`}>Confirm Purchase</h3>
            
            <div className="space-y-4">
              <p className="opacity-80">
                You are about to purchase <span className={`font-bold ${theme.colors.text}`}>{cart.length} items</span>.
              </p>

              {/* Gifting Toggle */}
              <div className={`${theme.colors.bg} p-4 rounded border ${theme.colors.border} space-y-4`}>
                  <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={isGift}
                        onChange={(e) => setIsGift(e.target.checked)}
                        className={`w-5 h-5 accent-${theme.colors.accent.split('-')[1]}-500`}
                      />
                      <span className={`${theme.colors.text} font-bold flex items-center gap-2`}>
                          <FontAwesomeIcon icon={faGift} className={isGift ? 'text-pink-500' : 'opacity-50'} />
                          This is a gift for a friend
                      </span>
                  </label>

                  {isGift && (
                      <div className="animate-fadeIn">
                          <label className="block opacity-70 text-xs font-bold uppercase mb-2 tracking-wider">Select Friend</label>
                          {friends.length === 0 ? (
                              <p className="text-xs text-red-400 italic">You have no friends yet. Add friends to send gifts!</p>
                          ) : (
                              <select 
                                value={selectedFriendId}
                                onChange={(e) => setSelectedFriendId(e.target.value)}
                                className={`w-full ${theme.colors.card} border ${theme.colors.border} rounded p-2.5 ${theme.colors.text} outline-none focus:border-blue-500 transition`}
                              >
                                  <option value="">-- Choose a Friend --</option>
                                  {friends.map(f => (
                                      <option key={f.id} value={f.id}>{f.name}</option>
                                  ))}
                              </select>
                          )}
                      </div>
                  )}
              </div>

              <div className={`${theme.colors.bg} p-4 rounded border ${theme.colors.border}`}>
                 <div className={`flex justify-between text-lg font-bold ${theme.colors.text}`}>
                    <span>Total:</span>
                    <span className="text-green-400">${totalPrice.toFixed(2)}</span>
                 </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-2">
                  <label className="block opacity-70 text-xs font-bold uppercase mb-2 tracking-wider">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                      <button 
                          onClick={() => setPaymentMethod('CREDIT_CARD')}
                          className={`p-3 rounded border flex items-center justify-center gap-2 transition ${paymentMethod === 'CREDIT_CARD' ? `bg-blue-600/20 border-blue-500 text-blue-400` : `bg-black/20 border-white/10 opacity-60 hover:opacity-100`}`}
                      >
                          <FontAwesomeIcon icon={faCreditCard} /> Card
                      </button>
                      <button 
                          onClick={() => setPaymentMethod('WALLET')}
                          className={`p-3 rounded border flex flex-col items-center justify-center transition ${paymentMethod === 'WALLET' ? `bg-green-600/20 border-green-500 text-green-400` : `bg-black/20 border-white/10 opacity-60 hover:opacity-100`}`}
                      >
                          <div className="flex items-center gap-2">
                              {/* <FontAwesomeIcon icon={faWallet} /> */}
                              <span>Wallet</span>
                          </div>
                          <span className="text-xs opacity-70">${Number(user?.walletBalance || 0).toFixed(2)}</span>
                      </button>
                  </div>
                  {paymentMethod === 'WALLET' && Number(user?.walletBalance || 0) < totalPrice && (
                      <p className="text-red-400 text-xs mt-1">Insufficient balance. <Link to="/wallet" className="underline font-bold">Top up here</Link></p>
                  )}
              </div>

              <div className="text-sm opacity-60 italic">
                This is a dummy transaction. No real money will be charged.
              </div>

              <button 
                onClick={handleConfirmCheckout}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded shadow-lg transition disabled:opacity-50 flex justify-center items-center gap-2 mt-6"
              >
                {isProcessing ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Processing Payment...
                  </>
                ) : 'Complete Purchase'}
              </button>
              
              <button 
                onClick={() => setIsCheckoutModalOpen(false)}
                disabled={isProcessing}
                className="w-full opacity-60 hover:opacity-100 text-sm mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
