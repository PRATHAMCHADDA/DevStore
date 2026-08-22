import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Dashboard } from './pages/Dashboard';
import { AdminPanel } from './pages/AdminPanel';

// Route Guards
const PrivateRoute = ({ children }) => {
  const { user, authLoading } = useApp();
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, authLoading } = useApp();
  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, authLoading } = useApp();
  if (authLoading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:slug" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />

            {/* Guest only routes */}
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
            <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />

            {/* Authenticated routes */}
            <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/*" element={<AdminPanel />} />

            {/* Fallback */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center py-32 text-center px-4">
                <h1 className="text-7xl font-extrabold text-slate-200 dark:text-slate-800">404</h1>
                <p className="text-xl font-bold text-slate-700 dark:text-white mt-4">Page Not Found</p>
                <p className="text-slate-400 text-sm mt-2">The page you're looking for doesn't exist.</p>
                <a href="/" className="btn-primary mt-6 py-2.5 px-6 text-sm inline-block">Back to Home</a>
              </div>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;
