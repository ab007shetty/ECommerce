// Backend/routes/coupons.js
import express from "express";
const router = express.Router();

import {
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getActiveCoupons,
} from "../controllers/couponController.js";

import { protect, admin } from "../middleware/auth.js";

// Admin Routes (protected + admin only)
router.post("/", protect, admin, createCoupon); // Create coupon
router.get("/", protect, admin, getCoupons); // Get all coupons (admin panel)
router.put("/:id", protect, admin, updateCoupon); // Update coupon
router.delete("/:id", protect, admin, deleteCoupon); // Delete coupon

// User / Public Routes
router.post("/validate", protect, validateCoupon); // Validate coupon in cart
router.get("/active/list", getActiveCoupons); // Public list of active coupons

export default router;
