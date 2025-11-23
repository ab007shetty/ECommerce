// src/components/Navbar.jsx
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  User,
  LogOut,
  Settings,
  Menu,
  X,
  ChevronDown,
  ShoppingBag,
  Search,
  Package,
  Smartphone,
  BookOpen,
  Shirt,
  Grid3x3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState, useEffect, useRef } from 'react';
import { productAPI } from '../services/api';

// Category icon mapping
const getCategoryIcon = (category) => {
  const iconMap = {
    'All': Grid3x3,
    'Electronics': Smartphone,
    'Books': BookOpen,
    'Fashion': Shirt,
  };
  const IconComponent = iconMap[category] || Package;
  return <IconComponent className="w-4 h-4" />;
};

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  // Refs
  const dropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await productAPI.getAll();
        const products = data.data || [];
        const uniqueCategories = [
          'All',
          ...new Set(products.map(p => p.category).filter(Boolean))
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  // Sync URL params with state
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || 'All';
    setSearchInput(urlSearch);
    setSelectedCategory(urlCategory);
  }, [searchParams]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  // Navigate to home page with search params
  const navigateToHome = (newParams) => {
    const isOnHomePage = location.pathname === '/';
    
    if (isOnHomePage) {
      // If already on home page, just update params
      setSearchParams(newParams);
    } else {
      // Navigate to home page with params
      const paramString = newParams.toString();
      navigate(paramString ? `/?${paramString}` : '/');
    }
  };

  // Handle search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    // Update URL params and navigate to home
    const newParams = new URLSearchParams();
    if (value) {
      newParams.set('search', value);
    }
    if (selectedCategory !== 'All') {
      newParams.set('category', selectedCategory);
    }
    
    navigateToHome(newParams);
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCategoryDropdownOpen(false);
    
    // Update URL params and navigate to home
    const newParams = new URLSearchParams();
    if (category !== 'All') {
      newParams.set('category', category);
    }
    if (searchInput) {
      newParams.set('search', searchInput);
    }
    
    navigateToHome(newParams);
  };

  // Clear search
  const clearSearch = () => {
    setSearchInput('');
    const newParams = new URLSearchParams();
    if (selectedCategory !== 'All') {
      newParams.set('category', selectedCategory);
    }
    
    navigateToHome(newParams);
  };

  // Handle mobile category selection
  const handleMobileCategorySelect = (category) => {
    setSelectedCategory(category);
    
    const newParams = new URLSearchParams();
    if (category !== 'All') {
      newParams.set('category', category);
    }
    if (searchInput) {
      newParams.set('search', searchInput);
    }
    
    navigateToHome(newParams);
    setMobileSearchOpen(false);
  };

  // Handle mobile apply filters
  const handleMobileApplyFilters = () => {
    const newParams = new URLSearchParams();
    if (searchInput) {
      newParams.set('search', searchInput);
    }
    if (selectedCategory !== 'All') {
      newParams.set('category', selectedCategory);
    }
    
    navigateToHome(newParams);
    setMobileSearchOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Main Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                E Commerce
              </span>
            </Link>

            {/* Desktop Search Bar with Category Dropdown */}
            <div className="hidden md:flex flex-1 max-w-2xl relative">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-32 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-gray-800 placeholder-gray-400 transition-all"
                />
                
                {/* Category Dropdown Button inside Search */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {searchInput && (
                    <button
                      onClick={clearSearch}
                      className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  
                  <div className="h-6 w-px bg-gray-300"></div>
                  
                  <div className="relative" ref={categoryDropdownRef}>
                    <button
                      onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      {getCategoryIcon(selectedCategory)}
                      <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate">
                        {selectedCategory}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Category Dropdown Menu */}
                    {categoryDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => handleCategorySelect(cat)}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                              selectedCategory === cat ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'
                            }`}
                          >
                            {getCategoryIcon(cat)}
                            <span>{cat}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
              {user ? (
                <>
                  {/* User Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-700 text-sm">
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
                      className="relative flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all group"
                    >
                      <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-indigo-600 transition" />
                      {getItemCount() > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                          {getItemCount()}
                        </span>
                      )}
                    </Link>
                  )}
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-5 py-2 text-indigo-600 font-semibold hover:bg-indigo-50 rounded-xl transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Search & Menu Icons */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <Search className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <Menu className="w-7 h-7 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex flex-col h-full">
            {/* Search Header */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-200">
              <button
                onClick={() => setMobileSearchOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  autoFocus
                  className="w-full pl-11 pr-11 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-gray-800 placeholder-gray-400 transition-all"
                />
                {searchInput && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="p-4 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">Category</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleMobileCategorySelect(cat)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {getCategoryIcon(cat)}
                    <span className="font-medium">{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <div className="p-4">
              <button
                onClick={handleMobileApplyFilters}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

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
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-indigo-600">E Commerce</span>
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