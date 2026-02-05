# 🎮 GameStore - Platform Distribusi Game Digital Premium

Selamat datang di **GameStore**! Ini adalah proyek *full-stack* e-commerce modern yang dirancang khusus untuk distribusi game digital. Dibangun dengan teknologi terkini untuk memberikan pengalaman pengguna yang cepat, responsif, dan interaktif layaknya platform kelas dunia seperti Steam atau Epic Games Store.

![GameStore Preview](https://via.placeholder.com/800x400?text=GameStore+Premium+UI)

---

## 📋 Daftar Isi
1.  [Tentang Proyek](#-tentang-proyek)
2.  [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
3.  [Persiapan Awal (Prerequisites)](#-persiapan-awal-prerequisites)
4.  [Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan)
5.  [Akun Demo](#-akun-demo)
6.  [Fitur Unggulan](#-fitur-unggulan)
7.  [Struktur Folder](#-struktur-folder)
8.  [Troubleshooting](#-troubleshooting)

---

## 🌟 Tentang Proyek

GameStore bukan sekadar toko online biasa. Proyek ini mengimplementasikan berbagai fitur kompleks seperti sistem wallet, real-time notification, friend system, dan dashboard khusus untuk publisher. Tujuannya adalah mensimulasikan ekosistem distribusi game yang nyata dan lengkap.

---

## 🛠 Teknologi yang Digunakan

Proyek ini dibangun menggunakan **MERN Stack** (minus MongoDB, diganti dengan SQLite/Prisma) yang dimodernisasi:

### **Frontend (Client)**
*   **React.js (Vite)**: Framework UI yang sangat cepat.
*   **Tailwind CSS**: Untuk styling yang modern dan responsif.
*   **Framer Motion**: Untuk animasi transisi halaman dan efek interaktif yang halus.
*   **Socket.io Client**: Menangani komunikasi real-time (notifikasi & chat).
*   **Axios**: Melakukan request HTTP ke server.

### **Backend (Server)**
*   **Node.js & Express**: Runtime environment dan framework server yang robust.
*   **Prisma ORM**: Modern database toolkit untuk pengelolaan data yang mudah.
*   **SQLite**: Database relasional ringan (file-based), tidak perlu instalasi server database terpisah.
*   **Socket.io**: Server WebSocket untuk fitur real-time.
*   **JWT (JSON Web Token)**: Sistem autentikasi yang aman.

---

## ⚙ Persiapan Awal (Prerequisites)

Sebelum memulai, pastikan komputer Anda sudah terinstal *tools* berikut. Jika belum, silakan download dan install terlebih dahulu:

1.  **Node.js** (Versi 18 atau lebih baru)
    *   [Download Node.js di sini](https://nodejs.org/)
    *   Cek instalasi dengan perintah: `node -v`
2.  **Git** (Untuk mengunduh proyek ini)
    *   [Download Git di sini](https://git-scm.com/)
    *   Cek instalasi dengan perintah: `git --version`
3.  **Code Editor** (Disarankan VS Code)

---

## 🚀 Panduan Instalasi & Menjalankan

Ikuti langkah-langkah ini secara berurutan untuk menjalankan GameStore di komputer Anda.

### 1. Clone Repository
Buka terminal (Command Prompt/PowerShell/Terminal) dan jalankan perintah:
```bash
git clone <repository-url-anda>
cd GameStore
```

### 2. Setup Backend (Server)
Backend bertugas menangani data dan logika bisnis.

1.  Masuk ke folder server:
    ```bash
    cd server
    ```
2.  Install semua library yang dibutuhkan:
    ```bash
    npm install
    ```
3.  **PENTING:** Buat file konfigurasi `.env`.
    *   Buat file baru bernama `.env` di dalam folder `server`.
    *   Isi file tersebut dengan kode berikut:
        ```env
        DATABASE_URL="file:./dev.db"
        PORT=3000
        JWT_SECRET="rahasia_gamestore_super_aman_123"
        FRONTEND_URL="http://localhost:5173"
        ```
4.  Siapkan Database & Data Awal (Seeding):
    ```bash
    npx prisma migrate dev --name init
    node prisma/seed.js
    ```
    *(Langkah ini akan membuat database SQLite lokal dan mengisinya dengan user serta game contoh)*.
5.  Jalankan Server:
    ```bash
    npm run dev
    ```
    *Biarkan terminal ini tetap terbuka. Server berjalan di port 3000.*

### 3. Setup Frontend (Client)
Frontend adalah tampilan website yang akan Anda akses.

1.  Buka **Terminal Baru** (jangan matikan terminal server).
2.  Masuk ke folder client:
    ```bash
    cd client
    ```
3.  Install library frontend:
    ```bash
    npm install
    ```
4.  Buat file konfigurasi `.env`.
    *   Buat file baru bernama `.env` di dalam folder `client`.
    *   Isi file tersebut dengan kode berikut:
        ```env
        VITE_API_URL="http://localhost:3000"
        ```
5.  Jalankan Website:
    ```bash
    npm run dev
    ```
6.  Buka browser dan akses alamat yang muncul (biasanya **http://localhost:5173**).

---

## 🔑 Akun Demo

Agar Anda bisa langsung mencoba fitur-fitur canggih tanpa repot mendaftar, gunakan akun-akun berikut yang sudah kami sediakan di database:

| Tipe Akun | Email | Password | Fitur yang Bisa Dicoba |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@gamestore.com` | `password123` | Dashboard Admin, Manage User, Lihat Statistik Global |
| **Publisher 1** | `publisher@rockstar.com` | `password123` | Dashboard Publisher (Rockstar), Manage Game Sendiri, Buat Diskon |
| **Publisher 2** | `publisher@sony.com` | `password123` | Dashboard Publisher (Sony PlayStation) |
| **User Biasa** | *(Silakan Register)* | - | Beli Game, Top Up Wallet, Wishlist, Review |

---

## ✨ Fitur Unggulan

### 🎮 Untuk Gamer
*   **Storefront Canggih**: Cari game dengan cepat menggunakan *autocomplete* dan filter kategori.
*   **Sistem Wallet**: Top-up saldo simulasi untuk membeli game.
*   **Social Hub**: Tambah teman, lihat siapa yang online, dan intip aktivitas teman.
*   **Discovery Queue**: Rekomendasi game unik setiap hari berdasarkan preferensi Anda.

### 🏢 Untuk Publisher
*   **Dashboard Khusus**: Pantau penjualan game Anda secara visual.
*   **Manajemen Produk**: Tambah game baru, update harga, dan atur diskon flash sale.
*   **Interaksi Fans**: Posting update berita terbaru untuk komunitas game Anda.

---

## 📂 Struktur Folder

Agar Anda tidak bingung, berikut adalah gambaran struktur folder proyek ini:

```
GameStore/
├── client/                 # Folder Frontend (React)
│   ├── src/
│   │   ├── components/     # Elemen UI (Navbar, Card, Modal, dll)
│   │   ├── context/        # State Management Global
│   │   ├── App.jsx         # Pengaturan Routing Halaman
│   │   └── ...
│   └── ...
├── server/                 # Folder Backend (Express)
│   ├── prisma/             # Konfigurasi Database & Seed Data
│   ├── src/
│   │   ├── controllers/    # Logika 'Otak' Aplikasi
│   │   ├── routes/         # Jalur URL API
│   │   └── ...
│   └── uploads/            # Tempat penyimpanan gambar yang diupload
└── README.md               # File panduan ini
```

---

## ⚠️ Troubleshooting (Masalah Umum)

Jika Anda mengalami kendala, coba cek solusi berikut:

1.  **Error `net::ERR_ABORTED` atau Socket Error?**
    *   Pastikan **Server Backend** sudah dijalankan (`npm run dev` di folder server).
    *   Coba refresh halaman browser.

2.  **Gambar tidak muncul?**
    *   Pastikan folder `server/uploads` ada isinya. Jika kosong, jalankan ulang perintah `node prisma/seed.js` di folder server.

3.  **Database Error / Gagal Login?**
    *   Jika database bermasalah, Anda bisa meresetnya dengan cara:
        1. Hapus file `server/prisma/dev.db`.
        2. Hapus folder `server/prisma/migrations`.
        3. Jalankan ulang: `npx prisma migrate dev --name init` lalu `node prisma/seed.js`.

---

*Selamat menikmati GameStore! Jangan ragu untuk mengutak-atik kode dan belajar darinya.* 🚀
