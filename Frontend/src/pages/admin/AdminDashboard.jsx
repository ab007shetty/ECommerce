// Frontend/src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Tag, DollarSign } from 'lucide-react';
import { productAPI, orderAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        productAPI.getAll({}),
        orderAPI.getAll(),
      ]);
      const orders = ordersRes.data.data;
      const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const pending = orders.filter(o => o.orderStatus === 'Pending').length;
      setStats({
        totalProducts: productsRes.data.data.length,
        totalOrders: orders.length,
        pendingOrders: pending,
        revenue,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, link }) => (
    <Link to={link} className="block">
      <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
          </div>
          <div className={`p-4 rounded-full ${color}`}>
            <Icon className="text-white text-2xl" />
          </div>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your e-commerce platform</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Package}
            title="Total Products"
            value={stats.totalProducts}
            color="bg-blue-500"
            link="/admin/products"
          />
          <StatCard
            icon={ShoppingBag}
            title="Total Orders"
            value={stats.totalOrders}
            color="bg-green-500"
            link="/admin/orders"
          />
          <StatCard
            icon={Tag}
            title="Pending Orders"
            value={stats.pendingOrders}
            color="bg-yellow-500"
            link="/admin/orders"
          />
          <StatCard
            icon={DollarSign}
            title="Total Revenue"
            value={`₹${stats.revenue.toLocaleString()}`}
            color="bg-purple-500"
            link="/admin/orders"
          />
        </div>
        {/* Admin Menu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/products"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="text-2xl text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Products</h3>
                <p className="text-sm text-gray-600">Manage product catalog</p>
              </div>
            </div>
          </Link>
          <Link
            to="/admin/coupons"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Tag className="text-2xl text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Coupons</h3>
                <p className="text-sm text-gray-600">Manage discount coupons</p>
              </div>
            </div>
          </Link>
          <Link
            to="/admin/orders"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ShoppingBag className="text-2xl text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Orders</h3>
                <p className="text-sm text-gray-600">Manage customer orders</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;