// ============================================
// Backend/models/Cart.js
// ============================================
import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true, // Each user can have only one cart
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product is required"],
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [1, "Quantity must be at least 1"],
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Index for faster queries
cartSchema.index({ user: 1 });

// Virtual to calculate cart total
cartSchema.virtual("cartTotal").get(function () {
  return this.items.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);
});

// Method to get total items count
cartSchema.methods.getTotalItems = function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
};

// Prevent overwrite if model already exists
const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

export default Cart;
