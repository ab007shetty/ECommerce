# 🛒 E-Commerce Application (MERN Stack)

A full-featured e-commerce platform with Role-Based Access Control (RBAC), admin dashboard, product management, shopping cart, and coupon system.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

### 🛍️ User Features

- **Product Browsing**: Filter by category, search products
- **Shopping Cart**: Add/remove items, quantity management, real-time price calculation
- **Discount System**: Apply coupon codes with validation
- **User Authentication**: JWT-based secure authentication
- **Order Tracking**: View order history and status
- **Responsive Design**: Mobile first professional UI

### 👨‍💼 Admin Features (RBAC)

- **Product Management**: Full CRUD operations for products
- **Coupon Management**: Create, update, delete discount coupons
- **Order Management**: View all orders, update order status
- **Dashboard Analytics**: Overview of products, orders, and revenue
- **Protected Routes**: Admin-only access with role verification

### 🛡️ Security Features

- JWT token authentication
- Password hashing with bcryptjs
- Role-based access control (RBAC)
- Protected API routes
- Input validation
- Secure HTTP headers

## 🚀 Tech Stack

### Backend

- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend

- React 18 with Vite
- React Router v6
- Tailwind CSS
- Axios for API calls
- React Hot Toast for notifications
- Lucide React for Icons

## 📦 Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone Repository

```bash
git clone https://github.com/ab007shetty/ECommerce.git
cd ECommerce
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Install dependencies
npm install
```

Add the following to `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

```bash
# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd Frontend

# Install dependencies
npm install

```

Add the following to frontend `.env`:
```env
VITE_API_URL=http://localhost:5000
```

```bash
# Start frontend development server
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🗂️ Project Structure

```
|-- Backend
|   |-- config
|   |   +-- db.js
|   |-- controllers
|   |   |-- authController.js
|   |   |-- cartController.js
|   |   |-- couponController.js
|   |   |-- orderController.js
|   |   +-- productController.js
|   |-- middleware
|   |   +-- auth.js
|   |-- models
|   |   |-- Cart.js
|   |   |-- Coupon.js
|   |   |-- Order.js
|   |   |-- Product.js
|   |   +-- User.js
|   |-- package-lock.json
|   |-- package.json
|   |-- routes
|   |   |-- auth.js
|   |   |-- cart.js
|   |   |-- coupons.js
|   |   |-- orders.js
|   |   +-- products.js
|   |-- server.js

|-- eslint.config.js
|-- file_structure.js
|-- file_structure.txt

|-- Frontend
|   |-- index.html
|   |-- package-lock.json
|   |-- package.json
|   |-- postcss.config.js
|   |-- public
|   |   +-- favicon.ico
|   |-- src
|   |   |-- App.jsx
|   |   |-- components
|   |   |   |-- Footer.jsx
|   |   |   +-- Navbar.jsx
|   |   |-- context
|   |   |   |-- AuthContext.jsx
|   |   |   +-- CartContext.jsx
|   |   |-- index.css
|   |   |-- main.jsx
|   |   |-- pages
|   |   |   |-- admin
|   |   |   |   |-- AdminDashboard.jsx
|   |   |   |   |-- CouponManagement.jsx
|   |   |   |   |-- OrderManagement.jsx
|   |   |   |   +-- ProductManagement.jsx
|   |   |   |-- Cart.jsx
|   |   |   |-- Checkout.jsx
|   |   |   |-- Home.jsx
|   |   |   |-- Login.jsx
|   |   |   |-- Orders.jsx
|   |   |   |-- ProductDetails.jsx
|   |   |   +-- Signup.jsx
|   |   +-- services
|   |       +-- api.js
|   |-- tailwind.config.js
|   +-- vite.config.js

|-- LICENSE
+-- README.md

```

## 📝 Sample Coupons

1. **SAVE10**
   - 10% off on all Products
   - Min purchase: ₹100
   - Max discount: ₹10000

2. **FASHION20**
   - 20% OFF for Fashion Products
   - Min purchase: ₹20000
   - Max discount: ₹5000

## 📄 License

This project is licensed under the MIT License.

---
