// src/services/api.js
import axios from "axios";

// This is the ONLY line you need now
const API = axios.create({
  baseURL: "/api", // Works everywhere: local dev (via proxy) + Vercel production
  withCredentials: true, // Optional: if you plan to use httpOnly cookies later
});

// Automatically attach JWT token from localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
