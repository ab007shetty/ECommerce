// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  User,
  LogOut,
  Settings,
  Menu,
  X,
  ChevronDown,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState, useEffect, useRef } from 'react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Ref to detect clicks outside dropdown
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <>
      {/* Main Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Always visible */}
            <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                E Commerce
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              {user ? (
                <>
                  {/* User Dropdown - Click to open */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center space-x-3 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-700">
                        {user.name.split(' ')[0]}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform ${
                          dropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                        <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                          <p className="font-bold text-gray-800">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          {isAdmin() && (
                            <span className="inline-block mt-2 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                              Admin
                            </span>
                          )}
                        </div>

                        <div className="py-2">
                          {!isAdmin() && (
                            <Link
                              to="/orders"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center px-5 py-3 text-gray-700 hover:bg-gray-50 transition"
                            >
                              <ShoppingCart className="w-5 h-5 mr-3 text-gray-500" />
                              My Orders
                            </Link>
                          )}
                          {isAdmin() && (
                            <Link
                              to="/admin"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center px-5 py-3 text-gray-700 hover:bg-purple-50 transition font-semibold"
                            >
                              <Settings className="w-5 h-5 mr-3 text-purple-600" />
                              Admin Dashboard
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-5 py-3 text-red-600 hover:bg-red-50 transition"
                          >
                            <LogOut className="w-5 h-5 mr-3" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cart Button */}
                  {!isAdmin() && (
                    <Link
                      to="/cart"
                      className="relative flex items-center space-x-2 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-all group"
                    >
                      <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-indigo-600 transition" />
                      {getItemCount() > 0 && (
                        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
                          {getItemCount()}
                        </span>
                      )}
                      <span className="font-medium text-gray-700">Cart</span>
                    </Link>
                  )}
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="px-6 py-2.5 text-indigo-600 font-semibold hover:bg-indigo-50 rounded-xl transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <Menu className="w-7 h-7 text-gray-700" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Full-Screen Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
                E
              </div>
              <span className="text-2xl font-bold text-indigo-600">Ecommerce</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-7 h-7 text-gray-700" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8">
            {user ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 pb-6 border-b">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-800">{user.name}</p>
                    <p className="text-gray-600">{user.email}</p>
                    {isAdmin() && (
                      <span className="inline-block mt-2 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                </div>

                {!isAdmin() && (
                  <>
                    <Link
                      to="/cart"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-4 py-4 px-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                    >
                      <ShoppingCart className="w-6 h-6 text-indigo-600" />
                      <span className="text-lg font-medium">Cart ({getItemCount()})</span>
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-4 py-4 px-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                    >
                      <ShoppingCart className="w-6 h-6 text-gray-600" />
                      <span className="text-lg font-medium">My Orders</span>
                    </Link>
                  </>
                )}

                {isAdmin() && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-4 py-4 px-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition"
                  >
                    <Settings className="w-6 h-6 text-purple-600" />
                    <span className="text-lg font-bold text-purple-700">Admin Dashboard</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-3 py-4 px-6 bg-red-50 rounded-xl hover:bg-red-100 transition text-red-600 font-medium text-lg"
                >
                  <LogOut className="w-6 h-6" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6 mt-10">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-5 text-xl font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-5 text-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-xl"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;