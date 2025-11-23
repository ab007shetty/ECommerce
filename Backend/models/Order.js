// Backend/models/Order.js
// ============================================
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product reference is required"],
        },
        name: {
          type: String,
          required: [true, "Product name is required"],
          trim: true,
        },
        image: {
          type: String,
          required: [true, "Product image is required"],
          trim: true,
        },
        price: {
          type: Number,
          required: [true, "Product price is required"],
          min: [0, "Price cannot be negative"],
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [1, "Quantity must be at least 1"],
        },
      },
    ],
    shippingAddress: {
      street: {
        type: String,
        required: [true, "Street address is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
      zipCode: {
        type: String,
        required: [true, "ZIP code is required"],
        trim: true,
      },
      country: {
        type: String,
        required: [true, "Country is required"],
        trim: true,
        default: "India",
      },
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: ["cod", "card", "upi"],
        message: "Payment method must be cod, card, or upi",
      },
      default: "cod",
    },
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    couponCode: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
    },
    tax: {
      type: Number,
      required: [true, "Tax is required"],
      min: [0, "Tax cannot be negative"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    orderStatus: {
      type: String,
      enum: {
        values: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
        message: "Invalid order status",
      },
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ["Pending", "Paid", "Failed", "Refunded"],
        message: "Invalid payment status",
      },
      default: "Pending",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Indexes for faster queries
orderSchema.index({ user: 1, createdAt: -1 }); // For user's order history
orderSchema.index({ orderStatus: 1 }); // For filtering by status
orderSchema.index({ createdAt: -1 }); // For sorting by date

// Virtual to get order item count
orderSchema.virtual("itemCount").get(function () {
  return this.orderItems.reduce((total, item) => total + item.quantity, 0);
});

// Method to mark order as paid
orderSchema.methods.markAsPaid = function () {
  this.isPaid = true;
  this.paidAt = Date.now();
  this.paymentStatus = "Paid";
  return this.save();
};

// Method to mark order as delivered
orderSchema.methods.markAsDelivered = function () {
  this.isDelivered = true;
  this.deliveredAt = Date.now();
  this.orderStatus = "Delivered";
  return this.save();
};

// Pre-save hook to update payment status based on payment method
orderSchema.pre("save", function (next) {
  if (this.paymentMethod === "cod" && this.isNew) {
    this.paymentStatus = "Pending";
  }
  next();
});

// Prevent overwrite if model already exists
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
