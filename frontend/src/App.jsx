import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileSpreadsheet, 
  BookMarked, 
  Scale, 
  TrendingUp, 
  Activity, 
  Wallet, 
  Plus, 
  Trash2, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle,
  FileText,
  HelpCircle,
  List
} from 'lucide-react';

export default function App() {
  // Navigation & Core States
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Feature specific states
  const [dashboardData, setDashboardData] = useState(null);
  const [ledgerAccount, setLedgerAccount] = useState('');
  const [ledgerData, setLedgerData] = useState(null);
  const [trialBalanceData, setTrialBalanceData] = useState(null);
  const [incomeStatementData, setIncomeStatementData] = useState(null);
  const [balanceSheetData, setBalanceSheetData] = useState(null);
  const [cashflowAccount, setCashflowAccount] = useState('');
  const [cashflowData, setCashflowData] = useState(null);

  // Form states
  const [newAccount, setNewAccount] = useState({ account: '', type: 'Asset' });
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    debit: '',
    credit: '',
    amount: '',
    description: ''
  });

  // Utilities
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const formatRupiah = (val) => {
    if (val === undefined || val === null || val === '') return 'Rp 0';
    const num = parseFloat(val);
    if (isNaN(num)) return 'Rp 0';
    if (num === 0) return '-';
    const formatted = Math.abs(num).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    return (num < 0 ? '-Rp ' : 'Rp ') + formatted;
  };

  // Fetch functions
  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
        // Set default selects if empty
        if (data.length > 0) {
          if (!newTransaction.debit) {
            setNewTransaction(prev => ({ ...prev, debit: data[0].account, credit: data[0].account }));
          }
        }
      }
    } catch (err) {
      console.error("Error fetching accounts:", err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error("Error fetching dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLedgerData = async (accName) => {
    if (!accName) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/ledger?account=${encodeURIComponent(accName)}`);
      if (res.ok) {
        const data = await res.json();
        setLedgerData(data);
      }
    } catch (err) {
      console.error("Error fetching ledger:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrialBalanceData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trial-balance');
      if (res.ok) {
        const data = await res.json();
        setTrialBalanceData(data);
      }
    } catch (err) {
      console.error("Error fetching trial balance:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncomeStatementData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/income-statement');
      if (res.ok) {
        const data = await res.json();
        setIncomeStatementData(data);
      }
    } catch (err) {
      console.error("Error fetching income statement:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalanceSheetData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/balance-sheet');
      if (res.ok) {
        const data = await res.json();
        setBalanceSheetData(data);
      }
    } catch (err) {
      console.error("Error fetching balance sheet:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCashflowData = async (accName) => {
    setLoading(true);
    try {
      const url = accName ? `/api/cashflow?account=${encodeURIComponent(accName)}` : '/api/cashflow';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCashflowData(data);
        if (data.selected_account && !cashflowAccount) {
          setCashflowAccount(data.selected_account);
        }
      }
    } catch (err) {
      console.error("Error fetching cashflow:", err);
    } finally {
      setLoading(false);
    }
  };

  // Run on Mount
  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, []);

  // Run on Menu changes
  useEffect(() => {
    if (activeMenu === 'Dashboard') {
      fetchDashboardData();
    } else if (activeMenu === 'Chart of Accounts') {
      fetchAccounts();
    } else if (activeMenu === 'Input Journal') {
      fetchAccounts();
      fetchTransactions();
    } else if (activeMenu === 'General Ledger') {
      fetchAccounts();
      if (accounts.length > 0 && !ledgerAccount) {
        setLedgerAccount(accounts[0].account);
        fetchLedgerData(accounts[0].account);
      } else if (ledgerAccount) {
        fetchLedgerData(ledgerAccount);
      }
    } else if (activeMenu === 'Trial Balance') {
      fetchTrialBalanceData();
    } else if (activeMenu === 'Income Statement') {
      fetchIncomeStatementData();
    } else if (activeMenu === 'Balance Sheet') {
      fetchBalanceSheetData();
    } else if (activeMenu === 'Cashflow') {
      fetchCashflowData(cashflowAccount);
    }
  }, [activeMenu, ledgerAccount, cashflowAccount]);

  // Form Submits
  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!newAccount.account.trim()) {
      addToast("Nama akun tidak boleh kosong!", "error");
      return;
    }
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount)
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message, "success");
        setNewAccount({ account: '', type: 'Asset' });
        fetchAccounts();
      } else {
        addToast(data.error || "Gagal menambah akun", "error");
      }
    } catch (err) {
      addToast("Terjadi kesalahan koneksi server", "error");
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (newTransaction.debit === newTransaction.credit) {
      addToast("Akun Debit dan Credit tidak boleh sama!", "error");
      return;
    }
    const amt = parseFloat(newTransaction.amount);
    if (isNaN(amt) || amt <= 0) {
      addToast("Nominal harus lebih dari 0!", "error");
      return;
    }
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction)
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message, "success");
        setNewTransaction(prev => ({
          ...prev,
          amount: '',
          description: ''
        }));
        fetchTransactions();
      } else {
        addToast(data.error || "Gagal menyimpan transaksi", "error");
      }
    } catch (err) {
      addToast("Terjadi kesalahan koneksi server", "error");
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin membatalkan/menghapus transaksi ini?")) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message, "success");
        fetchTransactions();
      } else {
        addToast(data.error || "Gagal menghapus transaksi", "error");
      }
    } catch (err) {
      addToast("Terjadi kesalahan koneksi server", "error");
    }
  };

  const handleDeleteAccount = async (accountName) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus akun '${accountName}'?`)) return;
    try {
      const res = await fetch(`/api/accounts/${encodeURIComponent(accountName)}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message, "success");
        fetchAccounts();
      } else {
        addToast(data.error || "Gagal menghapus akun", "error");
      }
    } catch (err) {
      addToast("Terjadi kesalahan koneksi server", "error");
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm("🔴 PERINGATAN CRITICAL: Apakah Anda benar-benar ingin menghapus SELURUH daftar akun dan semua riwayat transaksi jurnal secara permanen? Tindakan ini tidak dapat dibatalkan!")) return;
    if (!window.confirm("Apakah Anda yakin 100% ingin mengosongkan database pembukuan?")) return;
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message, "success");
        fetchAccounts();
        fetchTransactions();
        setActiveMenu('Dashboard'); // Kembali ke Dashboard setelah reset
      } else {
        addToast(data.error || "Gagal melakukan reset data", "error");
      }
    } catch (err) {
      addToast("Terjadi kesalahan koneksi server", "error");
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle size={18} className="emerald-text" /> : <AlertCircle size={18} className="rose-text" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Mobile Topbar */}
      <div className="mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brand-icon" style={{ width: '34px', height: '34px', fontSize: '16px' }}>A</div>
          <span className="brand-name" style={{ fontSize: '18px' }}>Accounting SaaS</span>
        </div>
        <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Toggle Menu">
          <List size={22} />
        </button>
      </div>

      {/* Sidebar Drawer Overlay */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="brand-section">
          <div className="brand-icon">A</div>
          <span className="brand-name">Accounting SaaS</span>
        </div>

        <ul className="nav-menu">
          {[
            { name: 'Dashboard', icon: <LayoutDashboard /> },
            { name: 'Chart of Accounts', icon: <BookOpen /> },
            { name: 'Input Journal', icon: <FileSpreadsheet /> },
            { name: 'General Ledger', icon: <BookMarked /> },
            { name: 'Trial Balance', icon: <Scale /> },
            { name: 'Income Statement', icon: <TrendingUp /> },
            { name: 'Balance Sheet', icon: <Activity /> },
            { name: 'Cashflow', icon: <Wallet /> }
          ].map(item => (
            <li key={item.name} className="nav-item">
              <a 
                onClick={() => {
                  setActiveMenu(item.name);
                  setIsSidebarOpen(false); // Otomatis tutup drawer di mobile saat diklik
                }} 
                className={`nav-link ${activeMenu === item.name ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="user-profile">
          <div className="avatar"></div>
          <div className="profile-info">
            <span className="profile-name">Administrator</span>
            <span className="profile-role">MySQL Connected</span>
          </div>
        </div>
      </aside>

      {/* Main Content Body */}
      <main className="main-content">
        <header className="header-section">
          <h1 className="header-title">{activeMenu}</h1>
          <span className="header-subtitle">
            <span className="live-indicator"></span> 
            {activeMenu === 'Dashboard' ? 'Data otomatis diperbarui dari database cloud...' : 'Pembukuan akuntansi terintegrasi'}
          </span>
        </header>

        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-secondary)' }}>Memuat data akuntansi...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* 1. DASHBOARD SCREEN */}
            {activeMenu === 'Dashboard' && dashboardData && (
              <div>
                {dashboardData.empty ? (
                  <div className="glass-card empty-state">
                    <div className="empty-icon"><FileText /></div>
                    <h3 className="empty-title">Belum Ada Data Keuangan</h3>
                    <p className="empty-desc">
                      Silakan isi Chart of Accounts dan Input Journal terlebih dahulu agar Dashboard dapat menampilkan analisa grafik interaktif.
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* Metrik Cards */}
                    <div className="metrics-grid">
                      {(() => {
                        const latest = dashboardData.monthly_data[dashboardData.monthly_data.length - 1] || {};
                        return (
                          <>
                            <div className="glass-card metric-card">
                              <div className="metric-header">
                                <span>Revenue Terakhir</span>
                                <TrendingUp size={16} />
                              </div>
                              <div className="metric-value">{formatRupiah(latest.Revenue)}</div>
                              <div className={`metric-change ${latest.Growth >= 0 ? 'positive' : 'negative'}`}>
                                {latest.Growth >= 0 ? `+${latest.Growth.toFixed(1)}%` : `${latest.Growth.toFixed(1)}%`} MoM Growth
                              </div>
                            </div>
                            <div className="glass-card metric-card">
                              <div className="metric-header">
                                <span>Net Profit Terakhir</span>
                                <Activity size={16} />
                              </div>
                              <div className="metric-value emerald-text">{formatRupiah(latest.NetProfit)}</div>
                              <div className="metric-change positive">
                                Net Margin: {latest.NetMargin ? latest.NetMargin.toFixed(1) : 0}%
                              </div>
                            </div>
                            <div className="glass-card metric-card">
                              <div className="metric-header">
                                <span>Arus Kas Masuk</span>
                                <Wallet size={16} />
                              </div>
                              <div className="metric-value">{formatRupiah(latest.CashIn)}</div>
                              <div className="metric-change neutral">Total Kas Masuk Bulan Ini</div>
                            </div>
                            <div className="glass-card metric-card">
                              <div className="metric-header">
                                <span>Arus Kas Keluar</span>
                                <Wallet size={16} />
                              </div>
                              <div className="metric-value rose-text">{formatRupiah(latest.CashOut)}</div>
                              <div className="metric-change negative">Total Kas Keluar Bulan Ini</div>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Charts Grid */}
                    <div className="charts-grid">
                      {/* Chart 1: Revenue vs Growth */}
                      <div className="glass-card chart-card">
                        <h4 className="chart-title">Revenue vs Growth</h4>
                        <Chart 
                          type="bar"
                          height={300}
                          series={[
                            {
                              name: 'Revenue (Rp)',
                              type: 'column',
                              data: dashboardData.monthly_data.map(m => m.Revenue)
                            },
                            {
                              name: 'Growth (%)',
                              type: 'line',
                              data: dashboardData.monthly_data.map(m => m.Growth)
                            }
                          ]}
                          options={{
                            chart: { 
                              id: 'rev-growth-chart',
                              toolbar: { show: false },
                              background: 'transparent'
                            },
                            theme: { mode: 'dark' },
                            colors: ['#3b82f6', '#f43f5e'],
                            stroke: { width: [0, 3] },
                            xaxis: { categories: dashboardData.monthly_data.map(m => m.Month) },
                            yaxis: [
                              { title: { text: 'Revenue (Rp)' }, labels: { formatter: (val) => val.toLocaleString('id') } },
                              { title: { text: 'Growth (%)' }, opposite: true, labels: { formatter: (val) => val.toFixed(1) + '%' } }
                            ],
                            legend: { position: 'top' },
                            grid: { borderColor: 'rgba(255,255,255,0.05)' }
                          }}
                        />
                      </div>

                      {/* Chart 2: Profit Margins */}
                      <div className="glass-card chart-card">
                        <h4 className="chart-title">Gross Profit & Net Profit Margin</h4>
                        <Chart 
                          type="line"
                          height={300}
                          series={[
                            {
                              name: 'Gross profit Margin (%)',
                              data: dashboardData.monthly_data.map(m => m.GrossMargin)
                            },
                            {
                              name: 'Net Profit Margin (%)',
                              data: dashboardData.monthly_data.map(m => m.NetMargin)
                            }
                          ]}
                          options={{
                            chart: { id: 'margin-chart', toolbar: { show: false }, background: 'transparent' },
                            theme: { mode: 'dark' },
                            colors: ['#10b981', '#8b5cf6'],
                            stroke: { curve: 'smooth', width: 3 },
                            xaxis: { categories: dashboardData.monthly_data.map(m => m.Month) },
                            yaxis: { labels: { formatter: (val) => val.toFixed(1) + '%' } },
                            legend: { position: 'top' },
                            grid: { borderColor: 'rgba(255,255,255,0.05)' }
                          }}
                        />
                      </div>

                      {/* Chart 3: Revenue vs COGS */}
                      <div className="glass-card chart-card">
                        <h4 className="chart-title">Revenue vs COGS</h4>
                        <Chart 
                          type="bar"
                          height={300}
                          series={[
                            {
                              name: 'Revenue',
                              data: dashboardData.monthly_data.map(m => m.Revenue)
                            },
                            {
                              name: 'COGS',
                              data: dashboardData.monthly_data.map(m => m.COGS)
                            }
                          ]}
                          options={{
                            chart: { id: 'rev-cogs-chart', toolbar: { show: false }, background: 'transparent' },
                            theme: { mode: 'dark' },
                            colors: ['#3b82f6', '#f43f5e'],
                            xaxis: { categories: dashboardData.monthly_data.map(m => m.Month) },
                            yaxis: { labels: { formatter: (val) => val.toLocaleString('id') } },
                            legend: { position: 'top' },
                            grid: { borderColor: 'rgba(255,255,255,0.05)' }
                          }}
                        />
                      </div>

                      {/* Donut Charts Grid */}
                      <div className="glass-card chart-card">
                        <h4 className="chart-title">Pengeluaran & Arus Kas</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div>
                            <h5 style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>ALOKASI BEBAN</h5>
                            {dashboardData.expense_breakdown.length > 0 ? (
                              <Chart 
                                type="donut"
                                height={240}
                                series={dashboardData.expense_breakdown.map(e => e.amount)}
                                options={{
                                  chart: { background: 'transparent' },
                                  theme: { mode: 'dark' },
                                  labels: dashboardData.expense_breakdown.map(e => e.account),
                                  legend: { show: false },
                                  stroke: { width: 1, colors: ['#0f172a'] },
                                  dataLabels: { enabled: true, style: { fontSize: '10px' } }
                                }}
                              />
                            ) : (
                              <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', padding: '50px 0' }}>Belum ada data beban.</p>
                            )}
                          </div>
                          <div>
                            <h5 style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>TOTAL CASHFLOW</h5>
                            {(() => {
                              const totalIn = dashboardData.monthly_data.reduce((acc, m) => acc + m.CashIn, 0);
                              const totalOut = dashboardData.monthly_data.reduce((acc, m) => acc + m.CashOut, 0);
                              if (totalIn > 0 || totalOut > 0) {
                                return (
                                  <Chart 
                                    type="donut"
                                    height={240}
                                    series={[totalIn, totalOut]}
                                    options={{
                                      chart: { background: 'transparent' },
                                      theme: { mode: 'dark' },
                                      labels: ['Cash In', 'Cash Out'],
                                      colors: ['#10b981', '#3b82f6'],
                                      legend: { show: false },
                                      stroke: { width: 1, colors: ['#0f172a'] },
                                      plotOptions: {
                                        pie: {
                                          donut: {
                                            show: true,
                                            labels: {
                                              show: true,
                                              name: { show: true, fontSize: '10px' },
                                              value: { show: true, fontSize: '12px', color: '#fff', formatter: (val) => 'Rp ' + parseInt(val).toLocaleString('id') },
                                              total: { show: true, label: 'Net', formatter: () => 'Rp ' + (totalIn - totalOut).toLocaleString('id') }
                                            }
                                          }
                                        }
                                      }
                                    }}
                                  />
                                );
                              } else {
                                return <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', padding: '50px 0' }}>Belum ada arus kas.</p>;
                              }
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. CHART OF ACCOUNTS SCREEN */}
            {activeMenu === 'Chart of Accounts' && (
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600' }}>Chart of Accounts (Daftar Akun)</h4>
                  <div className="badge badge-success">{accounts.length} Akun Terdaftar</div>
                </div>

                <div className="table-responsive" style={{ marginBottom: '32px' }}>
                  <table className="app-table">
                    <thead>
                      <tr>
                        <th>Nama Akun</th>
                        <th>Tipe Akun (Kelompok Akun)</th>
                        <th className="text-center" style={{ width: '100px' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.length > 0 ? (
                        accounts.map(acc => (
                          <tr key={acc.account}>
                            <td className="bold-text">{acc.account}</td>
                            <td>
                              <span className={`badge ${
                                ['Asset', 'Revenue'].includes(acc.type) ? 'badge-success' :
                                ['Liability', 'Equity'].includes(acc.type) ? 'badge-warning' : 'badge-error'
                              }`}>
                                {acc.type}
                              </span>
                            </td>
                            <td className="text-center">
                              <button 
                                onClick={() => handleDeleteAccount(acc.account)} 
                                className="btn-delete"
                                title="Hapus Akun"
                              >
                                <Trash2 size={12} /> Hapus
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center" style={{ color: 'var(--text-muted)' }}>Belum ada akun terdaftar. Tambahkan akun baru di bawah.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>Tambah Akun Baru</h4>
                <form onSubmit={handleAddAccount} className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Nama Akun</label>
                    <input 
                      type="text" 
                      placeholder="Masukkan nama akun..." 
                      className="form-input"
                      value={newAccount.account}
                      onChange={(e) => setNewAccount({ ...newAccount, account: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tipe Akun</label>
                    <select 
                      className="form-select"
                      value={newAccount.type}
                      onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
                    >
                      {["Asset", "Liability", "Equity", "Revenue", "COGS", "Expense"].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn-submit">
                      <Plus size={16} /> Tambah Akun
                    </button>
                  </div>
                </form>

                <div style={{ marginTop: '40px', borderTop: '1px solid rgba(244, 63, 94, 0.2)', paddingTop: '24px' }}>
                  <h5 className="rose-text" style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={16} /> Zona Bahaya (Danger Zone)
                  </h5>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px', lineHeight: '1.5' }}>
                    Tindakan ini akan menghapus permanen seluruh daftar akun dan semua riwayat transaksi dari database MySQL Anda secara permanen. Tindakan ini tidak dapat dibatalkan.
                  </p>
                  <button onClick={handleResetDatabase} className="btn-delete" style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '600' }}>
                    <RotateCcw size={14} /> Reset Seluruh Data Pembukuan
                  </button>
                </div>
              </div>
            )}

            {/* 3. INPUT JOURNAL SCREEN */}
            {activeMenu === 'Input Journal' && (
              <div>
                {accounts.length === 0 ? (
                  <div className="glass-card empty-state">
                    <div className="empty-icon"><AlertCircle /></div>
                    <h3 className="empty-title">Akun Belum Dibuat</h3>
                    <p className="empty-desc">
                      Anda harus menambahkan minimal beberapa akun di menu <strong>Chart of Accounts</strong> terlebih dahulu sebelum menginput jurnal umum.
                    </p>
                    <button onClick={() => setActiveMenu('Chart of Accounts')} className="btn-submit">Buka Chart of Accounts</button>
                  </div>
                ) : (
                  <div>
                    {/* Add Journal Form */}
                    <div className="glass-card">
                      <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Buat Jurnal Umum Baru</h4>
                      <form onSubmit={handleAddTransaction}>
                        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                          <div className="form-group">
                            <label className="form-label">Tanggal Transaksi</label>
                            <input 
                              type="date" 
                              className="form-input"
                              value={newTransaction.date}
                              onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Akun Debit</label>
                            <select 
                              className="form-select"
                              value={newTransaction.debit}
                              onChange={(e) => setNewTransaction({ ...newTransaction, debit: e.target.value })}
                            >
                              {accounts.map(acc => (
                                <option key={acc.account} value={acc.account}>{acc.account}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Akun Credit</label>
                            <select 
                              className="form-select"
                              value={newTransaction.credit}
                              onChange={(e) => setNewTransaction({ ...newTransaction, credit: e.target.value })}
                            >
                              {accounts.map(acc => (
                                <option key={acc.account} value={acc.account}>{acc.account}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="form-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
                          <div className="form-group">
                            <label className="form-label">Nominal (Rp) - Tanpa Titik/Koma</label>
                            <input 
                              type="number" 
                              placeholder="Contoh: 1500000" 
                              className="form-input"
                              value={newTransaction.amount}
                              onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Keterangan / Deskripsi</label>
                            <input 
                              type="text" 
                              placeholder="Keterangan transaksi..." 
                              className="form-input"
                              value={newTransaction.description}
                              onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                            />
                          </div>
                        </div>

                        <button type="submit" className="btn-submit" style={{ marginTop: '10px' }}>
                          <FileText size={16} /> Post ke Database MySQL
                        </button>
                      </form>
                    </div>

                    {/* Transactions History */}
                    <div className="glass-card">
                      <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Riwayat Jurnal & Batalkan Transaksi</h4>
                      <div className="table-responsive">
                        <table className="app-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Tanggal</th>
                              <th>Akun Debit</th>
                              <th>Akun Credit</th>
                              <th className="text-right">Nominal</th>
                              <th>Keterangan</th>
                              <th className="text-center">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.length > 0 ? (
                              [...transactions].sort((a, b) => b.id - a.id).map(tx => (
                                <tr key={tx.id}>
                                  <td>#{tx.id}</td>
                                  <td>{tx.date}</td>
                                  <td className="emerald-text bold-text">{tx.debit}</td>
                                  <td className="rose-text bold-text">{tx.credit}</td>
                                  <td className="text-right bold-text" style={{ color: '#fff' }}>{formatRupiah(tx.amount)}</td>
                                  <td>{tx.description}</td>
                                  <td className="text-center">
                                    <button 
                                      onClick={() => handleDeleteTransaction(tx.id)} 
                                      className="btn-delete"
                                      title="Hapus Transaksi"
                                    >
                                      <Trash2 size={12} /> Hapus
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="7" className="text-center" style={{ color: 'var(--text-muted)' }}>Belum ada riwayat transaksi.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. GENERAL LEDGER SCREEN */}
            {activeMenu === 'General Ledger' && (
              <div className="glass-card">
                <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Buku Besar Per Akun</h4>
                
                {accounts.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>Silakan buat akun terlebih dahulu.</p>
                ) : (
                  <div>
                    <div className="form-grid" style={{ gridTemplateColumns: '2fr 1fr', marginBottom: '30px' }}>
                      <div className="form-group">
                        <label className="form-label">Pilih Akun yang Dilacak:</label>
                        <select 
                          className="form-select"
                          value={ledgerAccount}
                          onChange={(e) => setLedgerAccount(e.target.value)}
                        >
                          {accounts.map(acc => (
                            <option key={acc.account} value={acc.account}>{acc.account}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                        {ledgerData && (
                          <div className="badge badge-warning" style={{ alignSelf: 'flex-start', padding: '12px 18px', borderRadius: 'var(--border-radius-sm)', width: '100%' }}>
                            TIPE AKUN: {ledgerData.type}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="app-table">
                        <thead>
                          <tr>
                            <th>Tanggal</th>
                            <th>Keterangan</th>
                            <th className="text-right">Debit</th>
                            <th className="text-right">Credit</th>
                            <th className="text-right">Saldo Berjalan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ledgerData && ledgerData.entries.length > 0 ? (
                            ledgerData.entries.map((entry, idx) => (
                              <tr key={idx}>
                                <td>{entry.date}</td>
                                <td>{entry.description}</td>
                                <td className="text-right emerald-text">{entry.debit > 0 ? formatRupiah(entry.debit) : '-'}</td>
                                <td className="text-right rose-text">{entry.credit > 0 ? formatRupiah(entry.credit) : '-'}</td>
                                <td className="text-right bold-text" style={{ color: '#fff' }}>{formatRupiah(entry.balance)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="text-center" style={{ color: 'var(--text-muted)' }}>Belum ada entri transaksi untuk akun ini.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. TRIAL BALANCE SCREEN */}
            {activeMenu === 'Trial Balance' && trialBalanceData && (
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600' }}>Trial Balance (Neraca Saldo)</h4>
                  {trialBalanceData.empty ? null : (
                    <span className={`badge ${trialBalanceData.balanced ? 'badge-success' : 'badge-error'}`}>
                      {trialBalanceData.balanced ? '✅ NERACA SALDO SEIMBANG (BALANCED)' : '❌ NERACA TIDAK SEIMBANG'}
                    </span>
                  )}
                </div>

                <div className="table-responsive" style={{ marginBottom: '30px' }}>
                  <table className="app-table">
                    <thead>
                      <tr>
                        <th>Akun Keuangan</th>
                        <th>Tipe</th>
                        <th className="text-right">Debit (Saldo)</th>
                        <th className="text-right">Credit (Saldo)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trialBalanceData.empty ? (
                        <tr>
                          <td colSpan="4" className="text-center" style={{ color: 'var(--text-muted)' }}>Data tidak lengkap. Silakan isi transaksi terlebih dahulu.</td>
                        </tr>
                      ) : (
                        trialBalanceData.entries.map((entry, idx) => (
                          <tr key={idx}>
                            <td className="bold-text">{entry.account}</td>
                            <td>{entry.type}</td>
                            <td className="text-right emerald-text">{entry.debit > 0 ? formatRupiah(entry.debit) : '-'}</td>
                            <td className="text-right rose-text">{entry.credit > 0 ? formatRupiah(entry.credit) : '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {!trialBalanceData.empty && (
                  <div className="metrics-grid" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
                    <div className="glass-card metric-card" style={{ marginBottom: 0 }}>
                      <div className="metric-header">TOTAL SALDO DEBIT</div>
                      <div className="metric-value emerald-text">{formatRupiah(trialBalanceData.total_debit)}</div>
                    </div>
                    <div className="glass-card metric-card" style={{ marginBottom: 0 }}>
                      <div className="metric-header">TOTAL SALDO CREDIT</div>
                      <div className="metric-value rose-text">{formatRupiah(trialBalanceData.total_credit)}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. INCOME STATEMENT SCREEN */}
            {activeMenu === 'Income Statement' && incomeStatementData && (
              <div className="glass-card">
                <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Profit and Loss (P&L) Statement</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>Laporan Laba Rugi Akrual Bulanan</p>

                {incomeStatementData.empty ? (
                  <div className="empty-state">
                    <p style={{ color: 'var(--text-muted)' }}>Belum ada data transaksi keuangan.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="app-table">
                      <thead>
                        <tr>
                          <th>Kategori</th>
                          {incomeStatementData.months.map(m => <th key={m} className="text-right">{m}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {incomeStatementData.rows.map((row, idx) => (
                          <tr 
                            key={idx} 
                            className={['Gross Profit', 'Net Profit'].includes(row.Kategori) ? 'row-total' : ''}
                          >
                            <td className="bold-text">{row.Kategori}</td>
                            {incomeStatementData.months.map(m => (
                              <td key={m} className="text-right">
                                {formatRupiah(row[m])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 7. BALANCE SHEET SCREEN */}
            {activeMenu === 'Balance Sheet' && balanceSheetData && (
              <div className="glass-card">
                <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Balance Sheet (Neraca Laporan Keuangan)</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>Akumulasi Saldo Posisi Keuangan per Bulan</p>

                {balanceSheetData.empty ? (
                  <div className="empty-state">
                    <p style={{ color: 'var(--text-muted)' }}>Belum ada data transaksi keuangan.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="app-table">
                      <thead>
                        <tr>
                          <th>Nama Akun / Klasifikasi</th>
                          {balanceSheetData.months.map(m => <th key={m} className="text-right">{m}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {balanceSheetData.rows.map((row, idx) => {
                          let rowClass = '';
                          if (row.is_header) rowClass = 'row-header';
                          else if (row.is_total) rowClass = 'row-total';
                          else if (row.is_check) rowClass = 'row-check';
                          else if (row.is_spacer) rowClass = 'row-spacer';

                          return (
                            <tr key={idx} className={rowClass}>
                              {row.is_spacer ? (
                                <td colSpan={balanceSheetData.months.length + 1}></td>
                              ) : (
                                <>
                                  <td className={row.is_header || row.is_total ? 'bold-text' : ''}>
                                    {row.Account}
                                  </td>
                                  {balanceSheetData.months.map(m => (
                                    <td key={m} className="text-right">
                                      {row.is_header ? '' : (row[m] === 0 ? '-' : formatRupiah(row[m]))}
                                    </td>
                                  ))}
                                </>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 8. CASHFLOW SCREEN */}
            {activeMenu === 'Cashflow' && cashflowData && (
              <div className="glass-card">
                <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Cashflow Statement</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>Laporan Arus Kas Bulanan</p>

                {cashflowData.empty ? (
                  <div className="empty-state">
                    <p style={{ color: 'var(--text-muted)' }}>Silakan buat akun bertipe Asset (Kas/Bank) dan input data transaksi.</p>
                  </div>
                ) : (
                  <div>
                    <div className="form-group" style={{ maxWidth: '400px', marginBottom: '30px' }}>
                      <label className="form-label">Pilih Akun Kas/Bank untuk Dilacak:</label>
                      <select 
                        className="form-select"
                        value={cashflowAccount}
                        onChange={(e) => setCashflowAccount(e.target.value)}
                      >
                        {cashflowData.available_accounts.map(acc => (
                          <option key={acc} value={acc}>{acc}</option>
                        ))}
                      </select>
                    </div>

                    <div className="table-responsive">
                      <table className="app-table">
                        <thead>
                          <tr>
                            <th>Kategori Aliran Kas</th>
                            {cashflowData.months.map(m => <th key={m} className="text-right">{m}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {cashflowData.rows.map((row, idx) => (
                            <tr 
                              key={idx} 
                              className={row.Kategori === 'Net Cashflow' ? 'row-total' : ''}
                            >
                              <td className="bold-text">{row.Kategori}</td>
                              {cashflowData.months.map(m => (
                                <td key={m} className="text-right">
                                  {formatRupiah(row[m])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
