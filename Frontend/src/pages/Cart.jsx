// src/pages/Cart.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { couponAPI } from '../services/api';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getTax, discount, couponCode, applyDiscount, getFinalTotal } = useCart();
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
      const { data } = await couponAPI.validate({
        code: couponInput,
        cartTotal: getCartTotal(),
        cartItems: cartItems,
      });

      if (data.success) {
        applyDiscount(parseFloat(data.data.discountAmount), data.data.code);
        toast.success(`Coupon applied! You saved ₹${data.data.discountAmount}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code');
    } finally {
      setApplying(false);
    }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded"
                  />

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-gray-600">{item.brand}</p>
                    <p className="text-xl font-bold text-gray-800 mt-2">
                      ₹{item.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="p-2 border rounded hover:bg-gray-100"
                      disabled={item.quantity <= 1}
                    >
                      <Minus />
                    </button>
                    <span className="w-12 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="p-2 border rounded hover:bg-gray-100"
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="text-xl" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Price Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Price Details</h2>

              {/* Coupon Input */}
              <div className="mb-6">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={couponCode}
                  />
                  {!couponCode && (
                    <button
                      onClick={handleApplyCoupon}
                      disabled={applying}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {applying ? 'Applying...' : 'Apply'}
                    </button>
                  )}
                </div>
                {couponCode && (
                  <p className="text-green-600 text-sm mt-2">
                    Coupon "{couponCode}" applied
                  </p>
                )}
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{getCartTotal().toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (GST 18%)</span>
                  <span className="font-semibold">₹{getTax()}</span>
                </div>

                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total</span>
                  <span>₹{getFinalTotal()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-6 py-3 bg-secondary text-white rounded-lg font-semibold hover:bg-yellow-500 transition"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;