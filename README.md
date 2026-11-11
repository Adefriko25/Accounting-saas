# 📊 Accounting SaaS - Next.js (Full JavaScript & Modular Architecture)

Aplikasi akuntansi modern berbasis web yang dibangun **100% menggunakan JavaScript (Next.js 14 Fullstack)**. Dirancang khusus untuk performa tinggi, tampilan premium glassmorphism dark theme, arsitektur modular terpisah per folder (**Frontend, Backend, dan Database**), serta **100% kompatibel dengan Vercel & Neon PostgreSQL Serverless**.

> 💡 **No Python Required**: Seluruh frontend, backend API routes, kalkulasi akuntansi, dan database queries dijalankan langsung dalam runtime Node.js/Vercel Serverless tanpa dependensi Python apapun!

---

## 📁 Struktur Direktori Modular (FE, BE, & DB)

Proyek ini telah dirapikan ke dalam pemisahan tanggung jawab (*Separation of Concerns*) yang sangat jelas:

```text
accounting_saas/
├── src/
│   │
│   ├── db/                                # 🗄️ DATABASE LAYER
│   │   ├── index.js                       # Koneksi SQL Neon Serverless
│   │   ├── schema.js                      # DDL & Auto-inisialisasi tabel
│   │   └── queries/                       # Query SQL modular
│   │       ├── accounts.js                # Query CRUD Akun
│   │       └── transactions.js            # Query CRUD Transaksi & Reset
│   │
│   ├── backend/                           # ⚙️ BACKEND (LOGIC & SERVICES)
│   │   ├── services/
│   │   │   ├── accounting.service.js      # Engine kalkulasi akuntansi (Pure JS)
│   │   │   ├── accounts.service.js        # Validasi & aturan bisnis akun
│   │   │   └── transactions.service.js    # Validasi & aturan bisnis transaksi
│   │   └── utils/
│   │       └── response.js                # Standard API response helpers
│   │
│   ├── frontend/                          # 🎨 FRONTEND LAYER
│   │   ├── components/                    # Komponen UI Reusable
│   │   │   ├── Sidebar.jsx                # Navigasi sidebar
│   │   │   ├── MobileTopbar.jsx           # Topbar mobile responsive
│   │   │   ├── ToastContainer.jsx         # Notifikasi toast alert
│   │   │   ├── EmptyState.jsx             # Card empty state
│   │   │   └── LoadingSpinner.jsx         # Indikator loading
│   │   ├── views/                         # Layar modul masing-masing fitur
│   │   │   ├── DashboardView.jsx          # Modul 1: Dashboard & Charts
│   │   │   ├── AccountsView.jsx           # Modul 2: Chart of Accounts & Danger Zone
│   │   │   ├── JournalView.jsx            # Modul 3: Input Jurnal & Riwayat
│   │   │   ├── LedgerView.jsx             # Modul 4: Buku Besar (General Ledger)
│   │   │   ├── TrialBalanceView.jsx       # Modul 5: Neraca Saldo
│   │   │   ├── IncomeStatementView.jsx    # Modul 6: Laba Rugi (P&L)
│   │   │   ├── BalanceSheetView.jsx       # Modul 7: Neraca (Balance Sheet)
│   │   │   └── CashflowView.jsx           # Modul 8: Laporan Arus Kas
│   │   ├── constants/
│   │   │   └── navigation.js              # Daftar menu navigasi
│   │   └── utils/
│   │       └── formatters.js              # Helper format mata uang Rupiah
│   │
│   └── app/                               # 🚀 NEXT.JS APP ROUTER
│       ├── api/                           # Endpoint API Controllers
│       │   ├── accounts/
│       │   ├── transactions/
│       │   ├── dashboard/
│       │   ├── ledger/
│       │   ├── trial-balance/
│       │   ├── income-statement/
│       │   ├── balance-sheet/
│       │   ├── cashflow/
│       │   └── reset/
│       ├── globals.css                    # Glassmorphism Dark Theme CSS
│       ├── layout.js                      # Root Layout
│       └── page.js                        # Main Page Orchestrator
│
├── .env.local                             # Variabel lingkungan database
├── jsconfig.json                          # Path mapping alias (@/*)
├── next.config.js                         # Konfigurasi Next.js
├── package.json                           # Dependencies & NPM scripts
└── tailwind.config.js                     # Tailwind config
```

---

## 🛠️ Fitur Finansial Lengkap

1. 📊 **Financial Dashboard**: Metrik kunci (Revenue, Net Profit, Kas Masuk/Keluar, MoM Growth, Margins) serta grafik batang & donat interaktif (Recharts).
2. 📒 **Chart of Accounts (COA)**: Tambah akun baru & **Hapus Akun** (dengan proteksi jika akun sudah memiliki transaksi).
3. 📝 **Input Journal**: Form input transaksi debit & kredit seimbang dengan riwayat dan **Hapus Transaksi**.
4. 📖 **General Ledger (Buku Besar)**: Buku besar per akun dengan perhitungan **Saldo Berjalan** (*running balance*) otomatis.
5. ⚖️ **Trial Balance (Neraca Saldo)**: Validasi otomatis keseimbangan total debit dan kredit (*Balanced Indicator*).
6. 💰 **Income Statement (Laba Rugi)**: Laporan P&L akrual bulanan dan akumulasi tahun penuh (*Full Year*).
7. 📑 **Balance Sheet (Neraca)**: Posisi Aset, Kewajiban, dan Ekuitas bulanan (termasuk *Retained Earnings* otomatis).
8. 💸 **Cashflow Statement**: Pelacakan arus kas masuk, keluar, dan neto pada akun Kas/Bank pilihan.
9. ⚠️ **Danger Zone**: Fitur reset total database pembukuan secara aman.

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

### 3. Jalankan Aplikasi
```bash
npm install
npm run dev
```
Buka browser di `http://localhost:3000`.

---

## 🚀 Panduan Deployment ke Vercel

### Cara 1: Deploy Langsung via GitHub
1. Push kode ke GitHub:
   ```bash
   git push origin main
   ```
2. Buka dashboard proyek di **[Vercel](https://vercel.com)**.
3. Di tab **Settings** > **Environment Variables**, tambahkan:
   - **Key**: `DATABASE_URL`
   - **Value**: Connection string dari Neon PostgreSQL Anda
   - **Environments**: Centang *Production*, *Preview*, *Development*
4. Klik **Redeploy** di tab **Deployments**.

### Cara 2: Buat Database Neon Langsung dari Dashboard Vercel (1-Klik)
1. Buka proyek Anda di Vercel.
2. Klik tab **Storage** di atas.
3. Klik **Connect Database** > pilih **Neon (Postgres)** > klik **Create New**.
4. Vercel akan **otomatis** mengisikan environment variable `DATABASE_URL` ke proyek Anda!
5. Lakukan redeploy, dan aplikasi langsung aktif 100%!
