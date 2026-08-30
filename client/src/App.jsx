import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminBanners from './pages/admin/AdminBanners';
import AdminNavigation from './pages/admin/AdminNavigation';
import AdminPromotions from './pages/admin/AdminPromotions';
import AdminInventory from './pages/admin/AdminInventory';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
          <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />
          <Route path="/admin/*" element={<ProtectedRoute requireAdmin><AdminShell /></ProtectedRoute>} />
          <Route path="/*" element={<MainShell />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

const AdminShell = () => (
  <Routes>
    <Route index element={<AdminDashboard />} />
    <Route path="items" element={<AdminProducts />} />
    <Route path="items/new" element={<AdminProducts />} />
    <Route path="items/:id/edit" element={<AdminProducts />} />
    <Route path="products" element={<AdminProducts />} />
    <Route path="orders" element={<AdminOrders />} />
    <Route path="customers" element={<AdminCustomers />} />
    <Route path="categories" element={<AdminCategories />} />
    <Route path="categories/new" element={<AdminCategories />} />
    <Route path="banners" element={<AdminBanners />} />
    <Route path="banners/new" element={<AdminBanners />} />
    <Route path="navigation" element={<AdminNavigation />} />
    <Route path="promotions" element={<AdminPromotions />} />
    <Route path="inventory" element={<AdminInventory />} />
    <Route path="analytics" element={<AdminAnalytics />} />
    <Route path="settings" element={<AdminSettings />} />
    <Route path="settings/:section" element={<AdminSettings />} />
  </Routes>
);

const MainShell = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <div className="flex-grow flex flex-col">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ProductListingPage />} />
        <Route path="/shop/:category" element={<ProductListingPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/order-success/:id" element={<OrderSuccessPage />} />
        <Route path="/account" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      </Routes>
    </div>
    <Footer />
  </div>
);

const AuthLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-background">
    {children}
  </div>
);

export default App;
