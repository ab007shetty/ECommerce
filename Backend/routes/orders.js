// Backend/routes/orders.js
const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  getUserOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, admin } = require("../middleware/auth");

router.post("/", protect, createOrder);
router.get("/", protect, admin, getOrders);
router.get("/user", protect, getUserOrders);
router.put("/:id/status", protect, admin, updateOrderStatus);

module.exports = router;
