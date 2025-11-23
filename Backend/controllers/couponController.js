// Backend/controllers/couponController.js
import Coupon from "../models/Coupon.js";

export const createCoupon = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    res.json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    res.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const validateCoupon = async (req, res) => {
  const { code, cartTotal } = req.body;
  try {
    const coupon = await Coupon.findOne({ code });
    if (!coupon) return res.status(400).json({ message: "Invalid coupon" });
    if (!coupon.isActive)
      return res.status(400).json({ message: "Coupon inactive" });
    if (new Date(coupon.validUntil) < new Date())
      return res.status(400).json({ message: "Coupon expired" });
    if (cartTotal < coupon.minPurchaseAmount)
      return res.status(400).json({ message: "Minimum purchase not met" });

    let discountAmount =
      coupon.discountType === "percentage"
        ? (coupon.discountValue / 100) * cartTotal
        : coupon.discountValue;

    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }

    res.json({ success: true, data: { discountAmount, code: coupon.code } });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
