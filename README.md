# 🎮 GameStore - Premium Digital Distribution Platform

GameStore adalah platform e-commerce *full-stack* modern untuk distribusi game digital, dirancang dengan inspirasi dari platform besar seperti Steam dan Epic Games Store. Proyek ini menghadirkan pengalaman pengguna (UI/UX) yang premium, interaktif, dan responsif.

![GameStore UI](https://via.placeholder.com/800x400?text=GameStore+Premium+UI)

## ✨ Fitur Utama

### � Untuk Pengguna (Gamer)
*   **Storefront Modern**: Browsing game dengan filter, sorting, dan pencarian *autocomplete* real-time.
*   **Discovery Queue**: Rekomendasi game personal berbasis algoritma cerdas.
*   **Manajemen Akun**: Profil kustom, Wallet system (Top-up), dan Library game.
*   **Sistem Sosial**:
    *   **Friend System**: Tambah teman, lihat status online/offline.
    *   **Activity Feed**: Lihat aktivitas teman (beli game, review, dll).
    *   **Real-time Notifications**: Notifikasi instan untuk pesan, request teman, dan diskon.
    *   **Community Hub**: Forum diskusi dan postingan komunitas.
*   **Transaksi**: Shopping Cart, Wishlist, dan pembelian instan (Direct Purchase/Gift).
*   **Review & Rating**: Berikan ulasan dan rating untuk game yang dimiliki.

### 🏢 Untuk Publisher & Developer
*   **Developer Dashboard**: Portal khusus untuk mengelola game yang dipublikasikan.
*   **Manajemen Game**: Tambah, edit, dan hapus listing game.
*   **Sales & Diskon**: Atur periode diskon (Flash Sale, Holiday Sale).
*   **Analytics**: Grafik penjualan dan performa game.
*   **Game Updates**: Posting berita update/patch notes untuk pemain.

### 🛡️ Untuk Admin
*   **Admin Dashboard**: Ringkasan statistik global platform.
*   **Manajemen User**: Kontrol penuh atas pengguna (termasuk ban/unban).
*   **Validasi Konten**: Moderasi konten komunitas.

### 🎨 UI/UX Premium
*   **Glassmorphism Design**: Tampilan modern dengan efek transparansi dan blur.
*   **Smooth Transitions**: Animasi perpindahan halaman yang mulus.
*   **Interactive Elements**: Kartu game dengan efek 3D Tilt, micro-interactions, dan animasi skeleton loading.
*   **Theming**: Dukungan Dark Mode, Light Mode, dan tema kustom lainnya.

---

## 🛠️ Teknologi yang Digunakan

**Frontend (Client):**
*   **React** (Vite)
*   **Tailwind CSS** (Styling)
*   **Framer Motion** (Animasi kompleks & Transisi)
*   **Socket.io Client** (Real-time communication)
*   **Axios** (HTTP Client)
*   **FontAwesome** (Icons)

**Backend (Server):**
*   **Node.js & Express**
*   **Prisma ORM** (Database Management)
*   **SQLite** (Database - *mudah disetup tanpa install software tambahan*)
*   **Socket.io** (WebSocket Server)
*   **JWT** (Authentication)

---

## 🚀 Cara Menjalankan Project

Ikuti langkah-langkah berikut untuk menjalankan GameStore di komputer lokal Anda.

### Prasyarat
Pastikan Anda sudah menginstal:
*   [Node.js](https://nodejs.org/) (v16 atau lebih baru)
*   Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd GameStore
```

### 2. Setup Backend (Server)
Buka terminal baru, lalu jalankan:

```bash
cd server

# Install dependencies
npm install

# Setup Database & Seed Data (Penting!)
npx prisma migrate dev --name init
node prisma/seed.js

# Jalankan Server
npm run dev
```
*Server akan berjalan di `http://localhost:3000`*

### 3. Setup Frontend (Client)
Buka terminal **baru** (biarkan terminal server tetap berjalan), lalu jalankan:

```bash
cd client

# Install dependencies
npm install

# Jalankan Client
npm run dev
```
*Website akan terbuka otomatis di `http://localhost:5173`*

---

## 🔑 Akun Demo (Default)

Database sudah terisi dengan akun-akun berikut untuk keperluan testing:

| Role | Email | Password | Kegunaan |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@gamestore.com` | `password123` | Akses penuh ke dashboard admin & manajemen user |
| **Publisher** | `publisher@rockstar.com` | `password123` | Demo dashboard publisher (Rockstar Games) |
| **Publisher** | `publisher@sony.com` | `password123` | Demo dashboard publisher (PlayStation) |
| **User** | *(Register Sendiri)* | - | Coba fitur register untuk pengalaman user baru |

---

## 📂 Struktur Project

```
GameStore/
├── client/                 # Frontend React App
│   ├── src/
│   │   ├── components/     # Komponen UI Reusable
│   │   ├── context/        # React Context (Theme, Auth)
│   │   ├── App.jsx         # Main Routing & Layout
│   │   └── ...
│   └── ...
├── server/                 # Backend Express App
│   ├── prisma/             # Database Schema & Seeds
│   ├── src/
│   │   ├── controllers/    # Logika Bisnis
│   │   ├── routes/         # API Routes
│   │   ├── services/       # Service Layer
│   │   └── ...
│   └── uploads/            # Folder upload gambar
└── README.md               # Dokumentasi ini
```

## ⚠️ Troubleshooting Umum

*   **Error `net::ERR_ABORTED` atau Socket disconnect?**
    *   Pastikan server backend berjalan.
    *   Coba refresh halaman browser (hard refresh: Ctrl+F5).
    *   Kami sudah mengoptimalkan konfigurasi socket untuk reconnect otomatis.

*   **Gambar tidak muncul?**
    *   Pastikan folder `server/uploads` ada dan server backend sedang berjalan, karena gambar disajikan sebagai file statis dari sana.

*   **Database Error / Prisma Error?**
    *   Hapus folder `server/prisma/migrations` dan file `server/prisma/dev.db`.
    *   Jalankan ulang `npx prisma migrate dev --name init` dan `node prisma/seed.js` di folder server.

---

*Dibuat dengan ❤️ untuk tugas Software Engineering / Web Development.*
