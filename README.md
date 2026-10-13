# 📋 Task Tracker Kuliah

Aplikasi pencatat dan pengelola tugas kuliah berbasis DOM Manipulation & Event Handling (JavaScript Murni).

## Fitur Utama
1. **Form Tambah Tugas**: Input judul tugas, pilihan mata kuliah, dan tanggal deadline dengan listener `submit` + `e.preventDefault()`, dilengkapi validasi (judul minimal 3 karakter & deadline wajib diisi) serta pesan error langsung di halaman.
2. **State Management & Single `render()`**: Seluruh data disimpan dalam array of objects `{ id, judul, matkul, deadline, selesai }` dan dirender melalui satu fungsi `render()`.
3. **Event Delegation**: Menggunakan satu listener pada elemen `<ul id="task-list">` dengan `e.target.closest()` untuk menangani aksi centang selesai (checkbox) dan hapus tugas.
4. **Filter Status**: Filter tampilan **Semua**, **Aktif**, dan **Selesai** dengan indikator class `on` pada tombol aktif.
5. **Counter & Empty State**: Menampilkan jumlah `"N tugas aktif"` secara dinamis dan pesan informasi ketika daftar kosong.
6. **Keamanan DOM (XSS Safe)**: Seluruh teks dari input pengguna ditampilkan menggunakan `textContent`, bukan `innerHTML` mentah.
7. **Fitur Bonus**:
   - Penyimpanan otomatis ke `localStorage` agar data tetap tersimpan saat halaman dimuat ulang.
   - Pengurutan (*sorting*) otomatis berdasarkan deadline terdekat.

---

## Riwayat Tahapan Commit Git
1. `feat(struktur)`: Struktur dasar HTML (`index.html`), styling CSS (`style.css`), dan seleksi elemen DOM awal (`app.js` dengan `defer`).
2. `feat(render)`: State array of objects dan fungsi `render()` menggunakan `textContent` beserta counter tugas aktif.
3. `feat(form)`: Event listener `submit` form, `e.preventDefault()`, dan validasi input beserta pesan error di halaman.
4. `feat(delegation)`: Implementasi event delegation pada `<ul>` (`e.target.closest()`) untuk toggle status selesai dan hapus tugas.
5. `feat(filter)`: Filter Semua/Aktif/Selesai dengan class `on`, sorting deadline terdekat, dan penyimpanan `localStorage`.

---

## Deklarasi Penggunaan AI & Log Prompt
Sesuai aturan perkuliahan Pemrograman Web, berikut adalah log penggunaan asisten AI dalam pengerjaan tugas ini:

- **Tools AI yang digunakan**: Google Antigravity (Gemini)
- **Log Prompt Singkat**:
  1. *"Didalam folder Task Tracker Kuliah, kerjakan tugas ini sesuai dengan perintah yaitu ngepush 5x, jadi nanti kerjakan secara bertahap dulu."* -> Menyusun rencana 5 tahapan commit (`struktur` → `render` → `form` → `delegation` → `filter`).
  2. *"Oke sekarang mandirilah dengan ngepush dan koneksikan dengan link github ini https://github.com/s4tr10/Pemweb-Task-Tracker-Kuliah, lakukanlah setiap step, dari kode commit 1-5."* -> Mengimplementasikan kode secara bertahap dari struktur HTML/CSS, fungsi `render()`, validasi form `submit`, event delegation `<ul>`, hingga filter dan `localStorage`.
