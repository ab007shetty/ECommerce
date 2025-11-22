// Frontend/src/services/api.js
import axios from "axios";

// Get API URL from environment variable - remove any trailing slashes
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

console.log("🔗 API Base URL:", API_BASE_URL); // Debug log

// Create axios instance with dynamic base URL
const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor - attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Product API
export const productAPI = {
  getAll: (params = {}) => API.get("/products", { params }),
  getById: (id) => API.get(`/products/${id}`),
  create: (data) => API.post("/products", data),
  update: (id, data) => API.put(`/products/${id}`, data),
  delete: (id) => API.delete(`/products/${id}`),
};

// Coupon API
export const couponAPI = {
  getAll: () => API.get("/coupons"),
  create: (data) => API.post("/coupons", data),
  update: (id, data) => API.put(`/coupons/${id}`, data),
  delete: (id) => API.delete(`/coupons/${id}`),
  validate: (data) => API.post("/coupons/validate", data),
};

// Order API
export const orderAPI = {
  create: (data) => API.post("/orders", data),
  getAll: () => API.get("/orders"),
  getUserOrders: () => API.get("/orders/user"),
  updateStatus: (id, status) => API.put(`/orders/${id}/status`, { status }),
};

// Cart API
export const cartAPI = {
  get: () => API.get("/cart"),
  add: (item) => API.post("/cart", item),
  update: (item) => API.put("/cart", item),
  remove: (productId) => API.delete(`/cart/${productId}`),
};

export default API;
