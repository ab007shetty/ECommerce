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
  Zap,
  BookOpen,
  Shirt,
  Grid3x3
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

// Category icon mapping - only for specific categories
const getCategoryIcon = (category) => {
  const iconMap = {
    'All': Grid3x3,
    'Electronics': Zap,
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
    toast.success('Added to cart!');
  };

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Combined Search Bar & Categories - Sticky on both mobile and desktop */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg sticky top-16 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Mobile: Stacked Layout */}
          <div className="md:hidden space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-12 pr-20 py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 placeholder-gray-500 transition-all shadow-sm"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 w-5 h-5" />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput('');
                    setSearchParams({});
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Categories */}
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-pulse text-gray-500 text-sm">Loading...</div>
              </div>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      category === cat
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
                    }`}
                  >
                    {getCategoryIcon(cat)}
                    <span className="text-sm font-semibold">{cat === 'All' ? 'All' : cat}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop: Single Line Layout */}
          <div className="hidden md:flex items-center justify-between gap-6">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-xl">
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-12 pr-20 py-3.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 placeholder-gray-500 transition-all shadow-sm"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 w-5 h-5" />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput('');
                    setSearchParams({});
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Categories */}
            {loading ? (
              <div className="animate-pulse text-gray-500 text-sm">Loading...</div>
            ) : (
              <div className="flex items-center gap-3 flex-shrink-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                      category === cat
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {getCategoryIcon(cat)}
                    <span>{cat === 'All' ? 'All' : cat}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {category === 'All' ? 'All Products' : category}
            </h2>
            {searchQuery && (
              <p className="text-gray-500 mt-1">
                Results for <span className="font-semibold text-indigo-600">"{searchQuery}"</span>
              </p>
            )}
          </div>
          <div className="hidden md:flex items-center gap-2 text-gray-600">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">{filteredProducts.length} Products</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <ShoppingCart className="w-6 h-6 text-indigo-600 animate-pulse" />
              </div>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 rounded-2xl w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-700">No products found</p>
            <p className="text-gray-500 mt-2">
              {searchQuery ? 'Try searching something else' : 'This category is empty'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-100 hover:border-indigo-200"
              >
                <Link to={`/product/${product._id}`}>
                  <div className="relative h-48 md:h-64 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    <img
                      src={product.image || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => (e.target.src = '/placeholder.jpg')}
                    />
                    {/* Category Tag */}
                    {product.category && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-full shadow-lg">
                        <span className="text-xs font-semibold">{product.category}</span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 hover:text-indigo-600 transition leading-snug min-h-[3rem]">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Description Preview */}
                  {product.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        ₹{product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through ml-2">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-sm">Add to Cart</span>
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