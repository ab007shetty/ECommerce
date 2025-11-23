// src/pages/Home.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Smartphone,
  BookOpen,
  Shirt,
  Grid3x3,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Category icon mapping with default fallback
const getCategoryIcon = (category) => {
  const iconMap = {
    'All': Grid3x3,
    'Electronics': Smartphone,
    'Books': BookOpen,
    'Fashion': Shirt,
  };

  // Use the mapped icon or default to Package icon
  const IconComponent = iconMap[category] || Package;
  return <IconComponent className="w-4 h-4" />;
};

const Home = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();

  // Extract search query and category from URL
  const searchQuery = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';

  // Fetch products once
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const { data } = await productAPI.getAll();
        const products = data.data || [];
        setAllProducts(products);
        
        // Initial render
        applyFilters(products, category, searchQuery);
      } catch (error) {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  // Re-apply filters when category or search query changes
  const applyFilters = useCallback((products, selectedCategory, query) => {
    let filtered = [...products];

    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(lowerQuery)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Clear Search
              </Link>
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
                    <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition text-lg leading-tight">
                      {product.name}
                    </h3>
                  </Link>

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