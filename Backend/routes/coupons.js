// Backend/routes/coupons.js
import express from "express";
const router = express.Router();
import {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  incrementCouponUsage,
  getActiveCoupons,
} from "../controllers/couponController.js";
import { protect, admin } from "../middleware/auth.js";

// Admin routes
router.post("/", protect, admin, createCoupon);
router.get("/", protect, admin, getCoupons);
router.get("/:id", protect, admin, getCouponById);
router.put("/:id", protect, admin, updateCoupon);
router.delete("/:id", protect, admin, deleteCoupon);

// User routes
router.post("/validate", protect, validateCoupon);
router.post("/increment-usage", protect, incrementCouponUsage);
router.get("/active/list", getActiveCoupons); // Public route

export default router;
