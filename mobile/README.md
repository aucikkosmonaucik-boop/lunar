# 📱 Lunar Store — Mobile App (Flutter for Android & iOS)

A full-featured mobile e-commerce application for **LUNAR**, seamlessly integrated with the Node.js / Prisma REST API backend (`/api/*`).

---

## 🌟 Key Features

- 🏠 **Home Screen:**
  - Automated promotional banner carousel (New Arrivals, Bridal, Bestsellers)
  - Horizontal category selector with custom luxury icons
  - Curated product sections: *Featured Pieces*, *New Arrivals*, *Bestsellers*
  - *LUNAR Club* loyalty promotion card
- 📦 **Catalog & Search (Explore):**
  - Search by product title, description, and keywords
  - Multi-category & badge filters (`NEW`, `BESTSELLER`, `SALE`, `BRIDAL`)
  - Sorting (Featured, Newest, Price: Low to High, Price: High to Low, Highest Rated)
  - Infinite scroll pagination
- 💎 **Product Card & Details:**
  - High-resolution image gallery with page indicator dots
  - Pricing, discounts, and real-time inventory stock availability
  - Quantity selector and options
  - Star ratings and customer review drawer with instant review submission
- 🛒 **Shopping Bag & Discounts:**
  - Item management and quantity controls
  - Dynamic free shipping threshold progress bar (free shipping from €100)
  - Promo code validation & application (`PromoCode`)
  - Loyalty point rewards
- 💳 **Checkout & Payments:**
  - Comprehensive shipping address form with autofill for authenticated users
  - Payment options: **Credit / Debit Card (Stripe / Apple Pay / Google Pay)**, **BLIK**, **Direct Bank Transfer**, **Cash on Delivery**
  - Order success confirmation screen with order reference and summary
- 👤 **Account & Authentication:**
  - Sign in, registration, password reset
  - Loyalty points balance and Club tier status
  - Edit profile details and default delivery address
- 📜 **Order History & Tracking:**
  - Authenticated user order history
  - Guest order tracking (by reference number & email)
  - Visual status timeline (*Placed → Processing → Shipped → Delivered*)
- ❤️ **Wishlist:**
  - Persistent saved items with fast add-to-bag actions
- 🌙 **Dark & Light Themes:**
  - Luxury Lunar Gold palette (`#C1A98F`) with instant theme toggling in profile and app bar

---

## 🚀 Getting Started

### 1. Prerequisites
- [Flutter SDK](https://docs.flutter.dev/get-started/install) installed (version >= 3.0.0)
- Android Emulator, iOS Simulator, or a connected physical mobile device / Chrome browser.

### 2. Install Dependencies
Navigate to the `mobile` directory:
```bash
cd mobile
flutter pub get
```

### 3. Run the App
```bash
flutter run
```

---

## ⚙️ Configuration & API Endpoint

The default API server is configured in [`lib/core/constants/api_constants.dart`](lib/core/constants/api_constants.dart):
```dart
static const String defaultBaseUrl = 'https://lunar-eight-bay.vercel.app';
```

You can also change the API endpoint dynamically at runtime in the app:
1. Open the **Account** tab.
2. Tap **API Server Endpoint**.
3. Enter your server URL and tap **Save**.
