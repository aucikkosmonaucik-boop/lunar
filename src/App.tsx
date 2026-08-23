import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import ContactPage from './pages/ContactPage';
import { CartProvider } from './context/CartProvider';
import { FavoritesProvider } from './context/FavoritesProvider';
import { AuthProvider } from './context/AuthProvider';
import { ProductsProvider } from './context/ProductsContext';
import { LoyaltyProvider } from './context/LoyaltyContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AccountPage from './pages/AccountPage';
import AdminPage from './pages/AdminPage';
import TermsPage from './pages/TermsPage';
import CookiesPage from './pages/CookiesPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import MobileAppPage from './pages/MobileAppPage';
import TrackOrderPage from './pages/TrackOrderPage';
import CookieConsentBanner from './components/ui/CookieConsentBanner';

const PageViewTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [location]);

  return null;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProductsProvider>
        <LoyaltyProvider>
          <CartProvider>
            <FavoritesProvider>
              <Router>
                <PageViewTracker />
                <div className="flex flex-col min-h-screen bg-white text-wonders-dark">
                  <Navbar />
                  <main className="flex-grow" style={{ paddingTop: '250px' }}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/shop" element={<ShopPage />} />
                      <Route path="/product/:id" element={<ProductDetailPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/order-success" element={<OrderSuccessPage />} />
                      <Route path="/track-order" element={<TrackOrderPage />} />
                      <Route path="/track" element={<TrackOrderPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/verify-email" element={<VerifyEmailPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
                      <Route path="/account" element={<AccountPage />} />
                      <Route path="/admin" element={<AdminPage />} />
                      <Route path="/terms" element={<TermsPage />} />
                      <Route path="/cookies" element={<CookiesPage />} />
                      <Route path="/app" element={<MobileAppPage />} />
                    </Routes>
                  </main>
                  <Footer />
                  <CookieConsentBanner />
                </div>
              </Router>
            </FavoritesProvider>
          </CartProvider>
        </LoyaltyProvider>
      </ProductsProvider>
    </AuthProvider>
  );
};

export default App;
