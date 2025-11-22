# 🛒 ShopKart - E-Commerce Application (MERN Stack)

A full-featured e-commerce platform with Role-Based Access Control (RBAC), admin dashboard, product management, shopping cart, and coupon system.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

### 🛍️ User Features
- **Product Browsing**: Filter by category, search products
- **Shopping Cart**: Add/remove items, quantity management, real-time price calculation
- **Discount System**: Apply coupon codes with validation
- **User Authentication**: JWT-based secure authentication
- **Checkout Process**: Complete order with multiple payment methods
- **Order Tracking**: View order history and status
- **Responsive Design**: Flipkart-inspired professional UI

### 👨‍💼 Admin Features (RBAC)
- **Product Management**: Full CRUD operations for products
- **Coupon Management**: Create, update, delete discount coupons
- **Order Management**: View all orders, update order status
- **Dashboard Analytics**: Overview of products, orders, and revenue
- **Protected Routes**: Admin-only access with role verification

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
- React Icons

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd ecommerce-app
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
touch .env
```

Add the following to `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

```bash
# Seed database with sample data
npm run seed

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install

# Create .env file
touch .env
```

Add the following to frontend `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# Start frontend development server
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🗂️ Project Structure

```
ecommerce/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── middleware/
│   │   └── auth.js                # Authentication & RBAC middleware
│   ├── models/
│   │   ├── User.js                # User model with roles
│   │   ├── Product.js             # Product model
│   │   ├── Coupon.js              # Coupon model
│   │   └── Order.js               # Order model
│   ├── routes/
│   │   ├── auth.js                # Authentication routes
│   │   ├── products.js            # Product routes
│   │   ├── coupons.js             # Coupon routes
│   │   └── orders.js              # Order routes
│   ├── controllers/
│   │   ├── authController.js      # Auth logic
│   │   ├── productController.js   # Product logic
│   │   ├── couponController.js    # Coupon logic
│   │   └── orderController.js     # Order logic
│   ├── seed.js                    # Database seeder
│   ├── server.js                  # Express server
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Navigation bar
│   │   │   ├── ProtectedRoute.jsx # Protected route wrapper
│   │   │   └── AdminRoute.jsx     # Admin-only route wrapper
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Home page with products
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── Signup.jsx         # Registration page
│   │   │   ├── ProductDetails.jsx # Product details page
│   │   │   ├── Cart.jsx           # Shopping cart page
│   │   │   ├── Checkout.jsx       # Checkout page
│   │   │   ├── Orders.jsx         # User orders page
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx          # Admin dashboard
│   │   │       ├── ProductManagement.jsx  # Product CRUD
│   │   │       ├── CouponManagement.jsx   # Coupon CRUD
│   │   │       └── OrderManagement.jsx    # Order management
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Authentication context
│   │   │   └── CartContext.jsx    # Shopping cart context
│   │   ├── services/
│   │   │   └── api.js             # API service layer
│   │   ├── App.jsx                # Main app component
│   │   ├── main.jsx               # Entry point
│   │   └── index.css              # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

## 🔐 Default Credentials

After running the seed script, use these credentials:

### Admin Account
- **Email**: `admin@ecommerce.com`
- **Password**: `admin123`
- **Role**: admin

### Test User Account
- **Email**: `john@example.com`
- **Password**: `user123`
- **Role**: user

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - User login
GET    /api/auth/profile       - Get user profile (Protected)
PUT    /api/auth/profile       - Update profile (Protected)
```

### Products
```
GET    /api/products           - Get all products (with filters)
GET    /api/products/featured  - Get featured products
GET    /api/products/:id       - Get single product
POST   /api/products           - Create product (Admin)
PUT    /api/products/:id       - Update product (Admin)
DELETE /api/products/:id       - Delete product (Admin)
```

### Coupons
```
GET    /api/coupons            - Get all coupons (Admin)
GET    /api/coupons/:id        - Get single coupon (Admin)
POST   /api/coupons            - Create coupon (Admin)
PUT    /api/coupons/:id        - Update coupon (Admin)
DELETE /api/coupons/:id        - Delete coupon (Admin)
POST   /api/coupons/validate   - Validate coupon code (Public)
```

### Orders
```
POST   /api/orders             - Create order (Protected)
GET    /api/orders             - Get user orders (Protected)
GET    /api/orders/all         - Get all orders (Admin)
GET    /api/orders/:id         - Get order by ID (Protected)
PUT    /api/orders/:id/status  - Update order status (Admin)
```

## 🎨 UI Features

### Color Scheme (Flipkart-inspired)
- Primary Blue: `#2874f0`
- Secondary Orange: `#ff9f00`
- Background: `#f1f3f6`
- White cards with clean shadows

### Components
- Responsive navbar with cart badge
- Product cards with hover effects
- Modal forms for admin operations
- Toast notifications for user feedback
- Loading spinners
- Status badges

## 🛡️ Security Features

- JWT token authentication
- Password hashing with bcryptjs
- Role-based access control (RBAC)
- Protected API routes
- Input validation
- Secure HTTP headers

## 📝 Sample Coupons

The seed script creates these coupons:

1. **WELCOME10**
   - 10% off on first purchase
   - Min purchase: ₹999
   - Max discount: ₹500

2. **FLAT500**
   - Flat ₹500 off
   - Min purchase: ₹2999

3. **SAVE20**
   - 20% off on electronics
   - Min purchase: ₹5000
   - Max discount: ₹2000

## 🚢 Deployment

### Backend (Render/Railway/Heroku)
1. Create account on deployment platform
2. Connect GitHub repository
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Build the project:
```bash
npm run build
```
2. Deploy the `dist` folder
3. Set environment variable: `VITE_API_URL`

## 🧪 Testing

### Test User Flow
1. Browse products
2. Add items to cart
3. Apply coupon code (WELCOME10)
4. Checkout and place order
5. View order history

### Test Admin Flow
1. Login as admin
2. Add/edit/delete products
3. Create discount coupons
4. View and manage orders
5. Update order status

## 📚 NPM Scripts

### Backend
```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "seed": "node seed.js"
}
```

### Frontend
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

## 🐛 Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`

### CORS Issues
- Backend CORS is configured for all origins in development
- Update for production use

### Port Already in Use
- Change PORT in backend `.env`
- Change port in frontend `vite.config.js`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues and questions:
- Create a GitHub issue
- Email: support@shopkart.com

## 🙏 Acknowledgments

- Design inspired by Flipkart
- Built with MERN Stack
- Icons by React Icons
- UI components styled with Tailwind CSS

---

**Made with ❤️ using MERN Stack**