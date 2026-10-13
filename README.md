# 📋 Task Tracker Kuliah (v1 & v2 · REST API)

Aplikasi pencatat dan pengelola tugas kuliah berbasis DOM Manipulation, Event Delegation, Asynchronous JavaScript (`async`/`await`), `Promise.all`, dan integrasi REST API.

---

## Fitur Task Tracker Kuliah v2 (REST API)
1. **Muat dari Server (`GET /api/tugas`)**: Memuat data tugas saat halaman dibuka dengan tampilan state **loading** (skeleton + teks), **error + tombol Coba Lagi**, dan **kosong**.
2. **Tambah Tugas (`POST /api/tugas`)**: Mengirimkan header & body JSON ke server. Tombol **Tambah** otomatis nonaktif (`disabled`) selama proses pengiriman dan menampilkan pesan error validasi dari server (`HTTP 400`).
3. **Selesai & Hapus via Event Delegation (`PATCH` & `DELETE`)**:
   - Centang selesai memanggil `PATCH /api/tugas/:id` dan memperbarui state dari respons server.
   - Hapus tugas memanggil `DELETE /api/tugas/:id` (`204 No Content`).
4. **Helper `api()`**: Satu fungsi terpusat yang membungkus `fetch()`, memeriksa `res.ok`, menangani status `204`, dan melempar `Error` berisi pesan dari server jika gagal.
5. **Muat Paralel (`Promise.all`)**: Memuat daftar tugas (`GET /api/tugas`) dan daftar mata kuliah (`GET /api/matkul` untuk elemen `<select>`) secara paralel.
6. **Tahan Banting (`__API.setMode`)**: Mendukung pengujian kondisi jaringan lewat Console (`__API.setMode("offline")`, `__API.setMode("lambat")`, `__API.setMode("normal")`) maupun lewat dropdown di bagian atas halaman tanpa ada unhandled error di Console.
7. **Fitur Bonus v2**:
   - **Pencarian dengan Debounce**: Filter pencarian judul/mata kuliah dengan `debounce` (250ms).
   - **Optimistic Update**: Saat mencentang selesai atau menghapus tugas, tampilan berubah seketika dan otomatis dibatalkan (*rollback*) apabila server gagal merespons (misalnya saat mode `offline`).

---

## Riwayat Tahapan Commit Git

### Tahap v1 (DOM & Event Handling)
1. `feat(struktur)`: Struktur dasar HTML (`index.html`), styling CSS (`style.css`), dan seleksi elemen DOM awal.
2. `feat(render)`: State array of objects dan fungsi `render()` menggunakan `textContent` beserta counter tugas aktif.
3. `feat(form)`: Event listener `submit` form, `e.preventDefault()`, dan validasi input beserta pesan error di halaman.
4. `feat(delegation)`: Implementasi event delegation pada `<ul>` (`e.target.closest()`) untuk toggle status selesai dan hapus tugas.
5. `feat(filter)`: Filter Semua/Aktif/Selesai dengan class `on`, sorting deadline terdekat, dan penyimpanan `localStorage`.

### Tahap v2 (REST API & Asynchronous JS)
1. `feat(v2-get)`: Tambah Mock API (`mock-api.js`), helper `api()`, dan muat data paralel dengan `Promise.all` (`GET /api/tugas` & `GET /api/matkul`).
2. `feat(v2-render-state)`: Tambah tampilan state loading skeleton, error + tombol Coba Lagi, dan daftar kosong.
3. `feat(v2-post)`: Implementasi tambah tugas via `POST /api/tugas`, nonaktifkan tombol selama mengirim, dan tampilkan pesan error server (`400`).
4. `feat(v2-patch-delete)`: Implementasi selesai (`PATCH /api/tugas/:id`) dan hapus (`DELETE /api/tugas/:id` `204`) via event delegation.
5. `feat(v2-error-handling)`: Tahan banting pada mode `offline`/`lambat`, *optimistic update* dengan rollback otomatis, dan pencarian dengan `debounce`.

---

## Deklarasi Penggunaan AI & Log Prompt
Sesuai aturan perkuliahan Pemrograman Web, berikut adalah log penggunaan asisten AI dalam pengerjaan tugas ini:

- **Tools AI yang digunakan**: Google Antigravity (Gemini)
- **Log Prompt Singkat**:
  1. *"Didalam folder Task Tracker Kuliah, kerjakan tugas ini sesuai dengan perintah yaitu ngepush 5x, jadi nanti kerjakan secara bertahap dulu."* -> Menyusun rencana 5 tahapan commit v1 (`struktur` → `render` → `form` → `delegation` → `filter`).
  2. *"Oke sekarang mandirilah dengan ngepush dan koneksikan dengan link github ini https://github.com/s4tr10/Pemweb-Task-Tracker-Kuliah, lakukanlah setiap step, dari kode commit 1-5."* -> Mengimplementasikan kode v1 secara bertahap dan melakukan push 5 commit ke repository GitHub.
  3. *"Oke sekarang lanjutkan berdasarkan perintah v2 ini, push sesuai arahannya"* -> Melanjutkan pengembangan ke **Task Tracker Kuliah v2 (REST API)** dengan Mock API (`__API.setMode`), helper `api()`, `Promise.all`, state loading/error/retry, `POST`, `PATCH`, `DELETE`, *optimistic update*, dan pencarian *debounce* dalam 5 commit bertahap (`GET` → `render state` → `POST` → `PATCH/DELETE` → `error handling`).
