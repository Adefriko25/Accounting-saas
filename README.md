# 📊 Accounting SaaS - React + Python Flask (Vercel-Ready)

Selamat datang di repositori **Accounting SaaS**! Proyek ini adalah aplikasi akuntansi berbasis web satu halaman (Single Page Application - SPA) yang modern, cepat, berpenampilan premium, dan dirancang khusus agar **100% Vercel-Ready** dengan integrasi database MySQL.

Aplikasi ini merupakan hasil migrasi dan modernisasi total dari aplikasi Streamlit lama ke arsitektur web modern kelas SaaS.

---

## 🛠️ Tech Stack & Fitur Utama

### Frontend (Modern SPA)
- **Framework**: React 19 + Vite 8 (Luar biasa cepat)
- **Desain**: Vanilla CSS Premium dengan tema **Glassmorphism Dark Theme** yang elegan dan responsif seluler.
- **Grafik/Visualisasi**: **ApexCharts** untuk diagram interaktif.
- **Ikon**: **Lucide Icons** yang konsisten dan minimalis.

### Backend (Serverless API)
- **Framework**: Python Flask (Ringan, cepat, tanpa dependensi besar seperti Pandas/Plotly untuk cold-start optimal).
- **Database Driver**: `mysql-connector-python` untuk integrasi SQL langsung.
- **Koneksi Database**: Penanganan koneksi serverless dinamis (membuka dan menutup koneksi per request untuk mencegah kebocoran koneksi di cloud).

### Fitur Finansial
1. **Financial Dashboard**: Metrik bisnis utama (Revenue, Net Profit, Cash In/Out, MoM Growth, Margins) dan grafik interaktif.
2. **Chart of Accounts (COA)**: Tambah dan kelola akun keuangan berdasar tipe (Asset, Liability, Equity, Revenue, COGS, Expense).
3. **Input Journal**: Form input jurnal umum berpasangan (debit & kredit) lengkap dengan riwayat dan fitur hapus transaksi.
4. **General Ledger (Buku Besar)**: Buku besar per akun dengan perhitungan saldo berjalan otomatis secara kronologis.
5. **Trial Balance (Neraca Saldo)**: Pengecekan keseimbangan saldo debit dan kredit secara otomatis (Balanced check).
6. **Income Statement (Laporan Laba Rugi)**: Laporan P&L bulanan (matriks bulanan) beserta akumulasi tahunan.
7. **Balance Sheet (Neraca)**: Posisi aset, kewajiban, dan ekuitas bulanan (termasuk Retained Earnings).
8. **Cashflow Statement (Laporan Arus Kas)**: Aliran uang masuk, uang keluar, dan net cashflow pada kas/bank yang dipilih.

---

## 📁 Struktur Direktori Proyek

```text
accounting_saas/
├── api/
│   └── index.py            # Backend Python Flask API (Serverless)
├── frontend/
│   ├── public/             # Aset statis frontend
│   ├── src/
│   │   ├── App.jsx         # Router SPA React, Layout, Laporan, Form & Charts
│   │   ├── index.css       # Sistem desain CSS (Glassmorphism, Dark Theme, Responsive)
│   │   └── main.jsx        # Mount point React
│   ├── package.json        # Dependensi & script React
│   └── vite.config.js      # Konfigurasi Vite & Dev Proxy lokal
├── .streamlit/
│   └── secrets.toml        # Template kredensial database lokal/cloud
├── app.py                  # Aplikasi Streamlit lama (Dipertahankan untuk cadangan)
├── package.json            # Root package.json untuk pemicu build Vercel
├── vercel.json             # Konfigurasi routing & multi-builder Vercel
└── requirements.txt        # Dependensi Python Backend (Ringkas & Cepat)
```

---

## 💻 Panduan Pengembangan Lokal (Local Development)

Untuk menjalankan aplikasi ini secara lokal di komputer Anda, ikuti langkah-langkah berikut:

### Prasyarat
1. Install **Node.js** (versi 18+) di komputer Anda.
2. Install **Python** (versi 3.9+).
3. Pastikan server lokal **MySQL** Anda aktif (misal menggunakan XAMPP atau MySQL Server bawaan).
4. Buat database kosong bernama `accounting_saas` di MySQL lokal Anda.

### Langkah 1: Jalankan Backend Flask
Buka terminal baru di direktori utama (root) proyek ini:
```bash
# Menginstal dependensi Python backend
pip install -r requirements.txt

# Menjalankan server Flask
flask --app api/index run --port 5000
```
*Backend Flask Anda sekarang berjalan secara lokal di `http://127.0.0.1:5000` dan secara otomatis telah membuat tabel-tabel database yang diperlukan.*

### Langkah 2: Jalankan Frontend React
Buka terminal kedua dan masuk ke folder `frontend`:
```bash
# Masuk ke direktori frontend
cd frontend

# Menginstal dependensi React frontend
npm install

# Menjalankan server dev Vite
npm run dev
```
*Frontend React Anda sekarang aktif di `http://localhost:5173`. Semua request data ke `/api` otomatis dialihkan ke port 5000 melalui Vite dev proxy.*

---

## 🚀 Panduan Deployment ke Vercel (Produksi)

Aplikasi ini dikonfigurasi untuk langsung dideploy ke **Vercel** hanya dalam beberapa klik:

### Langkah 1: Siapkan Database MySQL Cloud
Karena Vercel berjalan serverless di cloud, database MySQL Anda juga harus dapat diakses online:
1. Buat database MySQL gratis di **[Aiven.io](https://aiven.io/)** atau TiDB Cloud.
2. Catat info koneksi database: **Host**, **Port**, **User**, **Password**, dan **Database Name**.

### Langkah 2: Unggah ke GitHub
Push seluruh folder proyek ini ke dalam repositori **GitHub** Anda (baik publik maupun privat).

### Langkah 3: Deploy di Vercel
1. Buka **[Vercel Dashboard](https://vercel.com/)** dan klik **Add New > Project**.
2. Hubungkan akun GitHub Anda dan pilih repositori Anda.
3. Vercel akan otomatis mendeteksi set-up proyek.
4. **Sangat Penting:** Buka tab **Environment Variables** di bagian bawah konfigurasi proyek Vercel Anda, lalu masukkan kredensial database cloud dari Langkah 1:
   - `DB_HOST` = "nama-host-db-cloud-anda.com"
   - `DB_USER` = "username-db"
   - `DB_PASSWORD` = "password-db"
   - `DB_NAME` = "nama-database"
   - `DB_PORT` = "3306" (atau port database cloud Anda)
5. Klik **Deploy**! Aplikasi Anda akan selesai dideploy dalam 1-2 menit dan siap diakses secara online dari perangkat mana pun!

---

## 🛡️ Lisensi & Cadangan
- File `app.py` lama dan `.streamlit/` sengaja dipertahankan sebagai cadangan jika sewaktu-waktu Anda ingin menjalankan Streamlit lokal kembali.
- Semua data akuntansi disimpan dengan aman di database MySQL Anda dan dikirim melalui enkripsi aman (HTTPS) di produksi.
