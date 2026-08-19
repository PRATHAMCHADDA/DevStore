# 🛒 DevStore — Production-Ready Full Stack E-Commerce

A premium, full-stack e-commerce platform built with **React + Vite**, **Express.js**, **JWT Auth**, and a **dual-mode database** (MongoDB/MySQL in production, SQLite/JSON files as fallback so it runs locally with zero setup).

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm v9+

### Install All Dependencies
```bash
npm run install-all
```

### Run Development Servers (Frontend + Backend concurrently)
```bash
npm run dev
```

| Service   | URL                        |
|-----------|---------------------------|
| Frontend  | http://localhost:5173      |
| Backend   | http://localhost:5000      |
| API Root  | http://localhost:5000/api  |

---

## 🔐 Environment Variables

Create `server/.env` (already pre-configured for local dev):

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# JWT Secrets (change in production)
JWT_ACCESS_SECRET=devstore_access_secret_dev
JWT_REFRESH_SECRET=devstore_refresh_secret_dev
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# MongoDB (optional — falls back to local JSON if not set)
MONGODB_URI=

# MySQL (optional — falls back to SQLite if not set)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=devstore

# Payment Gateway Keys (sandbox mode if not set)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
PAYPAL_CLIENT_ID=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

## 📁 Project Structure

```
project-bee/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── context/         # AppContext (auth, cart, wishlist, toast)
│   │   ├── components/      # Navbar, Footer
│   │   └── pages/           # Home, Shop, ProductDetails, Cart,
│   │                        # Checkout, Dashboard, AdminPanel,
│   │                        # Login, Register, ForgotPassword, ResetPassword
│   └── vite.config.js       # Dev proxy → backend :5000
│
├── server/                  # Express.js backend
│   ├── config/              # db.js (dual-mode), seed.js
│   ├── controllers/         # auth, product, cart, wishlist, order,
│   │                        # payment, coupon, review, admin, analytics
│   ├── middleware/          # auth.js (requireAuth, requireAdmin, optionalAuth)
│   │                        # upload.js (multer)
│   ├── models/              # JSON/Mongoose models + Sequelize SQL models
│   ├── routes/              # All API route files
│   ├── services/            # paymentService.js, invoiceService.js (pdfkit)
│   ├── utils/               # jsonDb.js, jwt.js
│   └── index.js             # Server entry point
│
└── package.json             # Root workspace scripts
```

---

## 🎯 Features

### 🛍️ Shopping
- Dynamic product catalog with search, category, brand, price & rating filters
- Quick-view modals with glassmorphism design
- AI-powered product recommendations from browse history
- Real-time autocomplete search suggestions
- Today's Deals with live countdown timer

### 🔐 Authentication
- JWT access + refresh token pair with HTTP-only cookies
- Silent token refresh interceptors
- OTP email verification on signup
- Password reset flow via token
- Google & GitHub OAuth simulation

### 🛒 Cart & Checkout
- Persistent cart with stock validation
- Coupon code application with backend validation
- Multi-step checkout: Address → Payment → Confirm
- Payment methods: Credit Card, Cash on Delivery, PayPal, Razorpay
- Automatic PDF invoice generation (pdfkit)

### 📦 Orders
- Full order history with status tracking
- Order cancellation (processing stage only)
- 30-day return request system
- PDF invoice download

### 👤 User Dashboard
- Profile management
- Order history with status indicators
- Wishlist management
- Saved addresses CRUD
- Real-time notifications

### 🔧 Admin Panel
- Revenue analytics with Recharts bar charts
- Product CRUD with image URL support
- Order status management
- User role management (promote/demote admin)
- Coupon creation and management
- Low stock alerts

### 🗄️ Database Architecture
- **Production**: MongoDB (JSON models) + MySQL (Sequelize for payments/analytics)
- **Development**: JSON file collections + SQLite — zero setup required!

---

## 🧪 Test Credentials

After first run, the seeder creates demo products. Register an account normally, then:

**Admin Promotion (via API):**
```bash
# POST /api/admin/users/:id/role with { "role": "admin" }
# Or update directly in server/data/User.json
```

**Test Card (sandbox):**
```
Number: 4242 4242 4242 4242
Expiry: 12/27
CVC: 123
```

---

## 📚 API Reference

| Method | Endpoint                   | Description              | Auth |
|--------|---------------------------|--------------------------|------|
| GET    | /api/products             | List + filter products   | ❌   |
| GET    | /api/products/:slug       | Product details + reviews| ❌   |
| GET    | /api/products/featured    | Featured products        | ❌   |
| GET    | /api/products/deals       | Flash deals              | ❌   |
| POST   | /api/auth/register        | User registration        | ❌   |
| POST   | /api/auth/login           | User login               | ❌   |
| GET    | /api/cart                 | Get user cart            | ✅   |
| POST   | /api/cart/add             | Add to cart              | ✅   |
| POST   | /api/orders               | Place order              | ✅   |
| GET    | /api/orders               | Order history            | ✅   |
| GET    | /api/admin/stats          | Dashboard analytics      | 🔑   |

*(🔑 = Admin only)*

---

Built with ❤️ for the DevStore Project.
