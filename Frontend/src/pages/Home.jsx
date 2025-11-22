// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { Star, ShoppingCart, Search, Smartphone, Shirt, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { addToCart } = useCart();

  const categories = [
    { name: 'All', icon: ShoppingCart },
    { name: 'Electronics', icon: Smartphone },
    { name: 'Fashion', icon: Shirt },
    { name: 'Books', icon: BookOpen }
  ];

  const urlSearch = searchParams.get('search') || '';

  useEffect(() => {
    fetchProducts();
  }, [category, urlSearch]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category !== 'All') params.category = category;
      if (urlSearch) params.search = urlSearch;

      const { data } = await productAPI.getAll(params);
      const allProducts = data.data || [];
      setProducts(allProducts);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success('Added to cart!');
  };

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      {/* Mobile Search Bar */}
      <div className="md:hidden bg-white shadow-sm sticky top-16 z-40 border-b">
        <div className="px-4 py-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              defaultValue={urlSearch}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const query = e.target.value.trim();
                  if (query) {
                    setSearchParams({ search: query });
                  } else {
                    setSearchParams({});
                  }
                }
              }}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Categories - Center Aligned with Icons */}
      <div className="bg-white shadow-sm sticky top-16 md:top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => setCategory(cat.name)}
                  className={`flex flex-col md:flex-row items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                    category === cat.name
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="w-6 h-6" />
                  <span className="text-sm font-medium whitespace-nowrap">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {category}
        </h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 mx-auto mb-6" />
            <p className="text-xl text-gray-500">No products found</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 group"
              >
                <Link to={`/product/${product._id}`}>
                  <div className="relative h-48 md:h-64 bg-gray-50 overflow-hidden">
                    <img
                      src={product.images[0] || '/api/placeholder/400/400'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.originalPrice && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 hover:text-indigo-600 transition">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 mb-2">{product.brand}</p>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                      {product.rating || 4.2}
                      <Star className="w-3 h-3 ml-1 fill-current" />
                    </div>
                    <span className="text-xs text-gray-500">({product.numReviews || 128})</span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl font-bold text-gray-800">₹{product.price.toLocaleString()}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
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