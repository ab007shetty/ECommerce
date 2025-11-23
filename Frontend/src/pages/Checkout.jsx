// src/pages/Checkout.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI, orderAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MapPin, CreditCard, Package, Check, Loader, PartyPopper } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    cartItems, 
    discount, 
    couponCode, 
    getCartTotal, 
    getTax, 
    getFinalTotal, 
    clearCart 
  } = useCart();

  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const orderPlaced = useRef(false); // Track if order was placed

  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');

  useEffect(() => {
    // Only show empty cart error if order hasn't been placed
    if (cartItems.length === 0 && !orderPlaced.current) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
    setLoading(false);
  }, [cartItems, navigate]);

  const subtotal = getCartTotal();
  const tax = getTax();
  const totalAmount = getFinalTotal();

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      toast.error('Please fill all shipping details');
      return;
    }

    setProcessingOrder(true);
    try {
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item.product._id,
          name: item.product.name,
          image: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod,
        subtotal,
        discount,
        couponCode: couponCode || null,
        tax,
        totalAmount,
      };

      await orderAPI.create(orderData);

      if (couponCode) {
        try {
          await fetch('/api/coupons/increment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: couponCode }),
          });
        } catch (err) {
          console.error('Failed to increment coupon usage');
        }
      }

      // Mark order as placed BEFORE clearing cart
      orderPlaced.current = true;
      clearCart();
      setShowSuccessModal(true);
      
      // Redirect after 4 seconds (increased from 3)
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/orders');
      }, 4000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
      orderPlaced.current = false; // Reset if order fails
    } finally {
      setProcessingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center animate-scale-in shadow-2xl">
            <div className="mb-6 flex justify-center animate-bounce-slow">
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full p-8">
                <PartyPopper className="w-20 h-20 text-green-600" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Congratulations! 🎉</h2>
            <p className="text-xl text-gray-700 mb-2 font-medium">Your order has been placed successfully!</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting to your orders...</p>
            <div className="mt-6 flex justify-center">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column - Shipping & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">Shipping Address</h2>
              </div>
              <form className="space-y-4">
                <input type="text" placeholder="Street Address *" value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition" required />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="City *" value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition" required />
                  <input type="text" placeholder="State *" value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="ZIP Code *" value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition" required />
                  <input type="text" placeholder="Country" value={shippingAddress.country} disabled
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50" />
                </div>
              </form>
            </div>

            {/* Payment Method - Compact */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">Payment</h2>
              </div>
              <div className="space-y-2">
                {['cod', 'card', 'upi'].map(method => (
                  <label key={method} className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <input type="radio" name="payment" value={method} checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600" />
                    <span className="ml-3 text-sm font-medium text-gray-800">
                      {method === 'cod' ? 'Cash on Delivery' : method === 'card' ? 'Card' : 'UPI'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Package className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">Order Summary</h2>
              </div>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-4 pb-4 border-b border-gray-100">
                    <img src={item.product.image} alt={item.product.name}
                      className="w-20 h-20 object-contain rounded-lg bg-gray-50 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">{item.product.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {item.quantity} × ₹{item.product.price.toLocaleString()}
                      </p>
                      <p className="text-lg font-bold text-gray-900">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Display */}
              {couponCode && (
                <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-green-800">{couponCode}</span>
                    <span className="text-sm text-green-700">applied</span>
                  </div>
                  <span className="text-green-700 font-semibold">-₹{discount.toFixed(2)}</span>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax (18% GST)</span>
                  <span className="font-medium">₹{tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount ({couponCode})</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-3 border-t-2 border-gray-200 text-gray-900">
                  <span>Total</span>
                  <span className="text-blue-600">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={processingOrder}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl active:scale-95"
              >
                {processingOrder ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin" /> Processing...
                  </span>
                ) : (
                  `Place Order  ₹${totalAmount.toFixed(2)}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.4s ease-out;
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Checkout;