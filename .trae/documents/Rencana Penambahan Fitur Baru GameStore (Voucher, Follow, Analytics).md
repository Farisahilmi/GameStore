Untuk membuat aplikasi GameStore semakin lengkap dan menarik (terutama dalam meningkatkan retensi pengguna dan interaksi sosial), saya mengusulkan implementasi 3 fitur utama berikut:

1.  **Sistem Voucher/Kupon Diskon**
    *   **Fitur:** Menambahkan mekanisme redeem kode voucher saat checkout untuk mendapatkan potongan harga tambahan.
    *   **Manfaat:** Meningkatkan konversi penjualan dan memberikan insentif kepada pengguna untuk berbelanja.
    *   **Langkah:**
        *   Menambahkan model `Voucher` di database.
        *   Membuat API endpoint untuk validasi dan penggunaan voucher.
        *   Menambahkan input field "Redeem Code" di halaman Cart/Checkout.

2.  **Sistem "Follow" Publisher**
    *   **Fitur:** Pengguna dapat mengikuti (follow) publisher favorit mereka.
    *   **Manfaat:** Membangun loyalitas terhadap brand/publisher tertentu dan memudahkan user mendapatkan info game terbaru dari mereka.
    *   **Langkah:**
        *   Memanfaatkan model `Follow` yang sudah ada di schema.
        *   Menambahkan tombol "Follow" di halaman profil Publisher.
        *   Menampilkan update dari publisher yang difollow di feed user.

3.  **Dashboard Analytics Visual (Chart)**
    *   **Fitur:** Menampilkan grafik pendapatan dan penjualan yang menarik secara visual bagi Admin dan Publisher.
    *   **Manfaat:** Memberikan insight bisnis yang lebih jelas dan profesional.
    *   **Langkah:**
        *   Menggunakan library `recharts` (sudah terinstall).
        *   Membuat komponen grafik di `AdminDashboard` untuk visualisasi data transaksi.

Saya akan mulai dengan **Sistem Voucher** terlebih dahulu karena ini berdampak langsung pada penjualan, kemudian dilanjutkan dengan fitur sosial dan analitik. Apakah Anda setuju dengan urutan prioritas ini?