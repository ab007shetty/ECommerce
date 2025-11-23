// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Tag, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { productAPI, orderAPI, couponAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    coupons: 0,
    orders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    inactiveCoupons: 0,
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

        const products = prodRes.data.data || [];
        const orders = orderRes.data.data || [];
        const coupons = couponRes.data.data || [];

        // Calculate revenue
        const totalRevenue = orders.reduce((sum, order) => {
          if (order.status !== 'cancelled') {
            return sum + (order.totalAmount || 0);
          }
          return sum;
        }, 0);

        // Low stock products (stock <= 10)
        const lowStockProducts = products.filter(p => p.stock <= 10).length;

        // Inactive coupons (current date not between validFrom and validUntil)
        const now = new Date();
        const inactiveCoupons = coupons.filter(c => {
          const startDate = new Date(c.validFrom);
          const endDate = new Date(c.validUntil);
          // Inactive if current date is before start or after end
          return now < startDate || now > endDate;
        }).length;

        setStats({
          products: products.length,
          coupons: coupons.length,
          orders: orders.length,
          totalRevenue,
          lowStockProducts,
          inactiveCoupons,
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

  const InsightCard = ({ icon: Icon, title, value, color, bgColor, subtitle }) => (
    <div className={`${bgColor} rounded-xl shadow-md p-6 border border-gray-100`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-lg ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-gray-600 font-medium">{title}</p>
          </div>
          <p className="text-2xl font-bold text-gray-800 ml-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1 ml-1">{subtitle}</p>}
        </div>
      </div>
    </div>
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
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your store at a glance</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Main Stats Cards */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              title="Total Coupons"
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

        {/* Key Insights */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Key Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Low Stock Alert */}
            <InsightCard
              icon={AlertTriangle}
              title="Low Stock Products"
              value={stats.lowStockProducts}
              color="bg-gradient-to-br from-red-500 to-orange-600"
              bgColor="bg-red-50"
              subtitle="Stock ≤ 10 units"
            />

            {/* Inactive Coupons */}
            <InsightCard
              icon={XCircle}
              title="Inactive Coupons"
              value={stats.inactiveCoupons}
              color="bg-gradient-to-br from-gray-500 to-slate-600"
              bgColor="bg-gray-50"
              subtitle="Expired or disabled"
            />

            {/* Total Revenue */}
            <InsightCard
              icon={DollarSign}
              title="Total Revenue"
              value={`₹${stats.totalRevenue.toLocaleString()}`}
              color="bg-gradient-to-br from-green-500 to-emerald-600"
              bgColor="bg-green-50"
              subtitle="Excluding cancelled orders"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;