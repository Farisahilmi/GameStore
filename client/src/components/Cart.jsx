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
      <div className={`min-h-screen ${theme.colors.bg} ${theme.colors.text} flex flex-col items-center justify-center`}>
        <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
        <p className="opacity-70 mb-8">Looks like you haven&apos;t added any games yet.</p>
        <Link to="/" className={`${theme.colors.accent.replace('text-', 'bg-')} hover:bg-blue-500 text-white px-6 py-3 rounded font-bold transition`}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.colors.bg} ${theme.colors.text} pt-10 pb-20 px-4`}>
      <div className="container mx-auto max-w-4xl">
        <h1 className={`text-3xl font-bold mb-8 border-b ${theme.colors.border} pb-4`}>Your Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((game, index) => (
              <div key={`${game.id}-${index}`} className={`${theme.colors.card} p-4 rounded-lg flex items-center gap-4 border ${theme.colors.border}`}>
                <img src={game.imageUrl} alt={game.title} className="w-24 h-14 object-cover rounded" />
                <div className="flex-grow">
                  <h3 className="font-bold text-lg">{game.title}</h3>
                  <div className="flex gap-2 text-xs opacity-70">
                     {game.categories?.map(c => c.name).join(', ')}
                  </div>
                  {library && library.includes(game.id) && (
                      <div className="text-xs text-yellow-500 font-bold mt-1">
                          ⚠ Already in Library (Gift Only)
                      </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg mb-1">${Number(game.price).toFixed(2)}</div>
                  <button 
                    onClick={() => removeFromCart(game.id)}
                    className="text-xs opacity-60 hover:opacity-100 underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className={`${theme.colors.card} p-6 rounded-lg h-fit border ${theme.colors.border}`}>
            <h3 className={`text-xl font-bold mb-4 ${theme.colors.text}`}>Summary</h3>
            <div className="flex justify-between mb-2 opacity-70">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {appliedVoucher && (
                <div className="flex justify-between mb-2 text-green-500 font-bold">
                    <span>Voucher ({appliedVoucher.code})</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                </div>
            )}
            <div className="flex justify-between mb-6 opacity-70">
              <span>Tax</span>
              <span>$0.00</span>
            </div>

            {/* Voucher Input */}
            <div className="mb-6">
                <label className="block text-xs font-bold uppercase opacity-50 mb-2">Have a Voucher?</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        placeholder="CODE"
                        className={`flex-1 ${theme.colors.bg} ${theme.colors.text} border ${theme.colors.border} rounded px-3 py-2 text-sm outline-none focus:border-blue-500`}
                    />
                    <button 
                        onClick={handleValidateVoucher}
                        disabled={isValidatingVoucher || !voucherCode}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold transition disabled:opacity-50"
                    >
                        Apply
                    </button>
                </div>
            </div>

            <div className={`border-t ${theme.colors.border} pt-4 mb-6 flex justify-between items-center`}>
              <span className="font-bold text-lg">Total</span>
              <span className={`font-bold text-2xl ${theme.colors.text}`}>${totalPrice.toFixed(2)}</span>
            </div>
            <button 
              onClick={handleCheckoutClick}
              disabled={!isGift && library && cart.some(g => library.includes(g.id))}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Checkout
            </button>
            <Link to="/" className="block text-center mt-4 opacity-60 hover:opacity-100 text-sm">
              Continue Shopping
            </Link>
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
