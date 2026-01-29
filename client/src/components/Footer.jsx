import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faFacebook, faInstagram, faDiscord } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer className="bg-[#171a21] border-t border-gray-800 pt-16 pb-8 text-sm text-gray-400">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="col-span-1 md:col-span-1">
                <Link to="/" className="text-2xl font-bold tracking-wider text-white flex items-center gap-2 mb-4">
                    <span className="bg-gradient-to-br from-blue-600 to-steam-accent text-transparent bg-clip-text">GAMESTORE</span>
                </Link>
                <p className="mb-6 leading-relaxed">
                    Your ultimate destination for digital games. Discover, play, and connect with a global community of gamers.
                </p>
                <div className="flex gap-4">
                    <a href="#" className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center hover:bg-steam-accent hover:text-white transition"><FontAwesomeIcon icon={faTwitter} /></a>
                    <a href="#" className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition"><FontAwesomeIcon icon={faFacebook} /></a>
                    <a href="#" className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition"><FontAwesomeIcon icon={faInstagram} /></a>
                    <a href="#" className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition"><FontAwesomeIcon icon={faDiscord} /></a>
                </div>
            </div>

            {/* Links Columns */}
            <div>
                <h4 className="text-white font-bold uppercase tracking-wider mb-4">Store</h4>
                <ul className="space-y-2">
                    <li><Link to="/" className="hover:text-steam-accent transition">Home</Link></li>
                    <li><Link to="/news" className="hover:text-steam-accent transition">News & Rumors</Link></li>
                    <li><Link to="/browse" className="hover:text-steam-accent transition">Browse Games</Link></li>
                    <li><Link to="/sales" className="hover:text-steam-accent transition">Special Offers</Link></li>
                </ul>
            </div>

            <div>
                <h4 className="text-white font-bold uppercase tracking-wider mb-4">Support</h4>
                <ul className="space-y-2">
                    <li><Link to="/support" className="hover:text-steam-accent transition">Help Center</Link></li>
                    <li><Link to="/faq" className="hover:text-steam-accent transition">FAQ</Link></li>
                    <li><Link to="/status" className="hover:text-steam-accent transition">System Status</Link></li>
                    <li><Link to="/contact" className="hover:text-steam-accent transition">Contact Us</Link></li>
                </ul>
            </div>

            <div>
                <h4 className="text-white font-bold uppercase tracking-wider mb-4">Legal</h4>
                <ul className="space-y-2">
                    <li><Link to="/privacy" className="hover:text-steam-accent transition">Privacy Policy</Link></li>
                    <li><Link to="/terms" className="hover:text-steam-accent transition">Terms of Service</Link></li>
                    <li><Link to="/cookies" className="hover:text-steam-accent transition">Cookie Policy</Link></li>
                    <li><Link to="/refunds" className="hover:text-steam-accent transition">Refund Policy</Link></li>
                </ul>
            </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} GameStore Corporation. All rights reserved.</p>
            <p className="mt-2 md:mt-0 text-xs text-gray-500">
                All trademarks are property of their respective owners in the US and other countries.
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
