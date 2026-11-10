'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard, BookOpen, FileSpreadsheet, BookMarked,
  Scale, TrendingUp, Activity, Wallet, Plus, Trash2,
  RotateCcw, AlertCircle, CheckCircle, FileText, List
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Area
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f43f5e', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899', '#14b8a6'];

function formatRupiah(val) {
  if (val === undefined || val === null || val === '') return 'Rp 0';
  const num = parseFloat(val);
  if (isNaN(num)) return 'Rp 0';
  if (num === 0) return '-';
  const formatted = Math.abs(num).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return (num < 0 ? '-Rp ' : 'Rp ') + formatted;
}

export default function Home() {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const [dashboardData, setDashboardData] = useState(null);
  const [ledgerAccount, setLedgerAccount] = useState('');
  const [ledgerData, setLedgerData] = useState(null);
  const [trialBalanceData, setTrialBalanceData] = useState(null);
  const [incomeStatementData, setIncomeStatementData] = useState(null);
  const [balanceSheetData, setBalanceSheetData] = useState(null);
  const [cashflowAccount, setCashflowAccount] = useState('');
  const [cashflowData, setCashflowData] = useState(null);

  const [newAccount, setNewAccount] = useState({ account: '', type: 'Asset' });
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    debit: '', credit: '', amount: '', description: ''
  });

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  // Fetch functions
  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      if (res.ok) {
        setAccounts(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0 && !newTransaction.debit) {
          setNewTransaction(prev => ({ ...prev, debit: data[0].account, credit: data[0].account }));
        }
      } else {
        addToast(data.error || 'Gagal memuat akun', 'error');
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
      addToast('Terjadi kesalahan koneksi server', 'error');
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      if (res.ok) {
        setTransactions(Array.isArray(data) ? data : []);
      } else {
        addToast(data.error || 'Gagal memuat transaksi', 'error');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (res.ok) setDashboardData(data);
      else addToast(data.error || 'Gagal memuat data dashboard', 'error');
    } catch (err) {
      console.error(err);
      addToast('Koneksi database bermasalah', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLedger = async (accName) => {
    if (!accName) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/ledger?account=${encodeURIComponent(accName)}`);
      const data = await res.json();
      if (res.ok) setLedgerData(data);
      else addToast(data.error || 'Gagal memuat buku besar', 'error');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrialBalance = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trial-balance');
      const data = await res.json();
      if (res.ok) setTrialBalanceData(data);
      else addToast(data.error || 'Gagal memuat neraca saldo', 'error');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncomeStatement = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/income-statement');
      const data = await res.json();
      if (res.ok) setIncomeStatementData(data);
      else addToast(data.error || 'Gagal memuat laba rugi', 'error');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalanceSheet = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/balance-sheet');
      const data = await res.json();
      if (res.ok) setBalanceSheetData(data);
      else addToast(data.error || 'Gagal memuat neraca', 'error');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCashflow = async (accName) => {
    setLoading(true);
    try {
      const url = accName ? `/api/cashflow?account=${encodeURIComponent(accName)}` : '/api/cashflow';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setCashflowData(data);
        if (data.selected_account && !cashflowAccount) setCashflowAccount(data.selected_account);
      } else {
        addToast(data.error || 'Gagal memuat arus kas', 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); fetchTransactions(); }, []);

  useEffect(() => {
    if (activeMenu === 'Dashboard') fetchDashboard();
    else if (activeMenu === 'Chart of Accounts') fetchAccounts();
    else if (activeMenu === 'Input Journal') { fetchAccounts(); fetchTransactions(); }
    else if (activeMenu === 'General Ledger') {
      fetchAccounts();
      if (accounts.length > 0 && !ledgerAccount) {
        setLedgerAccount(accounts[0].account);
        fetchLedger(accounts[0].account);
      } else if (ledgerAccount) fetchLedger(ledgerAccount);
    }
    else if (activeMenu === 'Trial Balance') fetchTrialBalance();
    else if (activeMenu === 'Income Statement') fetchIncomeStatement();
    else if (activeMenu === 'Balance Sheet') fetchBalanceSheet();
    else if (activeMenu === 'Cashflow') fetchCashflow(cashflowAccount);
  }, [activeMenu, ledgerAccount, cashflowAccount]);

  // Form handlers
  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!newAccount.account.trim()) { addToast('Nama akun tidak boleh kosong!', 'error'); return; }
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount)
      });
      const data = await res.json();
      if (res.ok) { addToast(data.message); setNewAccount({ account: '', type: 'Asset' }); fetchAccounts(); }
      else addToast(data.error || 'Gagal menambah akun', 'error');
    } catch { addToast('Terjadi kesalahan koneksi server', 'error'); }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (newTransaction.debit === newTransaction.credit) { addToast('Akun Debit dan Credit tidak boleh sama!', 'error'); return; }
    const amt = parseFloat(newTransaction.amount);
    if (isNaN(amt) || amt <= 0) { addToast('Nominal harus lebih dari 0!', 'error'); return; }
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction)
      });
      const data = await res.json();
      if (res.ok) { addToast(data.message); setNewTransaction(prev => ({ ...prev, amount: '', description: '' })); fetchTransactions(); }
      else addToast(data.error || 'Gagal menyimpan transaksi', 'error');
    } catch { addToast('Terjadi kesalahan koneksi server', 'error'); }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) { addToast(data.message); fetchTransactions(); }
      else addToast(data.error || 'Gagal menghapus transaksi', 'error');
    } catch { addToast('Terjadi kesalahan koneksi server', 'error'); }
  };

  const handleDeleteAccount = async (accountName) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus akun '${accountName}'?`)) return;
    try {
      const res = await fetch(`/api/accounts/${encodeURIComponent(accountName)}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) { addToast(data.message); fetchAccounts(); }
      else addToast(data.error || 'Gagal menghapus akun', 'error');
    } catch { addToast('Terjadi kesalahan koneksi server', 'error'); }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('🔴 PERINGATAN: Apakah Anda yakin ingin menghapus SELURUH data?')) return;
    if (!window.confirm('Tindakan ini TIDAK DAPAT dibatalkan. Lanjutkan?')) return;
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const data = await res.json();
      if (res.ok) { addToast(data.message); fetchAccounts(); fetchTransactions(); setActiveMenu('Dashboard'); }
      else addToast(data.error || 'Gagal reset', 'error');
    } catch { addToast('Terjadi kesalahan koneksi server', 'error'); }
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard /> },
    { name: 'Chart of Accounts', icon: <BookOpen /> },
    { name: 'Input Journal', icon: <FileSpreadsheet /> },
    { name: 'General Ledger', icon: <BookMarked /> },
    { name: 'Trial Balance', icon: <Scale /> },
    { name: 'Income Statement', icon: <TrendingUp /> },
    { name: 'Balance Sheet', icon: <Activity /> },
    { name: 'Cashflow', icon: <Wallet /> }
  ];

  return (
    <div className="app-container">
      {/* Toast */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Mobile Topbar */}
      <div className="mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brand-icon" style={{ width: 34, height: 34, fontSize: 16 }}>A</div>
          <span className="brand-name" style={{ fontSize: 18 }}>Accounting SaaS</span>
        </div>
        <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}><List size={22} /></button>
      </div>

      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="brand-section">
          <div className="brand-icon">A</div>
          <span className="brand-name">Accounting SaaS</span>
        </div>
        <ul className="nav-menu">
          {menuItems.map(item => (
            <li key={item.name} className="nav-item">
              <a onClick={() => { setActiveMenu(item.name); setIsSidebarOpen(false); }}
                className={`nav-link ${activeMenu === item.name ? 'active' : ''}`}>
                {item.icon}<span>{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="user-profile">
          <div className="avatar" />
          <div className="profile-info">
            <span className="profile-name">Administrator</span>
            <span className="profile-role">Neon PostgreSQL</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header-section">
          <h1 className="header-title">{activeMenu}</h1>
          <span className="header-subtitle">
            <span className="live-indicator" />
            {activeMenu === 'Dashboard' ? 'Data otomatis diperbarui dari database cloud...' : 'Pembukuan akuntansi terintegrasi'}
          </span>
        </header>

        {loading && (
          <div className="loading-overlay">
            <div className="spinner" />
            <p style={{ color: 'var(--text-secondary)' }}>Memuat data akuntansi...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* ====== 1. DASHBOARD ====== */}
            {activeMenu === 'Dashboard' && dashboardData && (
              <div>
                {dashboardData.empty ? (
                  <div className="glass-card empty-state">
                    <div className="empty-icon"><FileText /></div>
                    <h3 className="empty-title">Belum Ada Data Keuangan</h3>
                    <p className="empty-desc">Silakan isi Chart of Accounts dan Input Journal terlebih dahulu.</p>
                  </div>
                ) : (
                  <div>
                    <div className="metrics-grid">
                      {(() => {
                        const latest = dashboardData.monthly_data[dashboardData.monthly_data.length - 1] || {};
                        return (
                          <>
                            <div className="glass-card metric-card">
                              <div className="metric-header"><span>Revenue Terakhir</span><TrendingUp size={16} /></div>
                              <div className="metric-value">{formatRupiah(latest.Revenue)}</div>
                              <div className={`metric-change ${latest.Growth >= 0 ? 'positive' : 'negative'}`}>
                                {latest.Growth >= 0 ? '+' : ''}{(latest.Growth || 0).toFixed(1)}% MoM Growth
                              </div>
                            </div>
                            <div className="glass-card metric-card">
                              <div className="metric-header"><span>Net Profit Terakhir</span><Activity size={16} /></div>
                              <div className="metric-value emerald-text">{formatRupiah(latest.NetProfit)}</div>
                              <div className="metric-change positive">Net Margin: {(latest.NetMargin || 0).toFixed(1)}%</div>
                            </div>
                            <div className="glass-card metric-card">
                              <div className="metric-header"><span>Arus Kas Masuk</span><Wallet size={16} /></div>
                              <div className="metric-value">{formatRupiah(latest.CashIn)}</div>
                              <div className="metric-change neutral">Total Kas Masuk Bulan Ini</div>
                            </div>
                            <div className="glass-card metric-card">
                              <div className="metric-header"><span>Arus Kas Keluar</span><Wallet size={16} /></div>
                              <div className="metric-value rose-text">{formatRupiah(latest.CashOut)}</div>
                              <div className="metric-change negative">Total Kas Keluar Bulan Ini</div>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    <div className="charts-grid">
                      {/* Revenue vs Growth */}
                      <div className="glass-card chart-card">
                        <h4 className="chart-title">Revenue vs Growth</h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <ComposedChart data={dashboardData.monthly_data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="Month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: '#141c33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                            <Legend />
                            <Bar yAxisId="left" dataKey="Revenue" fill="#3b82f6" name="Revenue (Rp)" radius={[4,4,0,0]} />
                            <Line yAxisId="right" type="monotone" dataKey="Growth" stroke="#f43f5e" name="Growth (%)" strokeWidth={2} dot={{ r: 3 }} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Profit Margins */}
                      <div className="glass-card chart-card">
                        <h4 className="chart-title">Gross Profit & Net Profit Margin</h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={dashboardData.monthly_data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="Month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: '#141c33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                            <Legend />
                            <Line type="monotone" dataKey="GrossMargin" stroke="#10b981" name="Gross Margin (%)" strokeWidth={2} />
                            <Line type="monotone" dataKey="NetMargin" stroke="#8b5cf6" name="Net Margin (%)" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Revenue vs COGS */}
                      <div className="glass-card chart-card">
                        <h4 className="chart-title">Revenue vs COGS</h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={dashboardData.monthly_data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="Month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: '#141c33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                            <Legend />
                            <Bar dataKey="Revenue" fill="#3b82f6" name="Revenue" radius={[4,4,0,0]} />
                            <Bar dataKey="COGS" fill="#f43f5e" name="COGS" radius={[4,4,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Expense Donut */}
                      <div className="glass-card chart-card">
                        <h4 className="chart-title">Alokasi Beban & Arus Kas</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                          <div>
                            <h5 style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>ALOKASI BEBAN</h5>
                            {dashboardData.expense_breakdown.length > 0 ? (
                              <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                  <Pie data={dashboardData.expense_breakdown} dataKey="amount" nameKey="account" cx="50%" cy="50%"
                                    innerRadius={50} outerRadius={80} paddingAngle={2}>
                                    {dashboardData.expense_breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                  </Pie>
                                  <Tooltip contentStyle={{ background: '#141c33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                                </PieChart>
                              </ResponsiveContainer>
                            ) : <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', padding: '50px 0' }}>Belum ada data beban.</p>}
                          </div>
                          <div>
                            <h5 style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>TOTAL CASHFLOW</h5>
                            {(() => {
                              const totalIn = dashboardData.monthly_data.reduce((a, m) => a + m.CashIn, 0);
                              const totalOut = dashboardData.monthly_data.reduce((a, m) => a + m.CashOut, 0);
                              return totalIn > 0 || totalOut > 0 ? (
                                <ResponsiveContainer width="100%" height={220}>
                                  <PieChart>
                                    <Pie data={[{ name: 'Cash In', value: totalIn }, { name: 'Cash Out', value: totalOut }]}
                                      dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                                      <Cell fill="#10b981" /><Cell fill="#3b82f6" />
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#141c33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                                  </PieChart>
                                </ResponsiveContainer>
                              ) : <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', padding: '50px 0' }}>Belum ada arus kas.</p>;
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ====== 2. CHART OF ACCOUNTS ====== */}
            {activeMenu === 'Chart of Accounts' && (
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h4 style={{ fontSize: 18, fontWeight: 600 }}>Chart of Accounts (Daftar Akun)</h4>
                  <div className="badge badge-success">{accounts.length} Akun Terdaftar</div>
                </div>

                <div className="table-responsive" style={{ marginBottom: 32 }}>
                  <table className="app-table">
                    <thead><tr><th>Nama Akun</th><th>Tipe Akun (Kelompok Akun)</th><th className="text-center" style={{ width: 100 }}>Aksi</th></tr></thead>
                    <tbody>
                      {accounts.length > 0 ? accounts.map(acc => (
                        <tr key={acc.account}>
                          <td className="bold-text">{acc.account}</td>
                          <td>
                            <span className={`badge ${['Asset', 'Revenue'].includes(acc.type) ? 'badge-success' : ['Liability', 'Equity'].includes(acc.type) ? 'badge-warning' : 'badge-error'}`}>
                              {acc.type}
                            </span>
                          </td>
                          <td className="text-center">
                            <button onClick={() => handleDeleteAccount(acc.account)} className="btn-delete"><Trash2 size={12} /> Hapus</button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="3" className="text-center" style={{ color: 'var(--text-muted)' }}>Belum ada akun terdaftar.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, borderTop: '1px solid var(--glass-border)', paddingTop: 24 }}>Tambah Akun Baru</h4>
                <form onSubmit={handleAddAccount} className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Nama Akun</label>
                    <input type="text" placeholder="Masukkan nama akun..." className="form-input"
                      value={newAccount.account} onChange={e => setNewAccount({ ...newAccount, account: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tipe Akun</label>
                    <select className="form-select" value={newAccount.type} onChange={e => setNewAccount({ ...newAccount, type: e.target.value })}>
                      {['Asset', 'Liability', 'Equity', 'Revenue', 'COGS', 'Expense'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn-submit"><Plus size={16} /> Tambah Akun</button>
                  </div>
                </form>

                {/* Danger Zone */}
                <div style={{ marginTop: 40, borderTop: '1px solid rgba(244,63,94,0.2)', paddingTop: 24 }}>
                  <h5 className="rose-text" style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertCircle size={16} /> Zona Bahaya (Danger Zone)
                  </h5>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
                    Tindakan ini akan menghapus permanen seluruh daftar akun dan semua riwayat transaksi.
                  </p>
                  <button onClick={handleResetDatabase} className="btn-delete" style={{ padding: '10px 20px', fontSize: 13, fontWeight: 600 }}>
                    <RotateCcw size={14} /> Reset Seluruh Data Pembukuan
                  </button>
                </div>
              </div>
            )}

            {/* ====== 3. INPUT JOURNAL ====== */}
            {activeMenu === 'Input Journal' && (
              <div>
                {accounts.length === 0 ? (
                  <div className="glass-card empty-state">
                    <div className="empty-icon"><AlertCircle /></div>
                    <h3 className="empty-title">Akun Belum Dibuat</h3>
                    <p className="empty-desc">Tambahkan akun di Chart of Accounts terlebih dahulu.</p>
                    <button onClick={() => setActiveMenu('Chart of Accounts')} className="btn-submit">Buka Chart of Accounts</button>
                  </div>
                ) : (
                  <div>
                    <div className="glass-card">
                      <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Buat Jurnal Umum Baru</h4>
                      <form onSubmit={handleAddTransaction}>
                        <div className="form-grid">
                          <div className="form-group">
                            <label className="form-label">Tanggal Transaksi</label>
                            <input type="date" className="form-input" value={newTransaction.date}
                              onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })} required />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Akun Debit</label>
                            <select className="form-select" value={newTransaction.debit}
                              onChange={e => setNewTransaction({ ...newTransaction, debit: e.target.value })}>
                              {accounts.map(acc => <option key={acc.account} value={acc.account}>{acc.account}</option>)}
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Akun Credit</label>
                            <select className="form-select" value={newTransaction.credit}
                              onChange={e => setNewTransaction({ ...newTransaction, credit: e.target.value })}>
                              {accounts.map(acc => <option key={acc.account} value={acc.account}>{acc.account}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="form-grid" style={{ gridTemplateColumns: '1fr 2fr', marginTop: 16 }}>
                          <div className="form-group">
                            <label className="form-label">Nominal (Rp)</label>
                            <input type="number" placeholder="Contoh: 1500000" className="form-input"
                              value={newTransaction.amount} onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })} required />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Keterangan / Deskripsi</label>
                            <input type="text" placeholder="Keterangan transaksi..." className="form-input"
                              value={newTransaction.description} onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })} />
                          </div>
                        </div>
                        <button type="submit" className="btn-submit" style={{ marginTop: 16 }}><FileText size={16} /> Post ke Database</button>
                      </form>
                    </div>

                    <div className="glass-card">
                      <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Riwayat Jurnal & Batalkan Transaksi</h4>
                      <div className="table-responsive">
                        <table className="app-table">
                          <thead><tr><th>ID</th><th>Tanggal</th><th>Akun Debit</th><th>Akun Credit</th><th className="text-right">Nominal</th><th>Keterangan</th><th className="text-center">Aksi</th></tr></thead>
                          <tbody>
                            {transactions.length > 0 ? [...transactions].sort((a, b) => b.id - a.id).map(tx => (
                              <tr key={tx.id}>
                                <td>#{tx.id}</td><td>{tx.date}</td>
                                <td className="emerald-text bold-text">{tx.debit}</td>
                                <td className="rose-text bold-text">{tx.credit}</td>
                                <td className="text-right bold-text" style={{ color: '#fff' }}>{formatRupiah(tx.amount)}</td>
                                <td>{tx.description}</td>
                                <td className="text-center">
                                  <button onClick={() => handleDeleteTransaction(tx.id)} className="btn-delete"><Trash2 size={12} /> Hapus</button>
                                </td>
                              </tr>
                            )) : (
                              <tr><td colSpan="7" className="text-center" style={{ color: 'var(--text-muted)' }}>Belum ada riwayat transaksi.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ====== 4. GENERAL LEDGER ====== */}
            {activeMenu === 'General Ledger' && (
              <div className="glass-card">
                <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Buku Besar Per Akun</h4>
                {accounts.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>Silakan buat akun terlebih dahulu.</p>
                ) : (
                  <div>
                    <div className="form-grid" style={{ gridTemplateColumns: '2fr 1fr', marginBottom: 30 }}>
                      <div className="form-group">
                        <label className="form-label">Pilih Akun yang Dilacak:</label>
                        <select className="form-select" value={ledgerAccount} onChange={e => setLedgerAccount(e.target.value)}>
                          {accounts.map(acc => <option key={acc.account} value={acc.account}>{acc.account}</option>)}
                        </select>
                      </div>
                      <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                        {ledgerData && <div className="badge badge-warning" style={{ padding: '12px 18px', borderRadius: 10, width: '100%' }}>TIPE AKUN: {ledgerData.type}</div>}
                      </div>
                    </div>
                    <div className="table-responsive">
                      <table className="app-table">
                        <thead><tr><th>Tanggal</th><th>Keterangan</th><th className="text-right">Debit</th><th className="text-right">Credit</th><th className="text-right">Saldo Berjalan</th></tr></thead>
                        <tbody>
                          {ledgerData && ledgerData.entries.length > 0 ? ledgerData.entries.map((e, i) => (
                            <tr key={i}>
                              <td>{e.date}</td><td>{e.description}</td>
                              <td className="text-right emerald-text">{e.debit > 0 ? formatRupiah(e.debit) : '-'}</td>
                              <td className="text-right rose-text">{e.credit > 0 ? formatRupiah(e.credit) : '-'}</td>
                              <td className="text-right bold-text" style={{ color: '#fff' }}>{formatRupiah(e.balance)}</td>
                            </tr>
                          )) : (
                            <tr><td colSpan="5" className="text-center" style={{ color: 'var(--text-muted)' }}>Belum ada entri untuk akun ini.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ====== 5. TRIAL BALANCE ====== */}
            {activeMenu === 'Trial Balance' && trialBalanceData && (
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h4 style={{ fontSize: 18, fontWeight: 600 }}>Trial Balance (Neraca Saldo)</h4>
                  {!trialBalanceData.empty && (
                    <span className={`badge ${trialBalanceData.balanced ? 'badge-success' : 'badge-error'}`}>
                      {trialBalanceData.balanced ? '✅ SEIMBANG (BALANCED)' : '❌ TIDAK SEIMBANG'}
                    </span>
                  )}
                </div>
                <div className="table-responsive" style={{ marginBottom: 30 }}>
                  <table className="app-table">
                    <thead><tr><th>Akun Keuangan</th><th>Tipe</th><th className="text-right">Debit (Saldo)</th><th className="text-right">Credit (Saldo)</th></tr></thead>
                    <tbody>
                      {trialBalanceData.empty ? (
                        <tr><td colSpan="4" className="text-center" style={{ color: 'var(--text-muted)' }}>Belum ada data.</td></tr>
                      ) : trialBalanceData.entries.map((e, i) => (
                        <tr key={i}>
                          <td className="bold-text">{e.account}</td><td>{e.type}</td>
                          <td className="text-right emerald-text">{e.debit > 0 ? formatRupiah(e.debit) : '-'}</td>
                          <td className="text-right rose-text">{e.credit > 0 ? formatRupiah(e.credit) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!trialBalanceData.empty && (
                  <div className="metrics-grid" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 24 }}>
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

            {/* ====== 6. INCOME STATEMENT ====== */}
            {activeMenu === 'Income Statement' && incomeStatementData && (
              <div className="glass-card">
                <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Profit and Loss (P&L) Statement</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>Laporan Laba Rugi Akrual Bulanan</p>
                {incomeStatementData.empty ? (
                  <div className="empty-state"><p style={{ color: 'var(--text-muted)' }}>Belum ada data transaksi keuangan.</p></div>
                ) : (
                  <div className="table-responsive">
                    <table className="app-table">
                      <thead><tr><th>Kategori</th>{incomeStatementData.months.map(m => <th key={m} className="text-right">{m}</th>)}</tr></thead>
                      <tbody>
                        {incomeStatementData.rows.map((row, i) => (
                          <tr key={i} className={['Gross Profit', 'Net Profit'].includes(row.Kategori) ? 'row-total' : ''}>
                            <td className="bold-text">{row.Kategori}</td>
                            {incomeStatementData.months.map(m => <td key={m} className="text-right">{formatRupiah(row[m])}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ====== 7. BALANCE SHEET ====== */}
            {activeMenu === 'Balance Sheet' && balanceSheetData && (
              <div className="glass-card">
                <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Balance Sheet (Neraca)</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>Akumulasi Saldo Posisi Keuangan per Bulan</p>
                {balanceSheetData.empty ? (
                  <div className="empty-state"><p style={{ color: 'var(--text-muted)' }}>Belum ada data.</p></div>
                ) : (
                  <div className="table-responsive">
                    <table className="app-table">
                      <thead><tr><th>Nama Akun / Klasifikasi</th>{balanceSheetData.months.map(m => <th key={m} className="text-right">{m}</th>)}</tr></thead>
                      <tbody>
                        {balanceSheetData.rows.map((row, i) => {
                          let cls = '';
                          if (row.is_header) cls = 'row-header';
                          else if (row.is_total) cls = 'row-total';
                          else if (row.is_check) cls = 'row-check';
                          else if (row.is_spacer) cls = 'row-spacer';
                          return (
                            <tr key={i} className={cls}>
                              {row.is_spacer ? <td colSpan={balanceSheetData.months.length + 1} /> : (
                                <>
                                  <td className={row.is_header || row.is_total ? 'bold-text' : ''}>{row.Account}</td>
                                  {balanceSheetData.months.map(m => (
                                    <td key={m} className="text-right">{row.is_header ? '' : (row[m] === 0 ? '-' : formatRupiah(row[m]))}</td>
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

            {/* ====== 8. CASHFLOW ====== */}
            {activeMenu === 'Cashflow' && cashflowData && (
              <div className="glass-card">
                <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Cashflow Statement</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>Laporan Arus Kas Bulanan</p>
                {cashflowData.empty ? (
                  <div className="empty-state"><p style={{ color: 'var(--text-muted)' }}>Silakan buat akun bertipe Asset dan input transaksi.</p></div>
                ) : (
                  <div>
                    <div className="form-group" style={{ maxWidth: 400, marginBottom: 30 }}>
                      <label className="form-label">Pilih Akun Kas/Bank:</label>
                      <select className="form-select" value={cashflowAccount} onChange={e => setCashflowAccount(e.target.value)}>
                        {cashflowData.available_accounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                      </select>
                    </div>
                    <div className="table-responsive">
                      <table className="app-table">
                        <thead><tr><th>Kategori Aliran Kas</th>{cashflowData.months.map(m => <th key={m} className="text-right">{m}</th>)}</tr></thead>
                        <tbody>
                          {cashflowData.rows.map((row, i) => (
                            <tr key={i} className={row.Kategori === 'Net Cashflow' ? 'row-total' : ''}>
                              <td className="bold-text">{row.Kategori}</td>
                              {cashflowData.months.map(m => <td key={m} className="text-right">{formatRupiah(row[m])}</td>)}
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
