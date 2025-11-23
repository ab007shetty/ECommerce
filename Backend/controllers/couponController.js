// Backend/controllers/couponController.js
import Coupon from "../models/Coupon.js";

// Create a new coupon (Admin only)
export const createCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
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

// Get all coupons (Admin only)
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .populate("applicableProducts", "name price")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single coupon by ID
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate(
      "applicableProducts",
      "name price category"
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update coupon (Admin only)
export const updateCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    // If code is being updated, check if new code already exists
    if (code) {
      const existingCoupon = await Coupon.findOne({
        code: code.toUpperCase(),
        _id: { $ne: req.params.id },
      });

      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: "Coupon code already exists",
        });
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { ...req.body, code: code ? code.toUpperCase() : undefined },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete coupon (Admin only)
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Validate and apply coupon (User)
export const validateCoupon = async (req, res) => {
  const { code, cartTotal, cartItems } = req.body;

  try {
    // Find coupon by code
    const coupon = await Coupon.findOne({ code: code.toUpperCase() }).populate(
      "applicableProducts",
      "name price category"
    );

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: "This coupon is currently inactive",
      });
    }

    // Check valid date range
    const now = new Date();
    if (now < coupon.validFrom) {
      return res.status(400).json({
        success: false,
        message: `Coupon valid from ${coupon.validFrom.toLocaleDateString()}`,
      });
    }

    if (now > coupon.validUntil) {
      return res.status(400).json({
        success: false,
        message: "This coupon has expired",
      });
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached",
      });
    }

    // Check minimum purchase amount
    if (cartTotal < coupon.minPurchaseAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase of ₹${coupon.minPurchaseAmount} required`,
      });
    }

    // Check category restrictions
    if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
      const hasApplicableCategory = cartItems.some((item) =>
        coupon.applicableCategories.includes(item.product?.category)
      );

      if (!hasApplicableCategory) {
        return res.status(400).json({
          success: false,
          message: `Coupon only applicable to: ${coupon.applicableCategories.join(
            ", "
          )}`,
        });
      }
    }

    // Check product restrictions
    if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
      const applicableProductIds = coupon.applicableProducts.map((p) =>
        p._id.toString()
      );
      const hasApplicableProduct = cartItems.some((item) =>
        applicableProductIds.includes(item.product?._id?.toString())
      );

      if (!hasApplicableProduct) {
        return res.status(400).json({
          success: false,
          message: "Coupon not applicable to items in cart",
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;

    if (coupon.discountType === "percentage") {
      discountAmount = (coupon.discountValue / 100) * cartTotal;
    } else {
      discountAmount = coupon.discountValue;
    }

    // Apply max discount limit
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }

    // Ensure discount doesn't exceed cart total
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }

    // Return success with discount details
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
    res.status(500).json({
      success: false,
      message: "Server error while validating coupon",
    });
  }
};

// Increment coupon usage (called after successful order)
export const incrementCouponUsage = async (req, res) => {
  const { code } = req.body;

  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    coupon.usedCount += 1;
    await coupon.save();

    res.json({
      success: true,
      message: "Coupon usage updated",
      data: coupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get active coupons for users (public or authenticated)
export const getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
      ],
    }).select("-applicableProducts -__v");

    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
