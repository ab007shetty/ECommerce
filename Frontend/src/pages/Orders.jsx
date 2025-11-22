// src/pages/Orders.jsx
import { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { Package, MapPin, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
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
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Processing: 'bg-blue-100 text-blue-800 border-blue-200',
      Shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      Delivered: 'bg-green-100 text-green-800 border-green-200',
      Cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Orders</h1>
          <p className="text-gray-600">{orders.length} orders found</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-xl text-gray-600">No orders yet</p>
            <p className="text-gray-500 mt-2">Start shopping to see your orders here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Order ID: <span className="font-semibold text-gray-800">#{order._id.slice(-8)}</span></p>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {expandedOrder === order._id ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="space-y-3 mb-4">
                    {order.orderItems.slice(0, expandedOrder === order._id ? undefined : 2).map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-contain rounded-lg bg-white" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-gray-800">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                    {order.orderItems.length > 2 && expandedOrder !== order._id && (
                      <p className="text-sm text-gray-600 text-center py-2">
                        +{order.orderItems.length - 2} more items
                      </p>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {expandedOrder === order._id && (
                    <div className="border-t border-gray-200 pt-4 mt-4 space-y-4">
                      {/* Shipping Address */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-800">Shipping Address</h3>
                        </div>
                        <p className="text-sm text-gray-700">
                          {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                        </p>
                        <p className="text-sm text-gray-700">{order.shippingAddress.country}</p>
                      </div>

                      {/* Payment Details */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                        <div className="flex items-center space-x-2 mb-2">
                          <CreditCard className="w-5 h-5 text-green-600" />
                          <h3 className="font-semibold text-gray-800">Payment Details</h3>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Method:</span>
                            <span className="font-semibold text-gray-800">{order.paymentMethod}</span>
                          </div>
                          {order.couponCode && (
                            <div className="flex justify-between text-green-600">
                              <span>Coupon Applied:</span>
                              <span className="font-semibold">{order.couponCode} (-₹{order.discount.toFixed(2)})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Total Amount */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
                    <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      ₹{order.totalAmount.toLocaleString()}
                    </span>
                  </div>
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