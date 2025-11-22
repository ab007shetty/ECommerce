// Backend/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");

dotenv.config();

const app = express();

// === CORS Configuration (Critical for Vercel + Frontend) ===
const allowedOrigins = [
  "http://localhost:3000", // Local development
  "http://localhost:5173", // Vite default
  "https://ecommerce-starlfinx.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // If you're using cookies/auth later
  })
);

// Optional: Extra safety header
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// === Connect Database ===
connectDB();

// === Middleware ===
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// === API Routes ===
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/coupons", require("./routes/coupons"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/cart", require("./routes/cart"));

// === Health Check Route ===
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend is running!" });
});

// === Catch-all for Vercel Serverless Functions ===
if (process.env.NODE_ENV === "production") {
  // Important: Export for Vercel
  module.exports = app;
} else {
  // Local development
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
    console.log(`Local: http://localhost:${PORT}`);
  });
}

// === Global Error Handler ===
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});
