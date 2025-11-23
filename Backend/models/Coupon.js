// Backend/models/Coupon.js
import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, "Code must be at least 3 characters"],
      maxlength: [20, "Code cannot exceed 20 characters"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: [0.01, "Discount value must be positive"],
    },
    minPurchaseAmount: {
      type: Number,
      required: true,
      min: [0, "Minimum purchase cannot be negative"],
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
      min: [0, "Max discount cannot be negative"],
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    applicableCategories: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Ensure validUntil > validFrom
couponSchema.pre("save", function (next) {
  if (this.validUntil <= this.validFrom) {
    return next(new Error("Valid until date must be after valid from date"));
  }
  next();
});

// Auto-check if coupon is currently active based on dates
couponSchema.methods.isActiveNow = function () {
  const now = new Date();
  return now >= this.validFrom && now <= this.validUntil;
};

export default mongoose.model("Coupon", couponSchema);
