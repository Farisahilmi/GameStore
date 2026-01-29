import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCreditCard, faSpinner, faCheckCircle, faGamepad, faBook, faGift, faUser } from '@fortawesome/free-solid-svg-icons';

const Cart = ({ cart, removeFromCart, clearCart, library }) => {
  const navigate = useNavigate();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [purchasedGames, setPurchasedGames] = useState([]);
  
  const [isGift, setIsGift] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriendId, setSelectedFriendId] = useState('');
  const [recipientName, setRecipientName] = useState('');

  const totalPrice = cart.reduce((sum, game) => sum + Number(game.finalPrice || game.price), 0);

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
        setFriends(res.data.data);
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

    setIsProcessing(true);
    const token = localStorage.getItem('token');

    try {
      const res = await axios.post('/api/transactions', { 
        gameIds: cart.map(g => g.id),
        recipientId: isGift ? parseInt(selectedFriendId) : null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPurchasedGames(res.data.data.games);
      setRecipientName(res.data.data.recipient?.name || '');
      setIsProcessing(false);
      setIsCheckoutModalOpen(false);
      setIsSuccess(true);
      clearCart();
      toast.success(isGift ? 'Gift sent successfully!' : 'Purchase successful!');
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      toast.error(err.response?.data?.error || 'Checkout failed');
    }
  };

  if (isSuccess) {
      return (
          <div className="min-h-screen bg-steam-dark text-white flex flex-col items-center justify-center p-4">
              <div className="bg-steam-light p-10 rounded-xl border border-gray-700 shadow-2xl max-w-2xl w-full text-center">
                  <div className="text-green-500 text-7xl mb-6">
                      <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                  <h2 className="text-4xl font-bold mb-2">{isGift ? 'Gift Sent!' : 'Thank You!'}</h2>
                  <p className="text-gray-400 text-lg mb-8">
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

                  <div className="mt-10 pt-8 border-t border-gray-700">
                      <h4 className="text-gray-500 font-bold uppercase text-xs tracking-widest mb-4">Purchased Games</h4>
                      <div className="flex flex-wrap justify-center gap-4">
                          {purchasedGames.map(game => (
                              <div key={game.id} className="text-sm bg-steam-dark px-3 py-1 rounded-full border border-gray-600 text-gray-300">
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
      <div className="min-h-screen bg-steam-dark text-white flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
        <p className="text-gray-400 mb-8">Looks like you haven't added any games yet.</p>
        <Link to="/" className="bg-steam-accent hover:bg-blue-400 text-white px-6 py-3 rounded font-bold transition">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-steam-dark text-white pt-10 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 border-b border-gray-700 pb-4">Your Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((game, index) => (
              <div key={`${game.id}-${index}`} className="bg-steam-light p-4 rounded-lg flex items-center gap-4 border border-gray-700">
                <img src={game.imageUrl} alt={game.title} className="w-24 h-14 object-cover rounded" />
                <div className="flex-grow">
                  <h3 className="font-bold text-lg">{game.title}</h3>
                  <div className="flex gap-2 text-xs text-gray-400">
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
                    className="text-xs text-gray-400 hover:text-white underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="bg-steam-light p-6 rounded-lg h-fit border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-white">Summary</h3>
            <div className="flex justify-between mb-2 text-gray-300">
              <span>Items ({cart.length})</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-6 text-gray-300">
              <span>Tax</span>
              <span>$0.00</span>
            </div>
            <div className="border-t border-gray-600 pt-4 mb-6 flex justify-between items-center">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-2xl text-white">${totalPrice.toFixed(2)}</span>
            </div>
            <button 
              onClick={handleCheckoutClick}
              disabled={!isGift && library && cart.some(g => library.includes(g.id))}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Checkout
            </button>
            <Link to="/" className="block text-center mt-4 text-gray-400 hover:text-white text-sm">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
          <div className="bg-steam-light p-8 rounded-lg shadow-2xl w-full max-w-md border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">Confirm Purchase</h3>
            
            <div className="space-y-4">
              <p className="text-gray-300">
                You are about to purchase <span className="font-bold text-white">{cart.length} items</span>.
              </p>

              {/* Gifting Toggle */}
              <div className="bg-steam-dark p-4 rounded border border-gray-700 space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={isGift}
                        onChange={(e) => setIsGift(e.target.checked)}
                        className="w-5 h-5 accent-steam-accent"
                      />
                      <span className="text-white font-bold flex items-center gap-2">
                          <FontAwesomeIcon icon={faGift} className={isGift ? 'text-pink-500' : 'text-gray-500'} />
                          This is a gift for a friend
                      </span>
                  </label>

                  {isGift && (
                      <div className="animate-fadeIn">
                          <label className="block text-gray-400 text-xs font-bold uppercase mb-2 tracking-wider">Select Friend</label>
                          {friends.length === 0 ? (
                              <p className="text-xs text-red-400 italic">You have no friends yet. Add friends to send gifts!</p>
                          ) : (
                              <select 
                                value={selectedFriendId}
                                onChange={(e) => setSelectedFriendId(e.target.value)}
                                className="w-full bg-steam-light border border-gray-600 rounded p-2.5 text-white outline-none focus:border-steam-accent transition"
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

              <div className="bg-steam-dark p-4 rounded border border-gray-600">
                 <div className="flex justify-between text-lg font-bold text-white">
                    <span>Total:</span>
                    <span className="text-green-400">${totalPrice.toFixed(2)}</span>
                 </div>
              </div>

              <div className="text-sm text-gray-400 italic">
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
                className="w-full text-gray-400 hover:text-white text-sm mt-2"
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
