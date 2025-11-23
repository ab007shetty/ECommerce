// ============================================
// Backend/routes/orders.js
// ============================================
import express from "express";
const router = express.Router();
import {
  createOrder,
  getOrders,
  getUserOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/auth.js";

// User routes
router.post("/", protect, createOrder);
router.get("/user", protect, getUserOrders);

// Admin routes
router.get("/", protect, admin, getOrders);
router.put("/:id/status", protect, admin, updateOrderStatus);

export default router;
