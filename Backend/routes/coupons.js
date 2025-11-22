// Backend/routes/coupons.js
const express = require("express");
const router = express.Router();
const {
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} = require("../controllers/couponController");
const { protect, admin } = require("../middleware/auth");

router.post("/", protect, admin, createCoupon);
router.get("/", protect, admin, getCoupons);
router.put("/:id", protect, admin, updateCoupon);
router.delete("/:id", protect, admin, deleteCoupon);
router.post("/validate", protect, validateCoupon);

module.exports = router;
