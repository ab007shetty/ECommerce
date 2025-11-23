// Backend/controllers/couponController.js
import Coupon from "../models/Coupon.js";
import Product from "../models/Product.js"; // ADDED - Import Product model

// Create Coupon
export const createCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon code already exists" });
    }

    const coupon = new Coupon({
      ...req.body,
      code: code.toUpperCase(),
    });

    await coupon.save();
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get All Coupons (Admin)
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Coupon
export const updateCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    if (code) {
      const exists = await Coupon.findOne({
        code: code.toUpperCase(),
        _id: { $ne: req.params.id },
      });
      if (exists) {
        return res
          .status(400)
          .json({ success: false, message: "Coupon code already exists" });
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { ...req.body, code: code ? code.toUpperCase() : undefined },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    res.json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Coupon
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }
    res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Validate Coupon
export const validateCoupon = async (req, res) => {
  const { code, cartTotal, cartItems } = req.body;

  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid coupon code" });
    }

    // Auto active check by date
    if (!coupon.isActiveNow()) {
      return res
        .status(400)
        .json({ success: false, message: "This coupon is not active" });
    }

    if (cartTotal < coupon.minPurchaseAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase of ₹${coupon.minPurchaseAmount} required`,
      });
    }

    // ──────────────── CATEGORY VALIDATION (FIXED) ────────────────
    // If applicableCategories array has items, validate against cart
    if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
      // Extract product IDs from cart items
      const productIds = cartItems.map((item) => {
        // Handle both populated and unpopulated product references
        if (typeof item.product === "object" && item.product._id) {
          return item.product._id;
        }
        return item.product;
      });

      // Fetch actual products from database to get their categories
      const products = await Product.find({
        _id: { $in: productIds },
      }).select("category");

      // Extract categories from the fetched products
      const cartCategories = products.map((p) => p.category).filter(Boolean); // Remove null/undefined categories

      // Check if any cart category matches the coupon's applicable categories
      const hasMatchingCategory = cartCategories.some((cartCat) =>
        coupon.applicableCategories.includes(cartCat)
      );

      if (!hasMatchingCategory) {
        return res.status(400).json({
          success: false,
          message: `Coupon only applicable to: ${coupon.applicableCategories.join(
            ", "
          )}`,
        });
      }
    }
    // If applicableCategories is empty → applies to ALL categories → allowed

    // Calculate discount
    let discountAmount =
      coupon.discountType === "percentage"
        ? (coupon.discountValue / 100) * cartTotal
        : coupon.discountValue;

    // Apply max discount cap if set
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }

    // Discount cannot exceed cart total
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }

    res.json({
      success: true,
      data: {
        code: coupon.code,
        description: coupon.description,
        discountAmount: Math.round(discountAmount * 100) / 100,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        finalAmount: Math.round((cartTotal - discountAmount) * 100) / 100,
      },
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get active public coupons (optional)
export const getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    }).select(
      "code description discountType discountValue minPurchaseAmount validUntil applicableCategories"
    );

    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
