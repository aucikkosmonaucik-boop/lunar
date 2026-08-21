# 📱 Lunar Store — Mobile App (Flutter for Android & iOS)

Aplikacja mobilna e-commerce dla sklepu **LUNAR**, zintegrowana bezpośrednio z backendem Node.js / Prisma REST API (`/api/*`).

---

## 🌟 Główne Funkcjonalności

- 🏠 **Ekran Startowy (Home):**
  - Automatyczny carousel banerów promocyjnych (Nowości, Bridal, Bestsellery)
  - Przewijany poziomo pasek kategorii z dedykowanymi ikonami
  - Sekcje: *Polecane produkty*, *Nowości*, *Bestsellery*
  - Baner promocyjny *Klubu LUNAR*
- 📦 **Katalog & Wyszukiwarka (Shop / Explore):**
  - Wyszukiwanie produktów po nazwie, opisie i tagach
  - Filtrowanie po kategoriach oraz odznakach (`NEW`, `BESTSELLER`, `SALE`, `BRIDAL`)
  - Sortowanie (Polecane, Najnowsze, Cena rosnąco/malejąco, Oceny)
  - Paginacja / nieskończone przewijanie (Infinite Scroll)
- 💎 **Karta & Szczegóły Produktu:**
  - Galeria zdjęć w wysokiej rozdzielczości z wskaźnikami
  - Informacje o cenie, rabacie, dostępności w magazynie
  - Wybór ilości i wariantów
  - Oceny gwiazdkowe oraz sekcja recenzji klientów z możliwością dodania nowej opinii
- 🛒 **Koszyk & Zniżki:**
  - Zarządzanie pozycjami i ilościami
  - Pasek postępu darmowej dostawy (od 250 zł)
  - Weryfikacja i naliczanie kodów rabatowych (`PromoCode`)
  - Zniżki z punktów lojalnościowych
- 💳 **Kasa i Płatności (Checkout):**
  - Formularz danych adresowych z autouzupełnianiem dla zalogowanych użytkowników
  - Wybór metody płatności: **BLIK**, **Karta płatnicza (Stripe / Apple Pay / Google Pay)**, **Szybki przelew**, **Pobranie**
  - Ekran sukcesu z numerem zamówienia i podsumowaniem
- 👤 **Konto Klienta & Autoryzacja:**
  - Logowanie, rejestracja, reset hasła
  - Podgląd punktów lojalnościowych i poziomu w klubie
  - Edycja danych profilu i domyślnego adresu dostawy
- 📜 **Historia & Śledzenie Zamówień:**
  - Lista zamówień dla zalogowanego użytkownika
  - Wyszukiwarka i śledzenie zamówień gościa (po numerze zamówienia i adresie e-mail)
  - Oś czasu statusu przesyłki (*Przyjęte → W realizacji → Wysłane → Doręczone*)
- ❤️ **Ulubione (Wishlist):**
  - Zapisywanie produktów lokalnie (trwałe w pamięci urządzenia) z szybkim przenoszeniem do koszyka
- 🌙 **Tryb Ciemny / Jasny (Dark / Light Mode):**
  - Luksusowa, dopasowana kolorystyka Lunar Gold (`#C1A98F`) z przełącznikiem w profilu i na pasku głównym

---

## 🚀 Jak uruchomić aplikację?

### 1. Wymagania wstępne
- Zainstalowany [Flutter SDK](https://docs.flutter.dev/get-started/install) (wersja >= 3.0.0)
- Emulator Androida (Android Studio) lub symulator iOS (Xcode na macOS) / podłączone fizyczne urządzenie.

### 2. Instalacja zależności
Przejdź do katalogu `mobile` i pobierz pakiety:
```bash
cd mobile
flutter pub get
```

### 3. Konfiguracja adresu API
Domyślnie aplikacja automatycznie dobiera odpowiedni adres:
- **Emulator Androida:** `http://10.0.2.2:3000`
- **Symulator iOS:** `http://localhost:3000`
- **Produkcja:** `https://mylunar.ie`

Możesz w każdej chwili zmienić adres API w aplikacji w zakładce **Konto → Adres serwera API**.

### 4. Uruchomienie w trybie developerskim
```bash
flutter run
```

### 5. Budowanie wersji produkcyjnej
- **Android APK:**
  ```bash
  flutter build apk --release
  ```
- **Android App Bundle (Google Play):**
  ```bash
  flutter build appbundle --release
  ```
- **iOS IPA (App Store):**
  ```bash
  flutter build ipa --release
  ```

---

## 🏗️ Struktura Kodu

```
mobile/
├── lib/
│   ├── main.dart                     # Inicjalizacja, MultiProvider, ThemeMode
│   ├── core/
│   │   ├── constants/                # Kolory, motywy, stałe API
│   │   ├── services/                 # ApiService (HTTP/JWT), StorageService (SharedPreferences)
│   │   └── utils/                    # Formatowanie walut, dat, statusów
│   ├── models/                       # Modele Product, Category, User, Cart, Order, Promo, Review
│   ├── providers/                    # Stan: Auth, Cart, Wishlist, Product, Order, Theme
│   ├── screens/                      # Ekrany UI (Home, Shop, Details, Cart, Checkout, Profile, Orders)
│   └── widgets/                      # Komponenty wielokrotnego użytku (ProductCard, BannerCarousel, itp.)
├── android/                          # Konfiguracja Android (AndroidManifest.xml)
└── ios/                              # Konfiguracja iOS (Info.plist)
```
