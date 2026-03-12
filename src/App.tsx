import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import ContactPage from './pages/ContactPage';
import { CartProvider } from './context/CartProvider';

const App: React.FC = () => {
  return (
    <CartProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-white text-wonders-dark">
          <Navbar />
          <main className="flex-grow pt-40">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/sklep" element={<ShopPage />} />
              <Route path="/produkt/:id" element={<ProductDetailPage />} />
              <Route path="/koszyk" element={<CartPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
};

export default App;
