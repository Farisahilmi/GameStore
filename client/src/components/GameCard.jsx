import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faBolt, faStar, faGamepad } from '@fortawesome/free-solid-svg-icons';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const GameCard = ({ game, onBuy, onBuyNow, isOwned }) => {
  const { theme } = useTheme();
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  function handleMouse(event) {
      const rect = event.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set(event.clientX - centerX);
      y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
      x.set(0);
      y.set(0);
  }

  if (!game) return null; // Defensive check
  const { title, originalPrice, finalPrice, discountTotal, imageUrl, categories, avgRating, reviewCount, activeSaleName } = game;

  return (
    <div style={{ perspective: 1000 }} className="h-full">
    <motion.div 
        onMouseMove={handleMouse}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY }}
        whileHover={{ y: -12, scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`${theme.colors.card} rounded-[2.5rem] overflow-hidden ${theme.colors.shadow} border ${theme.colors.border} hover:border-blue-500/50 transition-all duration-500 group h-full flex flex-col relative`}
    >
      <div className="relative h-52 sm:h-60 overflow-hidden border-b border-white/5">
        <img 
            src={imageUrl || 'https://placehold.co/600x400/1a1a1a/ffffff?text=No+Image'} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
            onError={(e) => e.target.src = 'https://placehold.co/600x400/1a1a1a/ffffff?text=No+Image'}
        />
        
        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>

        {/* Floating Badges */}
        <div className="absolute top-5 left-5 flex flex-col gap-2">
            {discountTotal > 0 && (
                <div className="bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-2xl animate-bounce">
                    -{discountTotal}%
                </div>
            )}
            {activeSaleName && (
                <div className="bg-blue-600 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-xl border border-white/20 shadow-2xl">
                    {activeSaleName}
                </div>
            )}
        </div>

        {avgRating > 0 && (
            <div className="absolute top-5 right-5 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 text-yellow-400 text-[10px] font-black">
                <FontAwesomeIcon icon={faStar} className="text-[10px]" />
                <span>{avgRating.toFixed(1)}</span>
            </div>
        )}
        
        {/* Overlay info on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-white text-[12px] line-clamp-3 leading-relaxed opacity-90 font-medium italic">
                    {game.description || "Click to see more details about this amazing game."}
                </p>
            </div>
        </div>
      </div>
      
      <div className="p-8 flex flex-col flex-grow">
        <h3 className={`text-2xl font-black ${theme.colors.text} mb-4 group-hover:text-blue-400 transition-colors truncate tracking-tighter`}>{title}</h3>

        {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
                {categories.slice(0, 2).map(cat => (
                    <span key={cat.id} className="bg-white/5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] opacity-50 border border-white/5">{cat.name}</span>
                ))}
            </div>
        )}
        
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-6">
             <div className="flex flex-col">
                {discountTotal > 0 && (
                    <span className="text-xs opacity-40 line-through font-bold mb-0.5">${Number(originalPrice).toFixed(2)}</span>
                )}
                {finalPrice === 0 ? (
                    <span className="text-green-400 font-black text-3xl tracking-tighter uppercase">Free</span>
                ) : (
                    <div className="flex items-baseline gap-1">
                        <span className={`font-black text-3xl tracking-tighter ${theme.colors.text}`}>${Number(finalPrice).toFixed(2)}</span>
                        <span className="text-[10px] opacity-30 font-black uppercase">USD</span>
                    </div>
                )}
             </div>
             {reviewCount > 0 && (
                <div className="text-right">
                    <div className="text-[10px] opacity-40 font-black uppercase tracking-widest mb-0.5">{reviewCount} reviews</div>
                    <div className="text-[11px] text-blue-400 font-black uppercase tracking-tighter">Very Positive</div>
                </div>
             )}
          </div>
          
          <div className="flex gap-4">
            {isOwned ? (
                <div className={`bg-white/5 text-gray-400 text-[11px] font-black py-4 px-4 rounded-2xl flex-1 flex items-center justify-center gap-3 border border-white/10 cursor-default`}>
                    <FontAwesomeIcon icon={faGamepad} className="text-sm" /> OWNED
                </div>
            ) : (
                <>
                    <button 
                        onClick={onBuy}
                        className={`bg-white/5 hover:bg-white/10 ${theme.colors.text} text-[11px] font-black py-4 px-4 rounded-2xl transition-all duration-300 flex-1 flex items-center justify-center gap-3 border border-white/10 active:scale-95`}
                        title="Add to Cart"
                    >
                        <FontAwesomeIcon icon={faCartPlus} className="text-sm opacity-60" /> ADD
                    </button>
                    {onBuyNow && (
                        <button 
                            onClick={onBuyNow}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black py-4 px-4 rounded-2xl transition-all duration-300 flex-1 flex items-center justify-center gap-3 shadow-[0_10px_25px_rgba(37,99,235,0.4)] active:scale-95"
                            title="Buy Now"
                        >
                            <FontAwesomeIcon icon={faBolt} className="text-sm" /> BUY
                        </button>
                    )}
                </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
    </div>
  );
};

export default GameCard;
