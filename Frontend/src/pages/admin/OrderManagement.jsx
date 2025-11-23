// src/pages/admin/OrderManagement.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  User, 
  MapPin, 
  CreditCard, 
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { orderAPI } from '../../services/api';
import toast from 'react-hot-toast';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [statusStats, setStatusStats] = useState({
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await orderAPI.getAll();
      const orderList = data.data || [];
      setOrders(orderList);
      
      // Calculate status stats
      const stats = {
        pending: orderList.filter(o => o.orderStatus === 'Pending').length,
        processing: orderList.filter(o => o.orderStatus === 'Processing').length,
        shipped: orderList.filter(o => o.orderStatus === 'Shipped').length,
        delivered: orderList.filter(o => o.orderStatus === 'Delivered').length,
        cancelled: orderList.filter(o => o.orderStatus === 'Cancelled').length,
      };
      setStatusStats(stats);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
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

  const StatusCard = ({ icon: Icon, title, count, color, bgColor }) => (
    <div className={`${bgColor} rounded-lg shadow-sm p-2 sm:p-3 border border-gray-100 flex-shrink-0 sm:flex-shrink min-w-[70px] sm:min-w-0`}>
      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
        <div className={`p-2 rounded-lg ${color} flex-shrink-0`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <p className="hidden sm:block text-xs text-gray-600 font-medium truncate">{title}</p>
          <p className="text-base sm:text-lg font-bold text-gray-800">{count}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center space-x-4">
          <Link to="/admin" className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Order Management</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Order Status Overview */}
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">Order Status Overview</h2>
              <div className="grid grid-cols-5 gap-2 sm:flex sm:gap-3 lg:grid lg:grid-cols-5">
                {/* Pending Orders */}
                <StatusCard
                  icon={Clock}
                  title="Pending"
                  count={statusStats.pending}
                  color="bg-gradient-to-br from-yellow-500 to-amber-600"
                  bgColor="bg-yellow-50"
                />

                {/* Processing Orders */}
                <StatusCard
                  icon={Package}
                  title="Processing"
                  count={statusStats.processing}
                  color="bg-gradient-to-br from-blue-500 to-cyan-600"
                  bgColor="bg-blue-50"
                />

                {/* Shipped Orders */}
                <StatusCard
                  icon={Truck}
                  title="Shipped"
                  count={statusStats.shipped}
                  color="bg-gradient-to-br from-indigo-500 to-purple-600"
                  bgColor="bg-indigo-50"
                />

                {/* Delivered Orders */}
                <StatusCard
                  icon={CheckCircle}
                  title="Delivered"
                  count={statusStats.delivered}
                  color="bg-gradient-to-br from-green-500 to-emerald-600"
                  bgColor="bg-green-50"
                />

                {/* Cancelled Orders */}
                <StatusCard
                  icon={XCircle}
                  title="Cancelled"
                  count={statusStats.cancelled}
                  color="bg-gradient-to-br from-red-500 to-pink-600"
                  bgColor="bg-red-50"
                />
              </div>
            </div>

            {/* Orders List */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">All Orders ({orders.length})</h2>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className={`bg-white rounded-xl overflow-hidden transition-all ${expandedOrder === order._id ? 'shadow-xl border-2 border-blue-200' : 'shadow-sm border border-gray-200'}`}>
                    {/* Order Header - Responsive */}
                    <div className="p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toggleOrderDetails(order._id)}>
                      {/* Mobile Layout */}
                      <div className="lg:hidden">
                        <div className="flex gap-3">
                          {/* Left Column: Order ID, Status, Dropdown */}
                          <div className="flex flex-col gap-2 min-w-0">
                            {/* Order ID */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Order ID</p>
                              <p className="text-xs font-mono font-bold text-gray-900">#{order._id.slice(-8).toUpperCase()}</p>
                            </div>

                            {/* Status Badge */}
                            <span className={`px-2.5 py-1.5 inline-flex text-xs font-bold rounded-full border whitespace-nowrap w-fit ${getStatusColor(order.orderStatus)}`}>
                              {order.orderStatus}
                            </span>

                            {/* Update Status Dropdown */}
                            <select
                              value={order.orderStatus}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleStatusChange(order._id, e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs px-2.5 py-1.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400 transition-colors font-medium text-gray-700 cursor-pointer shadow-sm"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>

                          {/* Right Column: Customer Details & Chevron */}
                          <div className="flex-1 min-w-0 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1 min-w-0 mr-2">
                                <p className="text-xs text-gray-500 mb-1">Customer</p>
                                <p className="text-xs font-medium text-gray-900 truncate">{order.user?.name}</p>
                                <p className="text-xs text-gray-500 truncate">{order.user?.email}</p>
                              </div>
                              
                              {/* Chevron Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleOrderDetails(order._id);
                                }}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors flex-shrink-0"
                              >
                                {expandedOrder === order._id ? (
                                  <ChevronUp className="w-5 h-5" />
                                ) : (
                                  <ChevronDown className="w-5 h-5" />
                                )}
                              </button>
                            </div>

                            {/* Total */}
                            <div className="mt-auto">
                              <p className="text-xs text-gray-500 mb-1">Total</p>
                              <p className="text-sm font-bold text-gray-900">₹{order.totalAmount.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden lg:flex lg:items-center gap-4">
                        {/* Order Info Grid */}
                        <div className="flex-1 grid grid-cols-4 gap-4">
                          {/* Order ID */}
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Order ID</p>
                            <p className="text-sm font-mono font-bold text-gray-900">#{order._id.slice(-8).toUpperCase()}</p>
                          </div>

                          {/* Customer */}
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Customer</p>
                            <p className="text-sm font-medium text-gray-900 truncate">{order.user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{order.user?.email}</p>
                          </div>

                          {/* Date */}
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Date</p>
                            <p className="text-sm text-gray-700">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>

                          {/* Total */}
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Total</p>
                            <p className="text-sm font-bold text-gray-900">₹{order.totalAmount.toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Status Badge */}
                          <span className={`px-2.5 py-1.5 inline-flex text-xs font-bold rounded-full border whitespace-nowrap ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>

                          {/* Update Status - Always visible */}
                          <select
                            value={order.orderStatus}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusChange(order._id, e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs px-2.5 py-1.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400 transition-colors font-medium text-gray-700 cursor-pointer shadow-sm"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>

                          {/* View/Hide Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleOrderDetails(order._id);
                            }}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium text-sm whitespace-nowrap px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                          >
                            {expandedOrder === order._id ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                <span>Hide</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                <span>View</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedOrder === order._id && (
                      <div className="border-t-2 border-blue-100 bg-gradient-to-br from-gray-50 to-blue-50/30 p-4">
                        {/* Customer & Shipping - Stack on mobile, side by side on desktop */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                          {/* Customer Info */}
                          <div className="flex gap-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-800 text-sm mb-2">Customer Information</h4>
                              <p className="text-sm text-gray-700 font-medium">{order.user?.name}</p>
                              <p className="text-xs text-gray-500 break-all">{order.user?.email}</p>
                            </div>
                          </div>

                          {/* Shipping Address */}
                          <div className="flex gap-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-green-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-800 text-sm mb-2">Shipping Address</h4>
                              <p className="text-sm text-gray-700 leading-relaxed break-words">
                                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="mb-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                            <Package className="w-5 h-5 text-gray-600" />
                            Order Items ({order.orderItems.length})
                          </h4>
                          <div className="space-y-2">
                            {order.orderItems.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <img src={item.image} alt={item.name} className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded bg-white flex-shrink-0 border border-gray-200" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-800 text-sm line-clamp-1">{item.name}</p>
                                  <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                                </div>
                                <p className="font-bold text-gray-800 text-sm flex-shrink-0">₹{(item.price * item.quantity).toLocaleString()}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="bg-white p-4 rounded-lg border-2 border-blue-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                            <h4 className="font-semibold text-gray-800 text-sm">Payment Summary</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                              <span>Subtotal</span>
                              <span className="font-medium">₹{order.subtotal.toLocaleString()}</span>
                            </div>
                            {order.discount > 0 && (
                              <div className="flex justify-between text-green-600 font-medium">
                                <span>Discount ({order.couponCode})</span>
                                <span>-₹{order.discount.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-gray-600">
                              <span>Tax (GST)</span>
                              <span className="font-medium">₹{order.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t-2 border-gray-300 text-base">
                              <span>Total Amount</span>
                              <span className="text-blue-600">₹{order.totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600 pt-2 border-t border-gray-200">
                              <span>Payment Method</span>
                              <span className="font-semibold uppercase">{order.paymentMethod}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {orders.length === 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No orders found</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;