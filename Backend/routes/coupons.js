// Backend/routes/coupons.js
import express from "express";
const router = express.Router();
import {
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "../controllers/couponController.js";
import { protect, admin } from "../middleware/auth.js";

router.post("/", protect, admin, createCoupon);
router.get("/", protect, admin, getCoupons);
router.put("/:id", protect, admin, updateCoupon);
router.delete("/:id", protect, admin, deleteCoupon);
router.post("/validate", protect, validateCoupon);

export default router;
