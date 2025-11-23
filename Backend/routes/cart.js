// Backend/routes/cart.js
// ============================================
import express from "express";
const router = express.Router();
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";

// All routes require authentication
router.use(protect);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/", updateCartItem);
router.delete("/:productId", removeFromCart);

export default router;
