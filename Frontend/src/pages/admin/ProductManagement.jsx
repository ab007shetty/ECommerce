// src/pages/admin/ProductManagement.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Edit2, Trash2, ArrowLeft, X,
  Smartphone, Shirt, BookOpen
} from 'lucide-react';
import { productAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Only 3 categories – as you requested
const CATEGORIES = [
  { value: 'Electronics', label: 'Electronics', icon: Smartphone },
  { value: 'Fashion',     label: 'Fashion',     icon: Shirt },
  { value: 'Books',       label: 'Books',       icon: BookOpen },
];

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    image: '',
    stock: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await productAPI.getAll();
      setProducts(data.data || []);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price required';
    if (!formData.image.trim()) newErrors.image = 'Image URL is required';
    if (formData.stock === '' || formData.stock < 0) newErrors.stock = 'Valid stock required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || 'Electronics',
        image: product.image || '',
        stock: product.stock ?? ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Electronics',
        image: '',
        stock: ''
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix all errors');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category,
        image: formData.image.trim(),
        stock: Number(formData.stock)
      };

      if (editingProduct) {
        await productAPI.update(editingProduct._id, payload);
        toast.success('Product updated!');
      } else {
        await productAPI.create(payload);
        toast.success('Product created!');
      }

      setShowModal(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header – Mobile Friendly */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link to="/admin" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-7 h-7 sm:w-8 sm:h-8" />
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Product Management
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">
                  Add, edit or remove products
                </p>
              </div>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md text-sm sm:text-base"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow">
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-200 border-2 border-dashed rounded-xl" />
            <h3 className="text-2xl font-bold mb-2">No Products Yet</h3>
            <button onClick={() => openModal()} className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg">
              <Plus className="w-5 h-5 inline mr-2" />
              Add First Product
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Image</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <img src={p.image || '/placeholder.jpg'} alt={p.name}
                        className="w-16 h-16 object-cover rounded-lg shadow"
                        onError={e => e.target.src = '/placeholder.jpg'} />
                    </td>
                    <td className="px-6 py-4 font-medium">{p.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                        {p.category === 'Electronics' && <Smartphone className="w-4 h-4" />}
                        {p.category === 'Fashion' && <Shirt className="w-4 h-4" />}
                        {p.category === 'Books' && <BookOpen className="w-4 h-4" />}
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">₹{p.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={p.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                        {p.stock} {p.stock <= 5 && p.stock > 0 && '(Low)'}
                      </span>
                    </td>
                    <td className="px-6 py-4 ">
                      <div className="flex gap-4 items-center">
                      <button onClick={() => openModal(p)} className="text-blue-600 hover:text-blue-800">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-5 h-5" />
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL – Fixed top heading, smaller description, 3-field row */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            {/* Extra top padding so heading is never cut */}
            <div className="p-8 pt-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                  <input
                    type="text" name="name" value={formData.name} onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                    placeholder="iPhone 15 Pro"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Description – reduced to 3 rows */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                  <textarea
                    name="description" value={formData.description} onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                    placeholder="Short description..."
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                {/* Price + Stock + Category – ONE ROW */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
                    <input
                      type="number" name="price" value={formData.price} onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                      placeholder="999"
                    />
                    {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Stock *</label>
                    <input
                      type="number" name="stock" value={formData.stock} onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.stock ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                      placeholder="50"
                    />
                    {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                    <select
                      name="category" value={formData.category} onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {CATEGORIES.map(cat => {
                        const Icon = cat.icon;
                        return (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL *</label>
                  <input
                    type="url" name="image" value={formData.image} onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.image ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                    placeholder="https://example.com/product.jpg"
                  />
                  {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                </div>

                {/* Preview */}
                {formData.image && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Preview:</p>
                    <img src={formData.image} alt="Preview"
                      className="w-full max-w-md h-64 object-cover rounded-lg shadow-lg border"
                      onError={e => e.target.src = '/placeholder.jpg'} />
                  </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-70 font-medium">
                    {saving ? 'Saving...' : editingProduct ? 'Update' : 'Create'} Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;