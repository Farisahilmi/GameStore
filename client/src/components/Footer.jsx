import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faFacebook, faInstagram, faDiscord, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();
  return (
    <footer className={`${theme.colors.card} border-t ${theme.colors.border} pt-16 pb-8 text-sm opacity-80 ${theme.colors.text}`}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="col-span-1 md:col-span-1">
                <Link to="/" className={`text-2xl font-bold tracking-wider ${theme.colors.text} flex items-center gap-2 mb-4`}>
                    <span className={`bg-gradient-to-br from-blue-600 to-${theme.colors.accent.split('-')[1]}-500 text-transparent bg-clip-text`}>GAMESTORE</span>
                </Link>
                <p className="mb-6 leading-relaxed opacity-70">
                    Your ultimate destination for digital games. Discover, play, and connect with a global community of gamers.
                </p>
                <div className="flex gap-4">
                    <a href="#" className={`w-8 h-8 rounded bg-black/20 flex items-center justify-center hover:bg-black hover:text-white transition shadow-md hover:shadow-lg hover:-translate-y-1 transform`}><FontAwesomeIcon icon={faXTwitter} /></a>
                    <a href="#" className={`w-8 h-8 rounded bg-black/20 flex items-center justify-center hover:bg-white hover:text-[#1877F2] transition shadow-md hover:shadow-lg hover:-translate-y-1 transform`}><FontAwesomeIcon icon={faFacebook} /></a>
                    <a href="#" className={`w-8 h-8 rounded bg-black/20 flex items-center justify-center hover:bg-gradient-to-tr hover:from-[#fdf497] hover:via-[#fd5949] hover:to-[#d6249f] hover:text-white transition shadow-md hover:shadow-lg hover:-translate-y-1 transform`}><FontAwesomeIcon icon={faInstagram} /></a>
                    <a href="#" className={`w-8 h-8 rounded bg-black/20 flex items-center justify-center hover:bg-[#5865F2] hover:text-white transition shadow-md hover:shadow-lg hover:-translate-y-1 transform`}><FontAwesomeIcon icon={faDiscord} /></a>
                </div>
            </div>

            {/* Links Columns */}
            <div>
                <h4 className={`${theme.colors.text} font-bold uppercase tracking-wider mb-4`}>Store</h4>
                <ul className="space-y-2">
                    <li><Link to="/" className={`hover:${theme.colors.accent} transition`}>Home</Link></li>
                    <li><Link to="/news" className={`hover:${theme.colors.accent} transition`}>News & Rumors</Link></li>
                    <li><Link to="/browse" className={`hover:${theme.colors.accent} transition`}>Browse Games</Link></li>
                    <li><Link to="/sales" className={`hover:${theme.colors.accent} transition`}>Special Offers</Link></li>
                </ul>
            </div>

            <div>
                <h4 className={`${theme.colors.text} font-bold uppercase tracking-wider mb-4`}>Support</h4>
                <ul className="space-y-2">
                    <li><Link to="/support" className={`hover:${theme.colors.accent} transition`}>Help Center</Link></li>
                    <li><Link to="/faq" className={`hover:${theme.colors.accent} transition`}>FAQ</Link></li>
                    <li><Link to="/status" className={`hover:${theme.colors.accent} transition`}>System Status</Link></li>
                    <li><Link to="/contact" className={`hover:${theme.colors.accent} transition`}>Contact Us</Link></li>
                </ul>
            </div>

            <div>
                <h4 className={`${theme.colors.text} font-bold uppercase tracking-wider mb-4`}>Legal</h4>
                <ul className="space-y-2">
                    <li><Link to="/privacy" className={`hover:${theme.colors.accent} transition`}>Privacy Policy</Link></li>
                    <li><Link to="/terms" className={`hover:${theme.colors.accent} transition`}>Terms of Service</Link></li>
                    <li><Link to="/cookies" className={`hover:${theme.colors.accent} transition`}>Cookie Policy</Link></li>
                    <li><Link to="/refunds" className={`hover:${theme.colors.accent} transition`}>Refund Policy</Link></li>
                </ul>
            </div>
        </div>

        <div className={`border-t ${theme.colors.border} pt-8 flex flex-col md:flex-row justify-between items-center opacity-60`}>
            <p>&copy; {new Date().getFullYear()} GameStore Corporation. All rights reserved.</p>
            <p className="mt-2 md:mt-0 text-xs">
                All trademarks are property of their respective owners in the US and other countries.
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
