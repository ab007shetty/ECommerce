// src/pages/ProductDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { Star, ShoppingCart, Truck, RotateCcw, Shield, Minus, Plus, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await productAPI.getById(id);
      setProduct(data.data);
    } catch (error) {
      toast.error('Failed to load product');
      console.error('Product fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (type) => {
    if (type === 'increment' && quantity < product.stock) {
      setQuantity(quantity + 1);
    } else if (type === 'decrement' && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1); // Reset quantity after adding
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
          <Link to="/" className="text-blue-600 hover:underline">Go back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button & Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="ml-1">Back</span>
          </button>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-800">{product.category}</span>
            <span>/</span>
            <span className="text-gray-800 truncate">{product.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 lg:items-start">
          {/* Product Image */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 aspect-square">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain p-8"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            {/* Main Product Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              {/* Category and Stock Status */}
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg">
                  {product.category}
                </span>
                {product.stock > 0 ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-lg flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                    In Stock
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-lg flex items-center">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Product Name */}
              <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-3">
                {product.name}
              </h1>

              {/* Price Section */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{product.price.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">About this product</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
              </div>

              {/* Quantity and Action Buttons */}
              {product.stock > 0 ? (
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border-2 border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange('decrement')}
                        disabled={quantity <= 1}
                        className="p-2 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-4 h-4 text-gray-700" />
                      </button>
                      <span className="px-5 py-2 font-bold text-sm text-gray-900 border-x-2 border-gray-300 min-w-[50px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange('increment')}
                        disabled={quantity >= product.stock}
                        className="p-2 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                    
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-lg font-semibold text-sm transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-md"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                  
                  <Link
                    to="/cart"
                    className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-lg transition-colors"
                  >
                    Go to Cart
                  </Link>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    disabled
                    className="w-full bg-gray-200 text-gray-500 py-2.5 rounded-lg font-semibold text-sm cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                </div>
              )}
            </div>

            {/* Features Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Why buy from us?</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="font-semibold text-gray-800 text-xs mb-0.5">Free Delivery</p>
                  <p className="text-[10px] text-gray-500">Above ₹999</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <RotateCcw className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="font-semibold text-gray-800 text-xs mb-0.5">Easy Returns</p>
                  <p className="text-[10px] text-gray-500">7 day policy</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="font-semibold text-gray-800 text-xs mb-0.5">Secure Pay</p>
                  <p className="text-[10px] text-gray-500">100% safe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;