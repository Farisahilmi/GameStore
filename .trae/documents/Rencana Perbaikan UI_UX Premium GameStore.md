Baik, saya akan mengimplementasikan perbaikan UI secara bertahap sesuai urutan fase berikut:

## **Fase 1: Skeleton Loading (Fokus Sekarang)**
Mengganti spinner loading yang kaku dengan tampilan skeleton yang modern.
1.  **Membuat Komponen `Skeleton.jsx`**: Template dasar untuk efek shimmer.
2.  **`GameCardSkeleton`**: Tampilan bayangan kartu game saat loading.
3.  **`HeroSkeleton`**: Tampilan bayangan area banner utama.
4.  **Implementasi**: Memasang skeleton di halaman Home, Browse, dan Library.

## **Fase 2: Konsistensi Tema Global**
Memastikan seluruh halaman mengikuti tema yang dipilih (Steam Dark, Light, Cyberpunk, dll).
1.  **Refactor Dashboard**: Mengupdate `AdminDashboard` dan `ManageGames` agar warna tabel dan card-nya dinamis.
2.  **Static Pages**: Menyesuaikan halaman Support, FAQ, dan Legal dengan sistem tema.

## **Fase 3: Micro-interactions & Feedback**
Menambah detail interaktif agar website terasa lebih "hidup".
1.  **Hover State**: Animasi halus saat mouse diarahkan ke kartu game.
2.  **Button Progress**: Menampilkan indikator loading di dalam tombol saat diklik (misal: "Buying...").
3.  **Navbar Polish**: Memperbaiki transisi dropdown dan menu navigasi.

## **Fase 4: Visual Polish & Responsivitas**
Sentuhan akhir untuk estetika premium.
1.  **Glassmorphism**: Menambahkan efek blur transparan pada elemen UI.
2.  **Mobile Optimization**: Memastikan tabel dashboard terlihat bagus di HP dengan tampilan card-view.

---
Saya akan mulai dengan **Fase 1**. Mohon konfirmasinya untuk mulai menulis kode.