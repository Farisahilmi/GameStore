# 🚀 Panduan Publikasi (Deployment) GameStore

Panduan ini akan membantu Anda mempublikasikan website GameStore agar bisa diakses oleh semua orang di internet. Kita akan menggunakan layanan modern yang memiliki **Free Tier** (Gratis).

---

## 📋 Arsitektur Deployment

Agar website berjalan optimal dan datanya aman (tidak hilang saat restart), kita akan memisahkan 3 komponen utama:

1.  **Frontend (Tampilan Web)**: Di-host di **Vercel**.
2.  **Backend (API Server)**: Di-host di **Render**.
3.  **Database**: Migrasi ke **PostgreSQL** (di Neon.tech atau Railway) karena lebih stabil untuk cloud dibanding SQLite.

---

## ✅ Langkah 1: Persiapan Database (PostgreSQL)

Kita butuh database online. **Neon.tech** adalah pilihan terbaik untuk PostgreSQL gratis.

1.  Buka [Neon.tech](https://neon.tech) dan buat akun (Sign Up).
2.  Buat **New Project** bernama `gamestore-db`.
3.  Salin **Connection String** yang diberikan. Formatnya seperti:
    `postgresql://user:password@ep-xyz.aws.neon.tech/gamestore-db?sslmode=require`
4.  Simpan string ini, kita akan memakainya nanti.

---

## 🛠 Langkah 2: Persiapan Kode Backend

Sebelum upload, kita harus menyesuaikan kode agar bisa pakai PostgreSQL.

1.  Buka file `server/prisma/schema.prisma`.
2.  Ubah bagian `datasource` dari `sqlite` menjadi `postgresql`:

    ```prisma
    // SEBELUM (Lokal)
    // datasource db {
    //   provider = "sqlite"
    //   url      = env("DATABASE_URL")
    // }

    // SESUDAH (Untuk Deploy)
    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }
    ```

3.  (Opsional tapi Disarankan) Hapus folder `server/prisma/migrations` agar kita bisa mulai fresh di database baru.

---

## ☁️ Langkah 3: Deploy Backend ke Render

1.  Buka [Render.com](https://render.com) dan buat akun.
2.  Klik **New +** -> **Web Service**.
3.  Hubungkan akun GitHub Anda dan pilih repository `GameStore`.
4.  Isi konfigurasi berikut:
    *   **Name**: `gamestore-api`
    *   **Root Directory**: `server`
    *   **Environment**: `Node`
    *   **Build Command**: `npm install && npx prisma generate`
    *   **Start Command**: `node index.js`
5.  Scroll ke bawah ke bagian **Environment Variables**, tambahkan:
    *   `DATABASE_URL`: *(Isi dengan Connection String dari Neon tadi)*
    *   `JWT_SECRET`: *(Isi dengan kode rahasia acak yang panjang)*
    *   `API_KEY`: `30035be176e0448bb45ce782377409ce` *(Atau ganti dengan key pilihan Anda)*
    *   `FRONTEND_URL`: *(Isi dengan URL Frontend Vercel nanti, misal https://gamestore.vercel.app - bisa diupdate belakangan)*
    *   `NODE_ENV`: `production`
6.  Klik **Create Web Service**.
7.  Tunggu proses deploy selesai. Render akan memberikan URL Backend, misal: `https://gamestore-api.onrender.com`. **Salin URL ini.**

*Catatan: Saat pertama kali deploy, server mungkin gagal connect karena database kosong. Kita perlu menjalankan migrasi.*

**Cara Migrasi Database di Render:**
1.  Di dashboard Render web service Anda, klik tab **Shell**.
2.  Ketik perintah: `npx prisma migrate deploy`
3.  Ketik perintah: `node prisma/seed.js` (untuk isi data awal).

---

## 🌐 Langkah 4: Deploy Frontend ke Vercel

1.  Buka [Vercel.com](https://vercel.com) dan buat akun.
2.  Klik **Add New...** -> **Project**.
3.  Import repository GitHub `GameStore` Anda.
4.  Konfigurasi Project:
    *   **Framework Preset**: Vite
    *   **Root Directory**: Klik `Edit` dan pilih folder `client`.
5.  Buka bagian **Environment Variables**, tambahkan:
    *   `VITE_API_URL`: *(Isi dengan URL Backend Render tadi, tanpa garis miring di akhir)*
        *   Contoh: `https://gamestore-api.onrender.com`
    *   `VITE_API_KEY`: `30035be176e0448bb45ce782377409ce` *(Harus sama dengan API_KEY di Backend)*
6.  Klik **Deploy**.

---

## 🎉 Selesai!

Vercel akan memberikan domain (misal: `gamestore.vercel.app`).
Website Anda sekarang sudah live dan bisa dibuka oleh siapa saja!

### 💡 Tips Penting
*   **Cold Start**: Karena pakai layanan gratis (Render), backend akan "tidur" jika tidak diakses selama 15 menit. Saat pertama kali buka website setelah lama tidak aktif, mungkin loadingnya agak lama (30-60 detik) untuk membangunkan server. Ini normal.
*   **Update**: Setiap kali Anda push perubahan ke GitHub, Vercel dan Render akan otomatis meng-update website Anda.
