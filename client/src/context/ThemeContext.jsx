import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const themes = {
  default: {
    name: 'Steam Dark',
    colors: {
      bg: 'bg-steam-dark',
      text: 'text-steam-text',
      accent: 'text-steam-accent',
      card: 'bg-steam-light',
      border: 'border-gray-700',
      gradient: 'from-[#171a21] via-[#1b2838] to-[#171a21]',
      input: 'bg-black/20 focus:border-steam-accent',
      ring: 'ring-steam-accent/20',
      shadow: 'shadow-[0_20px_50px_rgba(0,0,0,0.3)]',
      glass: 'backdrop-blur-xl bg-black/40 border-white/5'
    }
  },
  light: {
    name: 'Clean Light',
    colors: {
      bg: 'bg-gray-50',
      text: 'text-gray-900',
      accent: 'text-blue-600',
      card: 'bg-white',
      border: 'border-gray-200',
      gradient: 'from-gray-50 via-white to-gray-50',
      input: 'bg-gray-100 focus:border-blue-500',
      ring: 'ring-blue-500/10',
      shadow: 'shadow-[0_10px_30px_rgba(0,0,0,0.05)]',
      glass: 'backdrop-blur-xl bg-white/70 border-gray-200/50'
    }
  },
  cyberpunk: {
    name: 'Cyberpunk',
    colors: {
      bg: 'bg-[#fcee0a]',
      text: 'text-black',
      accent: 'text-[#00f0ff]',
      card: 'bg-black/5',
      border: 'border-black',
      gradient: 'from-[#fcee0a] via-[#fdf24d] to-[#fcee0a]',
      input: 'bg-white/20 focus:border-black',
      ring: 'ring-black/10',
      shadow: 'shadow-[5px_5px_0px_rgba(0,0,0,1)]',
      glass: 'backdrop-blur-md bg-white/10 border-black/20'
    }
  },
  midnight: {
    name: 'Midnight Purple',
    colors: {
      bg: 'bg-[#0a0518]',
      text: 'text-purple-50',
      accent: 'text-purple-400',
      card: 'bg-[#120a2a]',
      border: 'border-purple-900/50',
      gradient: 'from-[#0a0518] via-[#1a0b3c] to-[#0a0518]',
      input: 'bg-purple-950/30 focus:border-purple-500',
      ring: 'ring-purple-500/20',
      shadow: 'shadow-[0_20px_50px_rgba(88,28,135,0.2)]',
      glass: 'backdrop-blur-2xl bg-purple-950/20 border-purple-500/10'
    }
  },
  retro: {
    name: 'Retro Wave',
    colors: {
      bg: 'bg-[#2b003b]',
      text: 'text-[#00ffff]',
      accent: 'text-[#ff00ff]',
      card: 'bg-[#3d0052]',
      border: 'border-[#ff00ff]/30',
      gradient: 'from-[#2b003b] via-[#4a0066] to-[#2b003b]',
      input: 'bg-[#1a0024] focus:border-[#ff00ff]',
      ring: 'ring-[#ff00ff]/20',
      shadow: 'shadow-[0_0_20px_rgba(255,0,255,0.2)]',
      glass: 'backdrop-blur-xl bg-[#2b003b]/40 border-[#ff00ff]/20'
    }
  }
};

export const ThemeProvider = ({ children, user }) => {
  const [currentTheme, setCurrentTheme] = useState('default');

  useEffect(() => {
    if (user && user.theme) {
      setCurrentTheme(user.theme);
    } else {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) setCurrentTheme(savedTheme);
    }
  }, [user]);

  const changeTheme = async (themeKey) => {
    setCurrentTheme(themeKey);
    localStorage.setItem('theme', themeKey);
    
    if (user) {
        try {
            const token = localStorage.getItem('token');
            await axios.put('/api/users/theme', { theme: themeKey }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error('Failed to save theme preference', err);
        }
    }
  };

  const theme = themes[currentTheme] || themes.default;

  useEffect(() => {
    // Extract RGB from Tailwind color class or use a map
    const accentColors = {
      default: '102, 192, 244',   // Steam Blue
      light: '37, 99, 235',     // Blue 600
      cyberpunk: '0, 240, 255',  // Cyan
      midnight: '168, 85, 247',  // Purple 500
      retro: '255, 0, 255'       // Magenta
    };
    
    document.documentElement.style.setProperty('--theme-accent', accentColors[currentTheme] || accentColors.default);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme, theme, themes }}>
      <div className={`min-h-screen transition-all duration-700 ease-in-out ${theme.colors.bg} ${theme.colors.text}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
