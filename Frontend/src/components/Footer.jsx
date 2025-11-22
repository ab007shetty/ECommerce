// Frontend/src/components/Footer.jsx
import { Link } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & About */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-10 h-10 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">ECommerce</h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Your trusted online shopping destination for quality products at great prices.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="bg-gray-800 hover:bg-indigo-600 p-2 rounded-lg transition-all">
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-blue-400 p-2 rounded-lg transition-all">
                <Twitter className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-pink-600 p-2 rounded-lg transition-all">
                <Instagram className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links - Hidden on mobile */}
          <div className="hidden md:block">
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Orders
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories - Hidden on mobile */}
          <div className="hidden md:block">
            <h3 className="text-white font-semibold text-lg mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/?category=electronics" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/?category=fashion" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Fashion
                </Link>
              </li>
              <li>
                <Link to="/?category=books" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Books
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span className="text-gray-400">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span className="text-gray-400">support@ecommerce.com</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span className="text-gray-400">India</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 text-sm text-gray-400">
            <p>&copy; 2025 ECommerce. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;