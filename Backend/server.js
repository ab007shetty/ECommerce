// Backend/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// === CORS Configuration ===
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
  "https://ecommerce-starlfinx.vercel.app",
].filter(Boolean);

// CORS middleware - must be before routes
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("⚠️ Blocked by CORS:", origin);
        callback(null, true); // Allow anyway for debugging - change to false in production
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400, // 24 hours
  })
);

// Handle preflight requests for all routes
app.options("*", cors());

// === Connect Database ===
connectDB();

// === Middleware ===
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// === Request Logger (Development) ===
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// === Root Route ===
app.get("/", (req, res) => {
  res.json({
    message: "ECommerce API Server",
    version: "1.0.0",
    status: "active",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      products: "/api/products",
      coupons: "/api/coupons",
      orders: "/api/orders",
      cart: "/api/cart",
    },
  });
});

// === Health Check Route ===
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// === API Routes ===
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/coupons", require("./routes/coupons"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/cart", require("./routes/cart"));

// === 404 Handler ===
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

// === Global Error Handler ===
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  console.error("Stack:", err.stack);

  const errorResponse = {
    success: false,
    message: err.message || "Internal Server Error",
  };

  if (process.env.NODE_ENV !== "production") {
    errorResponse.stack = err.stack;
  }

  res.status(err.status || 500).json(errorResponse);
});

// === Export for Vercel or Start Server ===
if (process.env.NODE_ENV === "production") {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log("\n" + "=".repeat(50));
    console.log("🚀 Server running successfully!");
    console.log("=".repeat(50));
    console.log(`📌 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`📌 Port: ${PORT}`);
    console.log(`📌 URL: http://localhost:${PORT}`);
    console.log(`📌 Health: http://localhost:${PORT}/api/health`);
    console.log("=".repeat(50) + "\n");
  });
}
