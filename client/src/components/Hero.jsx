import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faClock } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

import { HeroSkeleton } from './Skeleton';

const CountdownTimer = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();
            if (difference > 0) {
                return {
                    h: Math.floor((difference / (1000 * 60 * 60))),
                    m: Math.floor((difference / 1000 / 60) % 60),
                    s: Math.floor((difference / 1000) % 60),
                };
            }
            return null;
        };

        const timer = setInterval(() => {
            const left = calculateTimeLeft();
            if (left) setTimeLeft(left);
            else clearInterval(timer);
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (timeLeft.h === 0 && timeLeft.m === 0 && timeLeft.s === 0) return null;

    return (
        <div className="flex gap-3 items-center bg-red-600/20 text-red-500 px-5 py-2.5 rounded-2xl border border-red-500/20 backdrop-blur-md animate-pulse">
            <FontAwesomeIcon icon={faClock} className="text-xs" />
            <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-70 leading-none mb-1">Flash Sale Ends</span>
                <span className="text-sm font-black font-mono leading-none tracking-tighter">
                    {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
                </span>
            </div>
        </div>
    );
};

const Hero = ({ directPurchase }) => {
  const { theme } = useTheme();
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
            const games = res.data?.data?.games || [];
            
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

  if (loading || slides.length === 0) return <HeroSkeleton />;

  const currentGame = slides[currentSlide];

  return (
    <div className={`relative h-[400px] md:h-[500px] flex items-center mb-16 rounded-[3rem] overflow-hidden ${theme.colors.shadow} mx-auto max-w-[96%] mt-8 border ${theme.colors.border} group transition-all duration-700`}>
      {/* Background Slideshow */}
      {slides.map((slide, index) => (
        <motion.div 
            key={slide.id}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ 
                opacity: index === currentSlide ? 1 : 0,
                scale: index === currentSlide ? 1 : 1.1,
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${slide.imageUrl}')` }}
        ></motion.div>
      ))}

      {/* Dynamic Overlay Gradient based on theme */}
      <div className={`absolute inset-0 bg-gradient-to-r ${
          theme.name === 'Clean Light' 
          ? 'from-white via-white/40 to-transparent' 
          : 'from-black via-black/40 to-transparent'
      }`}></div>
      
      {/* Content */}
      <div className="container mx-auto px-8 md:px-20 relative z-10 flex flex-col justify-center h-full max-w-6xl mr-auto ml-0 items-start text-left">
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-wrap items-center gap-3 mb-8"
        >
            <span className={`${theme.colors.accent} font-black tracking-[0.3em] uppercase text-[10px] md:text-xs ${theme.colors.glass} px-5 py-2 rounded-full shadow-2xl`}>
                Featured & Recommended
            </span>
            {currentGame.genre && (
                <span className="bg-white/10 backdrop-blur-md text-white/60 text-[10px] md:text-xs px-4 py-2 rounded-full border border-white/10 font-bold">
                    {currentGame.genre}
                </span>
            )}
            {currentGame.flashSaleEnd && new Date(currentGame.flashSaleEnd) > new Date() && (
                <CountdownTimer targetDate={currentGame.flashSaleEnd} />
            )}
        </motion.div>
        
        <motion.h1 
            key={currentGame.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-6xl md:text-8xl lg:text-9xl font-black ${theme.name === 'Clean Light' ? 'text-black' : 'text-white'} mb-8 drop-shadow-2xl leading-[0.9] max-w-4xl tracking-tighter`}
        >
          {displayText}
          <span className={`animate-pulse border-r-[12px] ${theme.colors.accent.replace('text-', 'border-')} ml-3`}></span>
        </motion.h1>

        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.5 }}
            className={`${theme.name === 'Clean Light' ? 'text-gray-800' : 'text-gray-300'} text-xl md:text-2xl mb-12 max-w-2xl line-clamp-2 leading-relaxed font-medium`}
        >
            {currentGame.description || "Experience the next generation of gaming with stunning visuals and immersive gameplay."}
        </motion.p>
        
        <div className="flex flex-col sm:flex-row gap-6">
            <Link 
                to={`/games/${currentGame.id}`} 
                className={`bg-white text-black hover:bg-gray-100 px-14 py-5 rounded-2xl text-xl font-black transition-all duration-500 ${theme.colors.shadow} transform hover:scale-105 hover:-translate-y-2 flex items-center justify-center gap-4 active:scale-95`}
            >
                View Details
            </Link>
            {currentGame.price !== undefined && (
                 <button 
                    onClick={() => directPurchase(currentGame)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-14 py-5 rounded-2xl text-xl font-black transition-all duration-500 shadow-xl transform hover:scale-105 hover:-translate-y-2 flex items-center justify-center gap-4 active:scale-95"
                >
                    <FontAwesomeIcon icon={faBolt} /> Buy Now
                </button>
            )}
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-12 right-12 flex gap-4 z-20">
          {slides.map((_, index) => (
              <button 
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-700 ${
                    index === currentSlide 
                    ? `w-16 ${theme.colors.accent.replace('text-', 'bg-')}` 
                    : 'w-4 bg-white/20 hover:bg-white/40'
                }`}
              />
          ))}
      </div>
    </div>
  );
};

export default Hero;
