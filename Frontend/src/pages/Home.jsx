// src/pages/Home.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { 
  ShoppingCart, 
  Search, 
  Package, 
  TrendingUp, 
  Smartphone,
  BookOpen,
  Shirt,
  Grid3x3,
  X,
  CheckCircle2,
  XCircle,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

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

const Home = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const { addToCart } = useCart();

  // Debounce search input (300ms)
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update URL when debounced search changes
  useEffect(() => {
    if (debouncedSearch) {
      setSearchParams({ search: debouncedSearch });
    } else {
      setSearchParams({});
    }
  }, [debouncedSearch, setSearchParams]);

  // Extract search query from URL
  const searchQuery = searchParams.get('search') || '';

  // Fetch products once
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const { data } = await productAPI.getAll();
        const products = data.data || [];

        setAllProducts(products);

        // Extract unique categories
        const uniqueCategories = [
          'All',
          ...new Set(products.map(p => p.category).filter(Boolean))
        ];
        setCategories(uniqueCategories);

        // Initial render
        applyFilters(products, 'All', '');
      } catch (error) {
        toast.error('Failed to load products');
        setCategories(['All']);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  // Re-apply filters when category or search query changes
  const applyFilters = useCallback((products, selectedCategory, query) => {
    let filtered = [...products];

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredProducts(filtered);
  }, []);

  useEffect(() => {
    applyFilters(allProducts, category, searchQuery);
  }, [category, searchQuery, allProducts, applyFilters]);

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isDropdownOpen && !e.target.closest('.category-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sticky Header Section with Search & Category Dropdown */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Desktop Layout - Search Bar with Dropdown Side by Side */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-gray-800 placeholder-gray-400 transition-all"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="relative category-dropdown">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 px-6 py-3.5 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all min-w-[200px] justify-between"
              >
                <div className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  <span className="font-medium text-gray-700">{category}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
                  {loading ? (
                    <div className="px-4 py-3 text-sm text-gray-400">Loading...</div>
                  ) : (
                    categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleCategorySelect(cat)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                          category === cat ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {getCategoryIcon(cat)}
                        <span>{cat}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Layout - Side by Side */}
          <div className="md:hidden flex items-center gap-2">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-gray-800 placeholder-gray-400 transition-all text-sm"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="relative category-dropdown">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all"
              >
                {getCategoryIcon(category)}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
                  {loading ? (
                    <div className="px-4 py-3 text-sm text-gray-400">Loading...</div>
                  ) : (
                    categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleCategorySelect(cat)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                          category === cat ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {getCategoryIcon(cat)}
                        <span>{cat}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {category === 'All' ? 'All Products' : category}
            </h2>
            {searchQuery && (
              <p className="text-gray-500 mt-1">
                Search results for <span className="font-semibold text-blue-600">"{searchQuery}"</span>
              </p>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{filteredProducts.length} Products</span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-blue-600"></div>
              <ShoppingCart className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-600" />
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="bg-gray-100 rounded-2xl w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? 'Try searching with different keywords' : 'Check back later for new arrivals'}
            </p>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
              >
                {/* Product Image */}
                <Link to={`/product/${product._id}`} className="block">
                  <div className="relative bg-gray-50 aspect-square overflow-hidden">
                    <img
                      src={product.image || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => (e.target.src = '/placeholder.jpg')}
                    />
                  </div>
                </Link>

                {/* Product Details */}
                <div className="p-6">
                  {/* Category & Stock Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {product.category}
                    </span>
                    {product.stock > 0 ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs font-medium">In Stock</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600">
                        <XCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  {/* Product Name */}
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition text-lg leading-tight min-h-[3.5rem]">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Description */}
                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900">
                        ₹{product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                      product.stock > 0
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-xl active:scale-95'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>
                      {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;