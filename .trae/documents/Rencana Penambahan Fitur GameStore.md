Rencana ini mencakup fitur-fitur canggih yang kamu minta untuk membuat website-mu sekelas platform besar seperti Steam atau Epic Games.

## 1. Sistem Rating & Rekomendasi Pintar
- **Average Rating:** Menampilkan bintang rating rata-rata di setiap game (⭐ 4.8/5).
- **Smart Recommendations:** Di halaman utama, user akan melihat bagian "Recommended for You" berdasarkan kategori game yang paling sering mereka beli atau simpan di Wishlist.

## 2. Halaman Spesial Publisher (Exclusive Features)
Halaman ini akan memiliki dua sisi:
- **Public View:** User bisa melihat profil publisher dan semua game yang mereka rilis.
- **Publisher Dashboard (Exclusive):**
  - **Analytics:** Grafik pendapatan (Revenue) dan jumlah penjualan per game.
  - **Self-Management:** Publisher bisa mengatur diskon khusus untuk game buatan mereka sendiri.

## 3. Sistem Diskon & Event (Epic Games Style)
- **Publisher Discount:** Publisher bisa memberikan diskon (misal 20%) kapan saja.
- **Admin Sale Events:** Admin bisa membuat event besar (seperti "Winter Sale" atau "Ramadhan Sale").
- **Logic Harga:** Harga akhir akan otomatis terpotong jika ada diskon dari Publisher ATAU dari Event Admin. Admin juga bisa menset game menjadi **Gratis (100% Discount)** untuk waktu terbatas.
- **Visual:** Harga asli akan dicoret, dan muncul label diskon merah (misal: -50%).

## 4. Notifikasi Real-time
Menggunakan teknologi **Socket.io** agar user langsung mendapat info tanpa perlu refresh halaman:
- Notifikasi jika game di **Wishlist** sedang diskon.
- Notifikasi jika ada event sale baru dimulai.
- Notifikasi bagi Publisher jika ada review baru di game mereka.

---

### Langkah Teknis:
1.  **Database:** Menambah tabel `SaleEvent`, `Notification`, dan field `discount` di tabel `Game`.
2.  **Backend Logic:** Update perhitungan harga di `transactionService` dan `gameService`. Implementasi Socket.io untuk notifikasi.
3.  **Frontend UI:**
    - Update [Navbar.jsx](file:///d:/GameStore/client/src/components/Navbar.jsx) dengan ikon lonceng notifikasi.
    - Update [GameCard.jsx](file:///d:/GameStore/client/src/components/GameCard.jsx) untuk menampilkan rating & label diskon.
    - Buat halaman `PublisherProfile.jsx` dan `AdminSaleManager.jsx`.

**Bagaimana menurutmu? Jika setuju, saya akan mulai dari update Database dan Backend Logic terlebih dahulu.**