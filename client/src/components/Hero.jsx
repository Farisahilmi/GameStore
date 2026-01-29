import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const Hero = ({ directPurchase }) => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingIndex, setTypingIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Default fallback slides
  const defaultSlides = [
    {
      id: 'default1',
      imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
      title: "Your Next Adventure Starts Here",
      price: 0
    },
    {
      id: 'default2',
      imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=2070&auto=format&fit=crop",
      title: "Discover Indie Gems & Classics",
      price: 0
    },
    {
        id: 'default3',
        imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop",
        title: "Join The Ultimate Gaming Hub",
        price: 0
    }
  ];

  // Fetch games for slides
  useEffect(() => {
    const fetchFeaturedGames = async () => {
        try {
            // Fetch random games or top rated
            const res = await axios.get('/api/games?limit=5');
            const games = res.data.data.games;
            
            if (games.length > 0) {
                // Shuffle array to get random games on refresh
                const shuffled = games.sort(() => 0.5 - Math.random());
                setSlides(shuffled.slice(0, 5));
            } else {
                setSlides(defaultSlides);
            }
        } catch (err) {
            console.error("Failed to fetch hero games", err);
            setSlides(defaultSlides);
        } finally {
            setLoading(false);
        }
    };
    fetchFeaturedGames();
  }, []);

  // Slideshow Effect
  useEffect(() => {
    if (slides.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000); 
    return () => clearInterval(interval);
  }, [slides.length]);

  // Typing Effect
  useEffect(() => {
    if (slides.length === 0) return;
    const text = slides[currentSlide].title;
    
    const typeSpeed = isDeleting ? 50 : 150; 
    
    const typingTimer = setTimeout(() => {
        if (!isDeleting) {
            if (typingIndex < text.length) {
                setDisplayText((prev) => prev + text.charAt(typingIndex));
                setTypingIndex((prev) => prev + 1);
            }
        }
    }, typeSpeed);

    return () => clearTimeout(typingTimer);
  }, [displayText, isDeleting, slides, currentSlide, typingIndex]);

  // Reset typing when slide changes
  useEffect(() => {
      setDisplayText('');
      setTypingIndex(0);
      setIsDeleting(false);
  }, [currentSlide]);

  if (loading || slides.length === 0) return (
      <div className="h-[500px] flex items-center justify-center mb-10 mx-4 mt-6 bg-gray-800 rounded-xl animate-pulse">
          <div className="w-12 h-12 border-4 border-steam-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
  );

  const currentGame = slides[currentSlide];

  return (
    <div className="relative h-[500px] flex items-center mb-10 rounded-xl overflow-hidden shadow-2xl mx-auto max-w-[95%] mt-6 border border-gray-800 group">
      {/* Background Slideshow */}
      {slides.map((slide, index) => (
        <div 
            key={slide.id}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `url('${slide.imageUrl}')` }}
        ></div>
      ))}

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-steam-dark via-steam-dark/90 to-transparent"></div>
      
      {/* Content */}
      <div className="container mx-auto px-12 relative z-10 flex flex-col justify-center pt-24 h-full max-w-4xl mr-auto ml-0 items-start text-left">
        <div className="flex items-center gap-3 mb-4 animate-pulse">
            <span className="text-steam-accent font-bold tracking-widest uppercase text-sm">
                Featured & Recommended
            </span>
            {currentGame.genre && (
                <span className="bg-gray-700/50 text-gray-300 text-xs px-2 py-0.5 rounded border border-gray-600">
                    {currentGame.genre}
                </span>
            )}
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-2xl leading-tight min-h-[160px] md:min-h-[140px] max-w-4xl">
          {displayText}
          <span className="animate-blink border-r-4 border-steam-accent ml-1"></span>
        </h1>

        <p className="text-gray-400 text-lg mb-8 max-w-2xl line-clamp-2 opacity-0 animate-fadeIn" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
            {currentGame.description || "Experience the next generation of gaming with stunning visuals and immersive gameplay."}
        </p>
        
        <div className="text-xl text-gray-300 mb-8 max-w-xl drop-shadow-md leading-relaxed opacity-0 animate-fadeIn flex items-center gap-4" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
          {currentGame.price !== undefined && (
              <div className="bg-black/40 backdrop-blur px-6 py-2 rounded-full border border-gray-600/50 shadow-xl">
                  {Number(currentGame.price) === 0 ? (
                      <span className="text-green-400 font-bold tracking-wide">Free to Play</span>
                  ) : (
                      <span className="text-white font-bold text-2xl tracking-wide">${Number(currentGame.price).toFixed(2)}</span>
                  )}
              </div>
          )}
        </div>
        
        <div className="flex gap-4 opacity-0 animate-fadeIn" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
            <Link to={`/games/${currentGame.id}`} className="bg-gradient-to-r from-blue-600 to-steam-accent hover:from-blue-500 hover:to-blue-400 text-white px-10 py-3 rounded-full text-lg font-bold transition shadow-lg transform hover:scale-105 hover:shadow-steam-accent/50 ring-offset-2 focus:ring-2 ring-steam-accent">
                View Details
            </Link>
            {currentGame.price !== undefined && (
                 <button 
                    onClick={() => directPurchase(currentGame)}
                    className="bg-green-600 hover:bg-green-500 text-white px-10 py-3 rounded-full text-lg font-bold transition shadow-lg border border-green-500 hover:border-green-400 transform hover:scale-105"
                >
                    Buy Now
                </button>
            )}
        </div>
      </div>

      {/* Right Side - Interactive Mini-View */}
      <div className="absolute bottom-8 right-8 hidden lg:flex flex-col gap-4 z-20">
          <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-gray-700 w-[300px] shadow-2xl transform translate-y-10 opacity-0 animate-slideUp" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}>
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Now Trending
              </h3>
              <div className="flex gap-3 items-center group">
                  <img src={currentGame.imageUrl} className="w-16 h-16 object-cover rounded border border-gray-600" alt="thumb" />
                  <div className="flex-1">
                      <div className="text-sm text-gray-300 line-clamp-1 group-hover:text-white transition">{currentGame.title}</div>
                      <div className="text-xs text-steam-accent mt-1">Very Positive (94%)</div>
                  </div>
                  <Link 
                      to={`/games/${currentGame.id}`}
                      className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition backdrop-blur-md shadow-lg"
                      title="View Details"
                  >
                      <FontAwesomeIcon icon={faArrowRight} className="text-sm opacity-80 group-hover:opacity-100 transform group-hover:translate-x-0.5 transition" />
                  </Link>
              </div>
          </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-12 flex gap-2 z-20">
          {slides.map((_, index) => (
              <button 
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-steam-accent' : 'w-2 bg-gray-600 hover:bg-gray-400'}`}
              />
          ))}
      </div>
    </div>
  );
};

export default Hero;
