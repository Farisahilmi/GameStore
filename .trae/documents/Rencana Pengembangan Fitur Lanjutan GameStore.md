## Rencana Penambahan Fitur Unggulan GameStore

### 1. Implementasi Sistem "Follow" Publisher
- **Backend:** 
    - Menambahkan model `Follow` di [schema.prisma](file:///d:/GameStore/server/prisma/schema.prisma) untuk menghubungkan `User` dan `Publisher`.
    - Membuat API endpoint untuk Follow/Unfollow dan mendapatkan daftar publisher yang diikuti.
- **Frontend:** 
    - Menambahkan tombol "Follow" di halaman [PublisherProfile.jsx](file:///d:/GameStore/client/src/components/PublisherProfile.jsx).
    - Menambahkan tab "Following" di halaman profil user.

### 2. Dashboard Analytics Visual (Chart)
- **Library:** Menginstal `recharts` di folder client.
- **Frontend:** 
    - Menambahkan grafik garis/batang di [AdminDashboard.jsx](file:///d:/GameStore/client/src/AdminDashboard.jsx) untuk menampilkan data transaksi mingguan/bulanan bagi Publisher.
- **Backend:** 
    - Membuat endpoint khusus untuk agregat data penjualan berdasarkan waktu.

### 3. Integrasi Feed Dev Studio di Home
- **Frontend:** 
    - Menambahkan section "Recent Dev Updates" di [App.jsx](file:///d:/GameStore/client/src/App.jsx) (Home) yang menarik data dari tabel `DevProject`.
    - User bisa melihat progres terbaru dari game yang sedang dikembangkan secara real-time.

**Apakah Anda setuju dengan rencana ini, atau ada fitur lain yang lebih ingin Anda prioritaskan?**
