## Rencana Perbaikan Bug & Update Komunitas

### 1. Fix Bug: Conditional Rendering Dev Updates
- **Tugas:** Membungkus `<DevUpdatesFeed />` di dalam komponen `Home` pada [App.jsx](file:///d:/GameStore/client/src/App.jsx) dengan kondisi `{user && ...}`.
- **Hasil:** Feed hanya akan muncul jika user sudah login.

### 2. Sistem Interaksi Review (Upvotes)
- **Backend:** Menambahkan field `helpful` (upvotes) pada model `Review` di [schema.prisma](file:///d:/GameStore/server/prisma/schema.prisma) dan membuat API voting.
- **Frontend:** Menambahkan tombol "Helpful" di setiap review pada halaman [GameDetails.jsx](file:///d:/GameStore/client/src/components/GameDetails.jsx).

### 3. Komentar di Proyek Dev Studio
- **Backend:** Membuat model `DevProjectComment` agar user bisa berinteraksi dengan update dari publisher.
- **Frontend:** Menambahkan kolom komentar di setiap item feed pada [DevUpdatesFeed.jsx](file:///d:/GameStore/client/src/components/DevUpdatesFeed.jsx).

### 4. Notifikasi Otomatis untuk Follower
- **Backend:** Mengintegrasikan [notificationService.js](file:///d:/GameStore/server/src/services/notificationService.js) sehingga setiap kali publisher mengupdate proyek di Dev Studio, semua follower-nya akan mendapat notifikasi real-time via Socket.io.

**Apakah rencana perbaikan bug dan penambahan fitur komunitas ini sudah sesuai dengan keinginanmu?**
