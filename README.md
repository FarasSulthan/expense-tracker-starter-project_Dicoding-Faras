# Expense Tracker App

Submission proyek akhir kelas **Membuat Front-End Web untuk Pemula** di platform Dicoding Indonesia, disusun oleh **Faras Sulthan Pratama (farasha)**.

Aplikasi ini merupakan pelacak keuangan pribadi (Personal Finance & Expense Tracker) berbasis web yang memungkinkan pengguna mencatat pemasukan dan pengeluaran, melihat ringkasan saldo, serta mencari riwayat transaksi. Seluruh logika dibangun menggunakan **JavaScript murni (Vanilla JS)** tanpa library eksternal.

---

## Deskripsi Proyek

Expense Tracker App adalah aplikasi web statis (tanpa backend) yang berfungsi sebagai alat pencatatan keuangan harian. Pengguna dapat:

- Menambahkan transaksi baru dengan keterangan, nominal, tanggal, dan klasifikasi (pemasukan atau pengeluaran).
- Melihat daftar transaksi yang dipisahkan ke dalam dua kolom: **Arus Pemasukan** dan **Arus Pengeluaran**.
- Melihat **dashboard ringkasan keuangan** berupa saldo saat ini, total pemasukan, dan total pengeluaran yang diperbarui secara otomatis.
- Mengedit data transaksi yang sudah tercatat.
- Menghapus transaksi dari daftar.
- Mengubah tipe transaksi (pemasukan menjadi pengeluaran, atau sebaliknya) dengan satu klik tombol.
- Mencari transaksi berdasarkan kata kunci pada keterangan, dengan hasil pencarian yang langsung ditampilkan secara real-time.
- Menyimpan seluruh data secara persisten di browser menggunakan **Web Storage API (localStorage)**, sehingga data tidak hilang meskipun halaman di-refresh.

---

## Teknologi yang Digunakan

| Komponen | Teknologi |
|---|---|
| Struktur Halaman | HTML5 Semantic |
| Styling | Vanilla CSS (dark theme, glassmorphism, responsive) |
| Logika Aplikasi | JavaScript (ES6+), tanpa library eksternal |
| Penyimpanan Data | Web Storage API (localStorage) |
| Font | Google Fonts (Outfit, JetBrains Mono) |

---

## Struktur File

```
expense-tracker-starter-project_Dicoding Faras/
|-- README.md                              <-- File dokumentasi ini
|-- expense-tracker-starter-project/
    |-- index.html                         <-- Struktur halaman utama
    |-- style.css                          <-- Seluruh styling dan tema visual
    |-- main.js                            <-- Logika JavaScript aplikasi
    |-- README.md                          <-- Panduan starter project dari Dicoding
    |-- submission-rubric.md               <-- Rubrik penilaian submission
```

---

## Cara Menjalankan

Proyek ini adalah halaman web statis, sehingga **tidak memerlukan instalasi atau konfigurasi** apapun.

**Opsi 1 - Live Server (Disarankan):**
1. Buka folder proyek di Visual Studio Code.
2. Klik kanan pada file `index.html` di dalam folder `expense-tracker-starter-project`.
3. Pilih "Open with Live Server".
4. Browser akan terbuka secara otomatis.

**Opsi 2 - Buka Langsung:**
1. Navigasi ke folder `expense-tracker-starter-project`.
2. Klik dua kali file `index.html` untuk membukanya di browser.

---

## Penjelasan Kode

### 1. index.html -- Struktur Halaman

File HTML menyusun seluruh kerangka antarmuka aplikasi menggunakan elemen semantik. Halaman terbagi menjadi beberapa bagian utama:

**Header (`tracker-header`)**
Menampilkan nama aplikasi "Tracker.io", tautan navigasi ke profil Dicoding, serta informasi pengguna berupa sapaan nama lengkap dan username Dicoding.

**Ringkasan Keuangan (`tracker-summary`)**
Terdiri dari tiga kartu informasi yang ditampilkan dalam grid layout:
- Saldo Saat Ini -- menampilkan selisih antara total pemasukan dan pengeluaran.
- Total Pemasukan -- akumulasi seluruh transaksi bertipe income.
- Total Pengeluaran -- akumulasi seluruh transaksi bertipe expense.

Nilai ketiga kartu ini di-update secara dinamis oleh JavaScript.

**Formulir Pencatatan (`tracker-form`)**
Form HTML dengan empat field input:
- `transactionFormTitleInput` -- input teks untuk keterangan transaksi.
- `transactionFormAmountInput` -- input angka untuk nominal (dalam Rupiah).
- `transactionFormDateInput` -- input tanggal transaksi.
- `transactionFormTypeSelect` -- dropdown untuk memilih tipe: "Uang Masuk (+)" atau "Uang Keluar (-)".

Tombol submit berfungsi ganda: sebagai tombol "Catat Sekarang" pada mode tambah, dan berubah menjadi tombol "Perbarui" saat pengguna sedang mengedit transaksi.

**Pencarian (`tracker-search`)**
Kolom pencarian dengan input bertipe `search` yang memungkinkan pengguna memfilter daftar transaksi berdasarkan kata kunci pada keterangan.

**Daftar Transaksi (`tracker-history`)**
Ditampilkan dalam dua kolom grid:
- Kolom kiri (`incomeList`) -- menampilkan kartu-kartu transaksi pemasukan.
- Kolom kanan (`expenseList`) -- menampilkan kartu-kartu transaksi pengeluaran.

Kartu transaksi di-generate secara dinamis oleh JavaScript melalui `document.createElement()`.

**Footer**
Menampilkan informasi hak cipta dan tautan ke profil Dicoding.

Setiap elemen interaktif memiliki atribut `data-testid` yang digunakan oleh sistem penilaian otomatis Dicoding untuk memverifikasi struktur aplikasi.

---

### 2. main.js -- Logika Aplikasi

File JavaScript berisi seluruh logika aplikasi yang diorganisasi ke dalam beberapa lapisan:

**Data Layer (Lapisan Data)**
```javascript
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let editingId = null;
```
- Variabel `transactions` menyimpan array seluruh objek transaksi. Saat halaman dimuat, data diambil dari `localStorage` menggunakan `JSON.parse()`. Jika belum ada data tersimpan, digunakan array kosong sebagai nilai awal.
- Variabel `editingId` menyimpan ID transaksi yang sedang diedit. Bernilai `null` saat dalam mode tambah.
- Fungsi `generateId()` membuat ID unik menggunakan `+new Date()` yang menghasilkan timestamp dalam milidetik.
- Fungsi `saveToStorage()` menyimpan array `transactions` ke `localStorage` dalam bentuk string JSON.

**Custom Event (Sinyal Kustom)**
```javascript
function notifyDataChanged() {
  saveToStorage();
  document.dispatchEvent(new Event('transaction:updated'));
}
```
Setiap kali data berubah (tambah, edit, hapus, atau ubah tipe), fungsi `notifyDataChanged()` dipanggil. Fungsi ini menyimpan data ke `localStorage`, lalu memancarkan custom event bernama `transaction:updated`. Satu listener global menangkap event ini dan menjalankan rendering ulang seluruh tampilan serta pembaruan dashboard.

**DOM References (Referensi Elemen)**
Seluruh elemen HTML yang dibutuhkan diambil menggunakan `getElementById()` dan `querySelector()`, kemudian disimpan ke dalam variabel konstan agar tidak perlu mengambilnya berulang kali.

**Format Helper**
```javascript
function formatRupiah(amount) {
  return 'Rp' + amount.toLocaleString('id-ID');
}
```
Fungsi pembantu yang memformat angka menjadi format mata uang Rupiah Indonesia menggunakan `toLocaleString('id-ID')` untuk pemisah ribuan dengan titik.

**Render Functions (Fungsi Rendering)**

- `createTransactionCard(tx)` -- membuat satu elemen kartu transaksi menggunakan `document.createElement()`. Setiap kartu memiliki: ikon arah transaksi, judul, tanggal, nominal, badge tipe, serta tiga tombol aksi (Ubah Tipe, Edit, Hapus). Setiap tombol memiliki event listener yang memanggil fungsi CRUD terkait.

- `renderTransactions(data)` -- menerima array transaksi (bisa berupa hasil filter pencarian), mengosongkan kedua kontainer daftar, lalu mengiterasi array untuk memasukkan setiap kartu ke kontainer yang sesuai (`incomeList` atau `expenseList`). Jika salah satu daftar kosong, ditampilkan pesan "Belum ada pemasukan/pengeluaran."

- `updateDashboard()` -- menghitung total pemasukan, total pengeluaran, dan saldo (pemasukan dikurangi pengeluaran) menggunakan kombinasi `filter()` dan `reduce()`, kemudian memperbarui teks pada elemen dashboard.

**Form Handling (Penanganan Formulir)**

- `validateForm(title, amount)` -- melakukan validasi input: memastikan judul tidak kosong dan nominal minimal Rp 1. Menampilkan `alert()` jika validasi gagal.

- Event listener pada `transactionForm` menangani event `submit`. Saat dikirim:
  1. Mencegah reload halaman dengan `e.preventDefault()`.
  2. Mengambil nilai dari keempat field input.
  3. Menjalankan validasi.
  4. Jika `editingId` tidak null (mode edit), data transaksi yang sesuai diperbarui menggunakan spread operator, lalu form dikembalikan ke mode tambah.
  5. Jika mode tambah, objek transaksi baru dibuat dengan ID unik dan ditambahkan ke array.
  6. Form direset dan `notifyDataChanged()` dipanggil.

**CRUD Operations**

- `deleteTransaction(id)` -- menghapus transaksi dari array menggunakan `filter()` yang menyisakan semua transaksi kecuali yang ID-nya cocok.

- `startEdit(id)` -- mengisi form dengan data transaksi yang dipilih, mengubah teks tombol submit menjadi "Perbarui", mengubah heading form menjadi "Edit Pencatatan", dan melakukan scroll halaman ke form secara smooth.

- `toggleType(id)` -- mengubah tipe transaksi dari `income` ke `expense` atau sebaliknya menggunakan operator ternary.

**Search (Pencarian)**

Pencarian diimplementasikan melalui dua event listener:
- `submit` pada form pencarian -- mencegah reload dan menjalankan pencarian.
- `input` pada kolom pencarian -- menjalankan pencarian secara real-time setiap kali pengguna mengetik.

Fungsi `performSearch()` mengambil kata kunci, mengubahnya ke huruf kecil, lalu memfilter array transaksi yang judulnya mengandung kata kunci tersebut menggunakan `includes()`. Jika kata kunci kosong, seluruh daftar transaksi ditampilkan kembali.

**Custom Event Listener**
```javascript
document.addEventListener('transaction:updated', () => {
  renderTransactions(transactions);
  updateDashboard();
});
```
Satu listener global yang merespons event `transaction:updated`. Setiap kali event ini diterima, seluruh daftar transaksi di-render ulang dan dashboard diperbarui. Pola ini memisahkan logika data dari logika tampilan.

**Inisialisasi**
Saat halaman pertama kali dimuat:
- Tanggal pada input form diatur ke hari ini menggunakan `new Date().toISOString().split('T')[0]`.
- Transaksi yang tersimpan di `localStorage` ditampilkan ke layar.
- Dashboard dihitung dan ditampilkan.

---

### 3. style.css -- Desain Visual

File CSS menerapkan tema **Warm-Dark dengan efek Glassmorphism** yang memberikan tampilan premium dan modern:

**Sistem Warna**
Menggunakan CSS Custom Properties (variabel) dengan palet warna gelap hangat:
- Background utama: hitam hangat (`#0c0a09`).
- Kartu menggunakan latar semi-transparan dengan `rgba()` dan efek `backdrop-filter: blur(20px)` untuk memberikan kesan kaca buram (glassmorphism).
- Aksen utama menggunakan warna ungu (`#a78bfa`) untuk elemen interaktif.
- Hijau (`#34d399`) untuk menandai pemasukan.
- Oranye (`#fb923c`) untuk menandai pengeluaran.

**Tipografi**
- Font utama: **Outfit** (dari Google Fonts) untuk teks umum.
- Font monospace: **JetBrains Mono** untuk tampilan angka (nominal dan saldo).

**Efek Visual**
- Gradien radial pada background body untuk efek pencahayaan ambient.
- Animasi shimmer pada bagian atas kartu saldo menggunakan `@keyframes`.
- Animasi `fadeInUp` pada section saat halaman dimuat pertama kali.
- Transisi hover yang halus pada kartu, tombol, dan item transaksi.
- Efek `translateY` dan `scale` pada hover untuk memberikan kesan interaktif.
- Shadow dan glow pada elemen yang di-hover.

**Layout Responsif**
Menggunakan CSS Grid dan Flexbox dengan tiga breakpoint media query:
- Desktop (lebih dari 1024px): layout grid 3 kolom untuk ringkasan, 5 kolom untuk form, dan 2 kolom untuk daftar transaksi.
- Tablet (1024px ke bawah): grid ringkasan menjadi 2 kolom, form menjadi 2 kolom, daftar transaksi menjadi 1 kolom.
- Mobile (768px ke bawah): semua grid menjadi 1 kolom, padding dikurangi, header dan footer menjadi vertikal.
- Small Mobile (640px ke bawah): form pencarian menjadi vertikal, kartu transaksi menggunakan flex-wrap.

**Aksesibilitas**
- Class `.visually-hidden` untuk menyembunyikan heading secara visual namun tetap terbaca oleh screen reader.
- Atribut `aria-label` dan `aria-labelledby` pada elemen interaktif.
- Custom scrollbar yang minimalis.

---

## Fitur Utama

| No | Fitur | Penjelasan |
|---|---|---|
| 1 | Tambah Transaksi | Mencatat transaksi baru dengan keterangan, nominal, tanggal, dan tipe |
| 2 | Edit Transaksi | Mengubah data transaksi yang sudah tercatat melalui form yang sama |
| 3 | Hapus Transaksi | Menghapus transaksi dari daftar dan localStorage |
| 4 | Ubah Tipe | Memindahkan transaksi dari pemasukan ke pengeluaran atau sebaliknya |
| 5 | Pencarian Real-time | Memfilter transaksi berdasarkan kata kunci saat pengguna mengetik |
| 6 | Dashboard Ringkasan | Menampilkan saldo, total pemasukan, dan total pengeluaran secara dinamis |
| 7 | Persistensi Data | Data tersimpan di localStorage dan tetap ada setelah halaman di-refresh |
| 8 | Validasi Form | Mencegah penyimpanan data jika keterangan kosong atau nominal kurang dari 1 |
| 9 | Custom Event | Pembaruan tampilan dilakukan melalui event kustom `transaction:updated` |
| 10 | Desain Responsif | Tampilan menyesuaikan di desktop, tablet, dan mobile |

---

## Kriteria Submission yang Dipenuhi

Berdasarkan rubrik penilaian Dicoding, aplikasi ini memenuhi seluruh kriteria pada level **Advanced (4 poin)** untuk ketiga kriteria:

**Kriteria 1 - Manipulasi DOM untuk Form dan Daftar Transaksi (Advanced):**
- Transaksi pemasukan masuk ke `incomeList`, pengeluaran masuk ke `expenseList`.
- Validasi input form dengan `alert()` untuk judul kosong atau nominal kurang dari 1.
- Panel dashboard menampilkan ringkasan keuangan yang diperbarui otomatis.

**Kriteria 2 - Pengelolaan Web Storage API (Advanced):**
- Data disimpan ke `localStorage` dengan `JSON.stringify()` dan dimuat dengan `JSON.parse()`.
- Tombol Hapus menghapus data dari tampilan dan `localStorage`.
- Tombol Edit mengisi form dan memungkinkan pembaruan data.
- Pembaruan tampilan menggunakan Custom Event melalui `dispatchEvent()`.

**Kriteria 3 - Fitur Interaktif (Advanced):**
- Tombol Ubah Tipe memindahkan transaksi antar kategori.
- Pencarian real-time memfilter transaksi berdasarkan kata kunci.
- Saat kolom pencarian dikosongkan, seluruh transaksi ditampilkan kembali.

---

## Informasi Pengembang

| Detail | Keterangan |
|---|---|
| Nama | Faras Sulthan Pratama |
| Username Dicoding | farasha |
| Kelas | Membuat Front-End Web untuk Pemula |
| Platform | Dicoding Indonesia |
| Tahun | 2026 |
