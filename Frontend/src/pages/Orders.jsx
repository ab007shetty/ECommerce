// src/pages/Orders.jsx
import { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { Package, MapPin, CreditCard, ChevronDown, ChevronUp, Truck, Calendar, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await orderAPI.getUserOrders();
      setOrders(data.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Processing: 'bg-blue-100 text-blue-800 border-blue-300',
      Shipped: 'bg-purple-100 text-purple-800 border-purple-300',
      Delivered: 'bg-green-100 text-green-800 border-green-300',
      Cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatPaymentMethod = (method) => {
    const methods = {
      cod: 'Cash on Delivery',
      card: 'Card Payment',
      upi: 'UPI Payment'
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">My Orders</h1>
          <p className="text-gray-600">{orders.length} {orders.length === 1 ? 'order' : 'orders'} placed</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-xl font-semibold text-gray-700 mb-2">No orders yet</p>
            <p className="text-gray-500">Start shopping to see your orders here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-600">
                        Order <span className="font-mono font-semibold">#{order._id.slice(-8).toUpperCase()}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                        className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {expandedOrder === order._id ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.orderItems.slice(0, expandedOrder === order._id ? undefined : 2).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 object-contain rounded-lg bg-gray-50 border border-gray-200 flex-shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                        </div>
                        <p className="font-bold text-gray-800 text-right">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                    {order.orderItems.length > 2 && expandedOrder !== order._id && (
                      <button
                        onClick={() => setExpandedOrder(order._id)}
                        className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2 text-center"
                      >
                        View {order.orderItems.length - 2} more {order.orderItems.length - 2 === 1 ? 'item' : 'items'}
                      </button>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {expandedOrder === order._id && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Shipping Address - Compact */}
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 text-sm mb-1">Delivery Address</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                            </p>
                          </div>
                        </div>

                        {/* Payment & Coupon - Compact */}
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <CreditCard className="w-4 h-4 text-green-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 text-sm mb-1">Payment</h3>
                            <p className="text-sm text-gray-600">{formatPaymentMethod(order.paymentMethod)}</p>
                            {order.couponCode && (
                              <div className="flex items-center gap-1 mt-1">
                                <Tag className="w-3.5 h-3.5 text-green-600" />
                                <span className="text-xs font-semibold text-green-600">
                                  {order.couponCode} (-₹{order.discount.toFixed(2)})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Price Breakdown - Compact */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{order.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Tax (18% GST)</span>
                            <span>₹{order.tax.toFixed(2)}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-green-600 font-medium">
                              <span>Discount</span>
                              <span>-₹{order.discount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-300">
                            <span>Total Paid</span>
                            <span className="text-blue-600">₹{order.totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer - Total Amount (Always Visible) */}
                  {expandedOrder !== order._id && (
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-2">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-0.5">Total Amount</p>
                        <p className="text-xl font-bold text-blue-600">₹{order.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;