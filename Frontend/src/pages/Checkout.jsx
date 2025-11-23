// src/pages/Checkout.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI, orderAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MapPin, CreditCard, Package, X, Check, Loader } from 'lucide-react';

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

  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');

  useEffect(() => {
    if (cartItems.length === 0) {
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

      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
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
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
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
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="City *" value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  <input type="text" placeholder="State *" value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="ZIP Code *" value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  <input type="text" placeholder="Country" value={shippingAddress.country} disabled
                    className="w-full px-4 py-3 border rounded-lg bg-gray-50" />
                </div>
              </form>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">Payment Method</h2>
              </div>
              <div className="space-y-3">
                {['cod', 'card', 'upi'].map(method => (
                  <label key={method} className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="payment" value={method} checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-blue-600" />
                    <span className="ml-3 font-medium text-gray-800">
                      {method === 'cod' ? 'Cash on Delivery' : method === 'card' ? 'Credit/Debit Card' : 'UPI Payment'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sticky top-4">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">Order Summary</h2>
              </div>

              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-3 pb-3 border-b border-gray-100">
                    <img src={item.product.image} alt={item.product.name}
                      className="w-16 h-16 object-contain rounded-lg bg-gray-50" />
                    <div className="flex-1">
                      <h3 className="font-medium text-sm truncate">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Coupon Display */}
              {couponCode && (
                <div className="mb-6 p-3 bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-green-800">{couponCode}</span>
                    <span className="text-sm">applied</span>
                  </div>
                  <span className="text-green-700">-₹{discount.toFixed(2)}</span>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (18% GST)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount ({couponCode})</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-3 border-t-2">
                  <span>Total</span>
                  <span className="text-blue-600">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={processingOrder}
                className="w-full py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {processingOrder ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin" /> Processing...
                  </span>
                ) : (
                  `Place Order - ₹${totalAmount.toFixed(2)}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;