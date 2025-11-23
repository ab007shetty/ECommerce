// Frontend/src/pages/Cart.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { couponAPI } from '../services/api';
import toast from 'react-hot-toast';

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getTax,
    discount,
    couponCode,
    applyDiscount,
    getFinalTotal,
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setApplying(true);
    try {
      const response = await couponAPI.validate({
        code: couponInput.trim().toUpperCase(),
        cartTotal: getCartTotal(),
        cartItems: cartItems.map(item => ({
          product: item.product._id || item.product,
          quantity: item.quantity,
        })),
      });

      if (response.data.success) {
        const { discountAmount, code } = response.data.data;
        applyDiscount(parseFloat(discountAmount), code);
        toast.success(`Coupon ${code} applied! Saved ₹${discountAmount}`);
        setCouponInput('');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid or inapplicable coupon';
      toast.error(msg);
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    applyDiscount(0, '');
    toast.success('Coupon removed');
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center py-20 px-4">
          <div className="bg-gray-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added anything yet</p>
          <Link
            to="/"
            className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {cartItems.map((item) => {
              const product = item.product;
              const productId = product._id || product;
              const price = Number(product.price);

              return (
                <div
                  key={item._id || productId}
                  className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition"
                >
                  {/* Desktop Layout */}
                  <div className="hidden sm:flex gap-6">
                    {/* Image */}
                    <div className="w-32 h-32 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={product.image || '/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{product.category || 'Uncategorized'}</p>
                      <p className="text-2xl font-bold text-blue-600 mt-3">
                        ₹{price.toLocaleString()}
                      </p>
                    </div>

                    {/* Quantity & Remove */}
                    <div className="flex flex-col items-end gap-4">
                      <div className="flex items-center border-2 border-gray-200 rounded-xl">
                        <button
                          onClick={() => updateQuantity(productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-3 hover:bg-gray-50 disabled:opacity-50 transition"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-6 py-2 font-bold text-lg">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(productId, item.quantity + 1)}
                          disabled={item.quantity >= (product.stock || 999)}
                          className="p-3 hover:bg-gray-50 disabled:opacity-50 transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-800">
                          ₹{(price * item.quantity).toLocaleString()}
                        </p>
                        <button
                          onClick={() => removeFromCart(productId)}
                          className="mt-3 text-red-600 hover:text-red-700 font-medium flex items-center gap-1 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="sm:hidden">
                    {/* Product Info */}
                    <div className="flex gap-3 mb-4">
                      <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={product.image || '/placeholder.jpg'}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-800 line-clamp-2">{product.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{product.category || 'Uncategorized'}</p>
                        <p className="text-lg font-bold text-blue-600 mt-2">
                          ₹{price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-700">Quantity</span>
                      <div className="flex items-center border-2 border-gray-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-2 hover:bg-gray-50 disabled:opacity-50 transition"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-1 font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(productId, item.quantity + 1)}
                          disabled={item.quantity >= (product.stock || 999)}
                          className="p-2 hover:bg-gray-50 disabled:opacity-50 transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Total & Remove */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => removeFromCart(productId)}
                        className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-lg font-bold text-gray-800">
                          ₹{(price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100 lg:sticky lg:top-24">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Order Summary</h2>

              {/* Coupon Section */}
              <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
                <p className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">Have a coupon?</p>

                {couponCode ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="font-bold text-green-800 text-sm sm:text-lg">{couponCode}</span>
                        <span className="text-xs sm:text-sm text-green-700">Applied</span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm sm:text-base"
                      disabled={applying}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={applying || !couponInput.trim()}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition text-sm sm:text-base whitespace-nowrap"
                    >
                      {applying ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-lg">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-semibold">₹{getCartTotal().toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Discount ({couponCode})</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-700">GST (18%)</span>
                  <span className="font-semibold">₹{getTax().toFixed(2)}</span>
                </div>

                <div className="pt-3 sm:pt-4 border-t-2 border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg sm:text-2xl font-bold text-gray-800">Total</span>
                    <span className="text-xl sm:text-3xl font-bold text-blue-600">
                      ₹{getFinalTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-6 sm:mt-8 py-4 sm:py-5 bg-blue-600 text-white text-lg sm:text-xl font-bold rounded-xl hover:bg-blue-700 transition shadow-lg"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/"
                className="block text-center mt-3 sm:mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;