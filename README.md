# 📊 Accounting SaaS - Next.js (Full JavaScript & Vercel Native)

Aplikasi akuntansi modern berbasis web yang dibangun **100% menggunakan JavaScript (Next.js 14 Fullstack)**. Dirancang khusus untuk performa tinggi, tampilan premium glassmorphism dark theme, dan **100% kompatibel dengan Vercel & Neon PostgreSQL Serverless**.

> 💡 **No Python Required**: Seluruh frontend, backend API routes, kalkulasi akuntansi, dan database queries dijalankan langsung dalam runtime Node.js/Vercel Serverless tanpa dependensi Python apapun!

---

## 🛠️ Tech Stack & Fitur

### Fullstack Framework
- **Framework**: Next.js 14 (App Router)
- **Runtime**: Node.js Serverless (Vercel Native)
- **Database**: [Neon PostgreSQL](https://neon.tech) Serverless via `@neondatabase/serverless` (HTTP querying, instan, zero cold-start, auto-scaling)
- **Styling**: Tailwind CSS + Custom Glassmorphism Dark Theme
- **Charts**: Recharts (Modern & responsif)
- **Icons**: Lucide React

### 8 Modul Finansial + Fitur Khusus
1. 📊 **Financial Dashboard**: Metrik kunci (Revenue, Net Profit, Cash In/Out, MoM Growth, Margins) serta grafik interaktif.
2. 📒 **Chart of Accounts (COA)**: Tambah akun baru & hapus akun dengan proteksi transaksi.
3. 📝 **Input Journal**: Form input transaksi debit & kredit seimbang dengan riwayat dan fitur hapus transaksi.
4. 📖 **General Ledger (Buku Besar)**: Buku besar per akun dengan saldo berjalan (*running balance*) otomatis.
5. ⚖️ **Trial Balance (Neraca Saldo)**: Validasi otomatis keseimbangan total debit dan kredit (*Balanced check*).
6. 💰 **Income Statement (Laba Rugi)**: Laporan P&L akrual bulanan dan akumulasi tahun penuh (*Full Year*).
7. 📑 **Balance Sheet (Neraca)**: Posisi Aset, Kewajiban, dan Ekuitas bulanan (termasuk *Retained Earnings* otomatis).
8. 💸 **Cashflow Statement**: Pelacakan arus kas masuk, keluar, dan neto pada akun Kas/Bank pilihan.
9. ⚠️ **Danger Zone**: Fitur reset total data pembukuan.

---

## 📁 Struktur Direktori

```text
accounting_saas/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── accounts/
│   │   │   │   ├── route.js              # GET & POST akun
│   │   │   │   └── [name]/route.js       # DELETE akun
│   │   │   ├── transactions/
│   │   │   │   ├── route.js              # GET & POST transaksi
│   │   │   │   └── [id]/route.js         # DELETE transaksi
│   │   │   ├── dashboard/route.js        # API Dashboard data & charts
│   │   │   ├── ledger/route.js           # API Buku Besar
│   │   │   ├── trial-balance/route.js    # API Neraca Saldo
│   │   │   ├── income-statement/route.js # API Laporan Laba Rugi
│   │   │   ├── balance-sheet/route.js    # API Neraca
│   │   │   ├── cashflow/route.js         # API Arus Kas
│   │   │   └── reset/route.js            # API Reset Database
│   │   ├── globals.css                   # Glassmorphism Dark CSS & Responsive
│   │   ├── layout.js                     # Root Layout
│   │   └── page.js                       # Frontend SPA Komprehensif
│   └── lib/
│       ├── accounting.js                 # Engine Perhitungan Akuntansi (Pure JS)
│       └── db.js                         # Database Connection & Query (Neon)
├── .env.local                            # Variabel lingkungan database
├── jsconfig.json                         # Path mapping alias (@/*)
├── next.config.js                        # Konfigurasi Next.js
├── package.json                          # Dependencies & NPM scripts
├── postcss.config.js                     # PostCSS config
└── tailwind.config.js                    # Tailwind config
```

---

## 💻 Panduan Menjalankan Secara Lokal

### 1. Buat Database Neon PostgreSQL Gratis (1 Menit)
1. Buka [neon.tech](https://neon.tech) dan daftar/masuk gratis.
2. Buat project database baru (misal: `accounting-saas`).
3. Salin connection string **PostgreSQL**, formatnya:
   ```text
   postgresql://username:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Konfigurasi Environment Variable
Buka file `.env.local` di folder root dan isi:
```env
DATABASE_URL=postgresql://username:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
```

> **Catatan**: Tabel `accounts` dan `transactions` akan dibuat secara **otomatis** oleh sistem pada request pertama! Anda tidak perlu menjalankan SQL migration manual.

### 3. Install & Jalankan
```bash
npm install
npm run dev
```
Buka browser di `http://localhost:3000`.

---

## 🚀 Panduan Deployment ke Vercel

Karena aplikasi ini sekarang sudah menggunakan Next.js standar, proses deploy ke Vercel sangat mulus tanpa konfigurasi khusus:

### Cara 1: Deploy Langsung via GitHub
1. Push kode ke GitHub:
   ```bash
   git add .
   git commit -m "Migrate to Next.js full JavaScript with Neon PostgreSQL"
   git push origin main
   ```
2. Buka dashboard proyek di **[Vercel](https://vercel.com)**.
3. Di tab **Settings** > **Environment Variables**, tambahkan:
   - **Key**: `DATABASE_URL`
   - **Value**: Connection string dari Neon PostgreSQL Anda
   - **Environments**: Centang *Production*, *Preview*, *Development*
4. Klik **Redeploy** di tab **Deployments**.

### Cara 2: Buat Database Neon Langsung dari Dashboard Vercel (Paling Mudah)
1. Buka proyek Anda di Vercel.
2. Klik tab **Storage** di atas.
3. Klik **Connect Database** > pilih **Neon (Postgres)** > klik **Create New**.
4. Vercel akan **otomatis** mengisikan environment variable `DATABASE_URL` atau `POSTGRES_URL` ke proyek Anda!
5. Trigger redeploy, dan aplikasi langsung aktif 100%!
