// Frontend/src/pages/admin/CouponManagement.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, ArrowLeft, X, Tag } from 'lucide-react';
import { couponAPI, productAPI } from '../../services/api'; // make sure productAPI exists
import toast from 'react-hot-toast';

const USAGE_LIMIT_OPTIONS = [
  { value: null, label: 'Unlimited' },
  { value: 1, label: '1 time' },
  { value: 2, label: '2 times' },
  { value: 3, label: '3 times' },
  { value: 4, label: '4 times' },
  { value: 5, label: '5 times' },
];

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]); // ← Dynamic from DB
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchaseAmount: '',
    maxDiscountAmount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: null,
    applicableCategories: [],
    applyToAllCategories: true,
  });

  useEffect(() => {
    fetchCoupons();
    fetchCategories();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await couponAPI.getAll();
      setCoupons(data.data || []);
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  // Fetch unique categories from products
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await productAPI.getAll(); // GET /api/products
      const products = response.data?.data || [];
      const unique = [...new Set(products.map(p => p.category).filter(Boolean))].sort();
      setCategories(unique);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Using fallback categories');
      setCategories(['Electronics', 'Fashion', 'Books']);
    } finally {
      setLoadingCategories(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.code.trim()) newErrors.code = 'Coupon code is required';
    else if (formData.code.length < 3) newErrors.code = 'Code must be at least 3 characters';
    
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    if (!formData.discountValue || formData.discountValue <= 0)
      newErrors.discountValue = 'Valid discount value required';
    if (formData.discountType === 'percentage' && formData.discountValue > 100)
      newErrors.discountValue = 'Percentage cannot exceed 100%';
    
    if (!formData.minPurchaseAmount || formData.minPurchaseAmount < 0)
      newErrors.minPurchaseAmount = 'Valid minimum purchase amount required';
    
    if (formData.maxDiscountAmount && formData.maxDiscountAmount < 0)
      newErrors.maxDiscountAmount = 'Max discount cannot be negative';
    
    if (!formData.validFrom) newErrors.validFrom = 'Start date is required';
    if (!formData.validUntil) newErrors.validUntil = 'End date is required';
    if (formData.validFrom && formData.validUntil && 
        new Date(formData.validUntil) <= new Date(formData.validFrom))
      newErrors.validUntil = 'End date must be after start date';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => {
      const updated = prev.applicableCategories.includes(category)
        ? prev.applicableCategories.filter(c => c !== category)
        : [...prev.applicableCategories, category];
      return {
        ...prev,
        applicableCategories: updated,
        applyToAllCategories: updated.length === 0
      };
    });
  };

  const toggleApplyToAll = () => {
    setFormData(prev => ({
      ...prev,
      applyToAllCategories: !prev.applyToAllCategories,
      applicableCategories: prev.applyToAllCategories ? prev.applicableCategories : []
    }));
  };

  const openModal = (coupon = null) => {
    if (coupon) {
      const isAll = !coupon.applicableCategories || coupon.applicableCategories.length === 0;
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minPurchaseAmount: coupon.minPurchaseAmount,
        maxDiscountAmount: coupon.maxDiscountAmount || '',
        validFrom: coupon.validFrom.split('T')[0],
        validUntil: coupon.validUntil.split('T')[0],
        usageLimit: coupon.usageLimit || null,
        applicableCategories: isAll ? [] : (coupon.applicableCategories || []),
        applyToAllCategories: isAll,
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minPurchaseAmount: '',
        maxDiscountAmount: '',
        validFrom: '',
        validUntil: '',
        usageLimit: null,
        applicableCategories: [],
        applyToAllCategories: true,
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
      const submitData = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minPurchaseAmount: Number(formData.minPurchaseAmount),
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        usageLimit: formData.usageLimit,
        applicableCategories: formData.applyToAllCategories ? [] : formData.applicableCategories,
      };
      
      if (editingCoupon) {
        await couponAPI.update(editingCoupon._id, submitData);
        toast.success('Coupon updated successfully');
      } else {
        await couponAPI.create(submitData);
        toast.success('Coupon created successfully');
      }
      
      setShowModal(false);
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await couponAPI.delete(id);
      toast.success('Coupon deleted successfully');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link to="/admin" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-7 h-7 sm:w-8 sm:h-8" />
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Coupon Management
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">
                  Create and manage discount coupons
                </p>
              </div>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md"
            >
              <Plus className="w-5 h-5" />
              Add Coupon
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
        ) : coupons.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow">
            <Tag className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-2xl font-bold mb-2">No Coupons Yet</h3>
            <p className="text-gray-500 mb-6">Create your first discount coupon</p>
            <button onClick={() => openModal()} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Plus className="w-5 h-5 inline mr-2" /> Add First Coupon
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <div key={coupon._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-xl font-bold text-gray-800">{coupon.code}</h3>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      new Date(coupon.validUntil) >= new Date() && (!coupon.usageLimit || (coupon.usedCount || 0) < coupon.usageLimit)
                        ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {new Date(coupon.validUntil) >= new Date() 
                        ? ((!coupon.usageLimit || (coupon.usedCount || 0) < coupon.usageLimit) ? 'Active' : 'Used Up')
                        : 'Expired'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openModal(coupon)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(coupon._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{coupon.description}</p>
                
                <div className="space-y-2 text-sm border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-semibold text-indigo-600">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min Purchase:</span>
                    <span className="font-semibold">₹{coupon.minPurchaseAmount}</span>
                  </div>
                  {coupon.maxDiscountAmount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Discount:</span>
                      <span className="font-semibold">₹{coupon.maxDiscountAmount}</span>
                    </div>
                  )}
                  {coupon.usageLimit && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Usage:</span>
                      <span className={`font-semibold ${(coupon.usedCount || 0) >= coupon.usageLimit ? 'text-red-600' : 'text-gray-800'}`}>
                        {coupon.usedCount || 0}/{coupon.usageLimit}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">Valid Until:</span>
                    <span className="font-semibold">
                      {new Date(coupon.validUntil).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal - Only changed parts: Usage Limit + Categories */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">
                  {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* All your original fields - unchanged */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Coupon Code *</label>
                  <input type="text" name="code" required value={formData.code} onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 uppercase ${errors.code ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                    placeholder="SAVE10" />
                  {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                  <textarea name="description" required value={formData.description} onChange={handleInputChange} rows="2"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                    placeholder="Get 10% off on all products" />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Type *</label>
                    <select name="discountType" value={formData.discountType} onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Value *</label>
                    <input type="number" name="discountValue" required value={formData.discountValue} onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.discountValue ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                      placeholder={formData.discountType === 'percentage' ? '10' : '100'} />
                    {errors.discountValue && <p className="mt-1 text-sm text-red-600">{errors.discountValue}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Min Purchase (₹) *</label>
                    <input type="number" name="minPurchaseAmount" required value={formData.minPurchaseAmount} onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.minPurchaseAmount ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                      placeholder="500" />
                    {errors.minPurchaseAmount && <p className="mt-1 text-sm text-red-600">{errors.minPurchaseAmount}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Max Discount (₹)</label>
                    <input type="number" name="maxDiscountAmount" value={formData.maxDiscountAmount} onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Optional" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Valid From *</label>
                    <input type="date" name="validFrom" required value={formData.validFrom} onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.validFrom ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`} />
                    {errors.validFrom && <p className="mt-1 text-sm text-red-600">{errors.validFrom}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Valid Until *</label>
                    <input type="date" name="validUntil" required value={formData.validUntil} onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.validUntil ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`} />
                    {errors.validUntil && <p className="mt-1 text-sm text-red-600">{errors.validUntil}</p>}
                  </div>
                </div>

                {/* Usage Limit - Only 1 to 5 + Unlimited */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Usage Limit</label>
                  <select name="usageLimit" value={formData.usageLimit || ''} onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {USAGE_LIMIT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Categories - Checkboxes Only */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Applicable Categories (Optional)</label>
                  <p className="text-xs text-gray-500 mb-3">Leave all unchecked to apply to all categories</p>
                  {loadingCategories ? (
                    <p className="text-sm text-gray-500">Loading categories...</p>
                  ) : categories.length === 0 ? (
                    <p className="text-sm text-amber-600">No categories found</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.applyToAllCategories}
                          onChange={toggleApplyToAll}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm font-medium">All</span>
                      </label>

                      {categories.map(cat => (
                        <label key={cat} className={`flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          formData.applyToAllCategories ? 'opacity-50 cursor-not-allowed' : ''
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.applicableCategories.includes(cat)}
                            onChange={() => handleCategoryToggle(cat)}
                            disabled={formData.applyToAllCategories}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50"
                          />
                          <span className="ml-2 text-sm font-medium">{cat}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-70 font-medium">
                    {saving ? 'Saving...' : editingCoupon ? 'Update' : 'Create'} Coupon
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

export default CouponManagement;