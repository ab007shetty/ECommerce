// Frontend/src/pages/admin/CouponManagement.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, ArrowLeft, X, Tag, CheckCircle, XCircle } from 'lucide-react';
import { couponAPI, productAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
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

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await productAPI.getAll();
      const products = response.data?.data || [];
      const unique = [...new Set(products.map(p => p.category).filter(Boolean))].sort();
      setCategories(unique.length > 0 ? unique : ['Electronics', 'Fashion', 'Books']);
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
    if (formData.validFrom && formData.validUntil && new Date(formData.validUntil) <= new Date(formData.validFrom))
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
        code: coupon.code || '',
        description: coupon.description || '',
        discountType: coupon.discountType || 'percentage',
        discountValue: coupon.discountValue || '',
        minPurchaseAmount: coupon.minPurchaseAmount || '',
        maxDiscountAmount: coupon.maxDiscountAmount || '',
        validFrom: coupon.validFrom ? coupon.validFrom.split('T')[0] : '',
        validUntil: coupon.validUntil ? coupon.validUntil.split('T')[0] : '',
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

  const confirmDelete = (coupon) => {
    setCouponToDelete(coupon);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!couponToDelete) return;
    setDeleting(true);
    try {
      await couponAPI.delete(couponToDelete._id);
      toast.success('Coupon deleted successfully');
      setShowDeleteModal(false);
      setCouponToDelete(null);
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    } finally {
      setDeleting(false);
    }
  };

  const isCouponActive = (coupon) => {
    const now = new Date();
    const from = new Date(coupon.validFrom);
    const until = new Date(coupon.validUntil);
    return now >= from && now <= until;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-8 h-8" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Coupons</h1>
              </div>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-lg transition"
            >
              <Plus className="w-5 h-5" />
              Add
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
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <Tag className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-2xl font-bold mb-2">No Coupons Yet</h3>
            <p className="text-gray-500 mb-6">Create your first discount coupon</p>
            <button onClick={() => openModal()} className="px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-lg font-medium">
              <Plus className="w-6 h-6 inline mr-2" /> Add First Coupon
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => {
              const active = isCouponActive(coupon);
              const appliesToAll = !coupon.applicableCategories || coupon.applicableCategories.length === 0;

              return (
                <div key={coupon._id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <Tag className="w-6 h-6 text-indigo-600" />
                      <h3 className="text-2xl font-bold text-gray-800">{coupon.code}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openModal(coupon)} className="p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => confirmDelete(coupon)} className="p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 text-sm">{coupon.description}</p>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status</span>
                      <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-bold text-indigo-600">
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Min Purchase</span>
                      <span className="font-semibold">₹{coupon.minPurchaseAmount}</span>
                    </div>

                    {coupon.maxDiscountAmount && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Discount</span>
                        <span className="font-semibold">₹{coupon.maxDiscountAmount}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600">Valid Until</span>
                      <span className="font-medium">{new Date(coupon.validUntil).toLocaleDateString()}</span>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        {appliesToAll ? 'Applies to all categories' : `Only: ${coupon.applicableCategories.join(', ')}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Coupon Code *</label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 uppercase ${errors.code ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                      placeholder="SAVE20"
                    />
                    {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                      placeholder="20% off on all items"
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Type</label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Value *</label>
                    <input
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.discountValue ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                      placeholder={formData.discountType === 'percentage' ? "15" : "500"}
                    />
                    {errors.discountValue && <p className="mt-1 text-sm text-red-600">{errors.discountValue}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Min Purchase Amount (₹) *</label>
                    <input
                      type="number"
                      name="minPurchaseAmount"
                      value={formData.minPurchaseAmount}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.minPurchaseAmount ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                      placeholder="1000"
                    />
                    {errors.minPurchaseAmount && <p className="mt-1 text-sm text-red-600">{errors.minPurchaseAmount}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Max Discount Amount (₹)</label>
                    <input
                      type="number"
                      name="maxDiscountAmount"
                      value={formData.maxDiscountAmount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Valid From *</label>
                    <input
                      type="date"
                      name="validFrom"
                      value={formData.validFrom}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.validFrom ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                    />
                    {errors.validFrom && <p className="mt-1 text-sm text-red-600">{errors.validFrom}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Valid Until *</label>
                    <input
                      type="date"
                      name="validUntil"
                      value={formData.validUntil}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.validUntil ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                    />
                    {errors.validUntil && <p className="mt-1 text-sm text-red-600">{errors.validUntil}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Applicable Categories</label>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border-2 border-indigo-200 bg-indigo-50 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.applyToAllCategories}
                        onChange={toggleApplyToAll}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-3 font-medium text-indigo-900">Apply to ALL categories</span>
                    </label>

                    {!formData.applyToAllCategories && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                        {categories.map(cat => (
                          <label
                            key={cat}
                            className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                          >
                            <input
                              type="checkbox"
                              checked={formData.applicableCategories.includes(cat)}
                              onChange={() => handleCategoryToggle(cat)}
                              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm font-medium">{cat}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-8 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-8 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-10 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-70 font-medium transition shadow-lg"
                  >
                    {saving ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Delete Coupon?</h3>
            <p className="text-gray-600 mb-6">
              Permanently delete <span className="font-bold text-indigo-600">"{couponToDelete?.code}"</span>?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium disabled:opacity-70"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;