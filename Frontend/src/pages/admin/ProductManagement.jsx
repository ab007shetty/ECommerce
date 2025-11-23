// src/pages/admin/ProductManagement.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Edit2, Trash2, ArrowLeft, X,
  Smartphone, Shirt, BookOpen, Package
} from 'lucide-react';
import { productAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Icon mapping for known categories
const CATEGORY_ICONS = {
  'Electronics': Smartphone,
  'Fashion': Shirt,
  'Books': BookOpen,
};

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: '', image: '', stock: ''
  });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await productAPI.getAll();
      const productsData = data.data || [];
      setProducts(productsData);
      
      // Extract unique categories from products
      const uniqueCategories = [...new Set(productsData.map(p => p.category).filter(Boolean))].sort();
      setCategories(uniqueCategories);
      
      // Set default category if categories exist
      if (uniqueCategories.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: uniqueCategories[0] }));
      }
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
    
    // Category validation
    if (showCustomCategory) {
      if (!customCategory.trim()) newErrors.category = 'Category name is required';
    } else {
      if (!formData.category) newErrors.category = 'Please select a category';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === '__custom__') {
      setShowCustomCategory(true);
      setCustomCategory('');
      setFormData(prev => ({ ...prev, category: '' }));
    } else {
      setShowCustomCategory(false);
      setCustomCategory('');
      setFormData(prev => ({ ...prev, category: value }));
    }
    if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
  };

  const handleCustomCategoryChange = (e) => {
    const value = e.target.value;
    setCustomCategory(value);
    if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        image: product.image || '',
        stock: product.stock ?? ''
      });
      setShowCustomCategory(false);
      setCustomCategory('');
    } else {
      setEditingProduct(null);
      const defaultCategory = categories.length > 0 ? categories[0] : '';
      setFormData({ 
        name: '', 
        description: '', 
        price: '', 
        category: defaultCategory, 
        image: '', 
        stock: '' 
      });
      setShowCustomCategory(false);
      setCustomCategory('');
    }
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) { toast.error('Please fix all errors'); return; }

    setSaving(true);
    try {
      // Use custom category if entered, otherwise use selected category
      const finalCategory = showCustomCategory ? customCategory.trim() : formData.category;
      
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: finalCategory,
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

  const confirmDelete = (product) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      await productAPI.delete(deletingProduct._id);
      toast.success('Product deleted');
      setShowDeleteModal(false);
      setDeletingProduct(null);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const getCategoryIcon = (category) => {
    const Icon = CATEGORY_ICONS[category] || Package;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/admin" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Yet</h3>
            <p className="text-gray-500 mb-6">Start by adding your first product</p>
            <button onClick={() => openModal()} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Plus className="w-5 h-5 inline mr-2" /> Add First Product
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-xl shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-20 h-20 bg-gray-50 border-2 border-solid border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                          <img
                            src={p.image || '/placeholder.jpg'}
                            alt={p.name}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => e.target.src = '/placeholder.jpg'}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                          {getCategoryIcon(p.category)}
                          {p.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{p.price.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${p.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {p.stock} {p.stock <= 5 && p.stock > 0 && '(Low)'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => openModal(p)} className="text-blue-600 hover:text-blue-800">
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button onClick={() => confirmDelete(p)} className="text-red-600 hover:text-red-800">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {products.map((p) => (
                <div key={p._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4">
                    <div className="flex gap-4">
                      <div className="w-28 h-28 bg-gray-50 border-2 border-solid border-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img
                          src={p.image || '/placeholder.jpg'}
                          alt={p.name}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => e.target.src = '/placeholder.jpg'}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{p.name}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-sm">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium">
                            {getCategoryIcon(p.category)} {p.category}
                          </span>
                          <span className="font-bold text-gray-900">₹{p.price.toLocaleString()}</span>
                          <span className={`font-medium ${p.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Stock: {p.stock}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
                      <button
                        onClick={() => openModal(p)}
                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(p)}
                        className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                    placeholder="iPhone 15 Pro" />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                    placeholder="Short description..." />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                      placeholder="99999" />
                    {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Stock *</label>
                    <input type="number" name="stock" value={formData.stock} onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.stock ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                      placeholder="50" />
                    {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                    {!showCustomCategory ? (
                      <select 
                        name="category" 
                        value={formData.category} 
                        onChange={handleCategoryChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                      >
                        {categories.length === 0 && (
                          <option value="">No categories yet</option>
                        )}
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="__custom__">+ Add New Category</option>
                      </select>
                    ) : (
                      <div className="space-y-2">
                        <input 
                          type="text" 
                          value={customCategory}
                          onChange={handleCustomCategoryChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                          placeholder="Enter new category"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomCategory(false);
                            setCustomCategory('');
                            setFormData(prev => ({ ...prev, category: categories[0] || '' }));
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          ← Back to existing categories
                        </button>
                      </div>
                    )}
                    {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL *</label>
                  <input type="url" name="image" value={formData.image} onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.image ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                    placeholder="https://example.com/product.jpg" />
                  {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                </div>

                {formData.image && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Preview:</p>
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="max-w-full max-h-96 object-contain"
                        onError={e => e.target.src = '/placeholder.jpg'}
                      />
                    </div>
                  </div>
                )}

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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Delete Product?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to permanently delete <span className="font-semibold">"{deletingProduct?.name}"</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium">
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;