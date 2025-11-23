// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Tag, ShoppingBag } from 'lucide-react';
import { productAPI, orderAPI, couponAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    coupons: 0,
    orders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [prodRes, orderRes, couponRes] = await Promise.all([
          productAPI.getAll({}),
          orderAPI.getAll(),
          couponAPI.getAll(),
        ]);

        setStats({
          products: prodRes.data.data.length,
          coupons: couponRes.data.data.length,
          orders: orderRes.data.data.length,
        });
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const DashboardCard = ({ icon: Icon, title, count, link, color }) => (
    <Link to={link}>
      <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-600 text-2xl font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-800 mt-4">{count}</p>
            <p className="text-sm text-gray-500 mt-2">Click to manage</p>
          </div>
          <div className={`p-6 rounded-2xl ${color} shadow-lg`}>
            <Icon className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your store at a glance</p>
        </div>
      </div>

      {/* Only 3 Cards – Products, Coupons, Orders */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Products */}
          <DashboardCard
            icon={Package}
            title="Total Products"
            count={stats.products}
            link="/admin/products"
            color="bg-gradient-to-br from-blue-500 to-cyan-600"
          />

          {/* Coupons */}
          <DashboardCard
            icon={Tag}
            title="Active Coupons"
            count={stats.coupons}
            link="/admin/coupons"
            color="bg-gradient-to-br from-orange-500 to-pink-600"
          />

          {/* Orders */}
          <DashboardCard
            icon={ShoppingBag}
            title="Total Orders"
            count={stats.orders}
            link="/admin/orders"
            color="bg-gradient-to-br from-green-500 to-emerald-600"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;