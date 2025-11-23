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
      min: [0, "Discount value cannot be negative"],
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
    usageLimit: {
      type: Number,
      default: null,
      min: [1, "Usage limit must be at least 1"],
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicableCategories: {
      type: [String],
      default: [],
      enum: ["Electronics", "Fashion", "Books", ""],
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Validation: validUntil must be after validFrom
couponSchema.pre("save", function (next) {
  if (this.validUntil <= this.validFrom) {
    next(new Error("Valid until date must be after valid from date"));
  }
  next();
});

// Method to check if coupon is currently valid
couponSchema.methods.isCurrentlyValid = function () {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.validFrom &&
    now <= this.validUntil &&
    (this.usageLimit === null || this.usedCount < this.usageLimit)
  );
};

export default mongoose.model("Coupon", couponSchema);
