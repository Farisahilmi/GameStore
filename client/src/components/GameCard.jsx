import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faBolt, faStar } from '@fortawesome/free-solid-svg-icons';

const GameCard = ({ game, onBuy, onBuyNow, isOwned }) => {
  const { title, originalPrice, finalPrice, discountTotal, imageUrl, categories, avgRating, reviewCount, activeSaleName } = game;

  return (
    <div className="bg-steam-light rounded-lg overflow-hidden shadow-lg border border-gray-800 hover:border-steam-accent hover:shadow-2xl hover:shadow-steam-accent/20 transition-all duration-300 transform md:hover:-translate-y-2 group h-full flex flex-col">
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-110"
            onError={(e) => e.target.src = 'https://placehold.co/600x400/1a1a1a/ffffff?text=No+Image'}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
        
        {discountTotal > 0 && (
            <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md flex flex-col items-center">
                <span>-{discountTotal}%</span>
                {activeSaleName && <span className="text-[8px] opacity-80 uppercase">{activeSaleName}</span>}
            </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-bold text-white group-hover:text-steam-accent transition-colors truncate flex-1">{title}</h3>
            {avgRating > 0 && (
                <div className="flex items-center gap-1 text-yellow-400 text-xs ml-2">
                    <FontAwesomeIcon icon={faStar} />
                    <span>{avgRating.toFixed(1)}</span>
                </div>
            )}
        </div>

        {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
                {categories.map(cat => (
                    <span key={cat.id} className="bg-gray-700 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide text-gray-300">{cat.name}</span>
                ))}
            </div>
        )}
        
        <div className="mt-auto pt-3 border-t border-gray-700/50">
          <div className="flex justify-between items-end mb-3">
             <div className="flex flex-col">
                {discountTotal > 0 && (
                    <span className="text-xs text-gray-500 line-through">${Number(originalPrice).toFixed(2)}</span>
                )}
                {finalPrice === 0 ? (
                    <span className="text-green-400 font-bold text-lg">Free</span>
                ) : (
                    <span className="text-white font-bold text-lg">${Number(finalPrice).toFixed(2)}</span>
                )}
             </div>
             {reviewCount > 0 && <span className="text-[10px] text-gray-500 italic">{reviewCount} reviews</span>}
          </div>
          
          <div className="flex gap-2">
            {isOwned ? (
                <div className="bg-gray-800 text-gray-400 text-xs font-bold py-2 px-2 rounded flex-1 flex items-center justify-center gap-1 cursor-default border border-gray-700">
                    <span><FontAwesomeIcon icon={faCartPlus} /></span> In Library
                </div>
            ) : (
                <>
                    <button 
                        onClick={onBuy}
                        className="bg-gray-700 hover:bg-steam-accent text-white text-xs font-bold py-2 px-2 rounded transition-colors duration-300 shadow-sm flex-1 flex items-center justify-center gap-1"
                        title="Add to Cart"
                    >
                        <span><FontAwesomeIcon icon={faCartPlus} /></span> Add
                    </button>
                    {onBuyNow && (
                        <button 
                            onClick={onBuyNow}
                            className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2 px-2 rounded transition-colors duration-300 shadow-sm flex-1 flex items-center justify-center gap-1"
                            title="Buy Now"
                        >
                            <span><FontAwesomeIcon icon={faBolt} /></span> Buy
                        </button>
                    )}
                </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
