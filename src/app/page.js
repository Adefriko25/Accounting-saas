'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/frontend/components/Sidebar';
import MobileTopbar from '@/frontend/components/MobileTopbar';
import ToastContainer from '@/frontend/components/ToastContainer';
import LoadingSpinner from '@/frontend/components/LoadingSpinner';

import DashboardView from '@/frontend/views/DashboardView';
import AccountsView from '@/frontend/views/AccountsView';
import JournalView from '@/frontend/views/JournalView';
import LedgerView from '@/frontend/views/LedgerView';
import TrialBalanceView from '@/frontend/views/TrialBalanceView';
import IncomeStatementView from '@/frontend/views/IncomeStatementView';
import BalanceSheetView from '@/frontend/views/BalanceSheetView';
import CashflowView from '@/frontend/views/CashflowView';

export default function HomePage() {
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

  // Toast Helper
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // ==========================================
  // FETCH API HANDLERS
  // ==========================================
  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      if (res.ok) {
        setAccounts(Array.isArray(data) ? data : []);
      } else {
        addToast(data.error || 'Gagal memuat akun', 'error');
      }
    } catch {
      addToast('Terjadi kesalahan koneksi server', 'error');
    }
  }, [addToast]);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      if (res.ok) {
        setTransactions(Array.isArray(data) ? data : []);
      } else {
        addToast(data.error || 'Gagal memuat transaksi', 'error');
      }
    } catch {
      console.error('Error fetching transactions');
    }
  }, [addToast]);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (res.ok) setDashboardData(data);
      else addToast(data.error || 'Gagal memuat dashboard', 'error');
    } catch {
      addToast('Koneksi database bermasalah', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const fetchLedger = useCallback(async (accName) => {
    if (!accName) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/ledger?account=${encodeURIComponent(accName)}`);
      const data = await res.json();
      if (res.ok) setLedgerData(data);
      else addToast(data.error || 'Gagal memuat buku besar', 'error');
    } catch {
      console.error('Error fetching ledger');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const fetchTrialBalance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trial-balance');
      const data = await res.json();
      if (res.ok) setTrialBalanceData(data);
      else addToast(data.error || 'Gagal memuat neraca saldo', 'error');
    } catch {
      console.error('Error fetching trial balance');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const fetchIncomeStatement = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/income-statement');
      const data = await res.json();
      if (res.ok) setIncomeStatementData(data);
      else addToast(data.error || 'Gagal memuat laba rugi', 'error');
    } catch {
      console.error('Error fetching income statement');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const fetchBalanceSheet = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/balance-sheet');
      const data = await res.json();
      if (res.ok) setBalanceSheetData(data);
      else addToast(data.error || 'Gagal memuat neraca', 'error');
    } catch {
      console.error('Error fetching balance sheet');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const fetchCashflow = useCallback(async (accName) => {
    setLoading(true);
    try {
      const url = accName ? `/api/cashflow?account=${encodeURIComponent(accName)}` : '/api/cashflow';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setCashflowData(data);
        if (data.selected_account && !cashflowAccount) {
          setCashflowAccount(data.selected_account);
        }
      } else {
        addToast(data.error || 'Gagal memuat arus kas', 'error');
      }
    } catch {
      console.error('Error fetching cashflow');
    } finally {
      setLoading(false);
    }
  }, [cashflowAccount, addToast]);

  // Initial mount load
  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, [fetchAccounts, fetchTransactions]);

  // Tab switch effect
  useEffect(() => {
    if (activeMenu === 'Dashboard') fetchDashboard();
    else if (activeMenu === 'Chart of Accounts') fetchAccounts();
    else if (activeMenu === 'Input Journal') {
      fetchAccounts();
      fetchTransactions();
    } else if (activeMenu === 'General Ledger') {
      fetchAccounts();
      if (accounts.length > 0 && !ledgerAccount) {
        setLedgerAccount(accounts[0].account);
        fetchLedger(accounts[0].account);
      } else if (ledgerAccount) {
        fetchLedger(ledgerAccount);
      }
    } else if (activeMenu === 'Trial Balance') fetchTrialBalance();
    else if (activeMenu === 'Income Statement') fetchIncomeStatement();
    else if (activeMenu === 'Balance Sheet') fetchBalanceSheet();
    else if (activeMenu === 'Cashflow') fetchCashflow(cashflowAccount);
  }, [
    activeMenu, 
    ledgerAccount, 
    cashflowAccount,
    accounts.length,
    fetchAccounts,
    fetchTransactions,
    fetchDashboard,
    fetchLedger,
    fetchTrialBalance,
    fetchIncomeStatement,
    fetchBalanceSheet,
    fetchCashflow
  ]);

  // ==========================================
  // ACTION HANDLERS
  // ==========================================
  const handleAddAccount = async (accountPayload) => {
    if (!accountPayload.account.trim()) {
      addToast('Nama akun tidak boleh kosong!', 'error');
      return false;
    }
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountPayload)
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        fetchAccounts();
        return true;
      } else {
        addToast(data.error || 'Gagal menambah akun', 'error');
        return false;
      }
    } catch {
      addToast('Terjadi kesalahan koneksi server', 'error');
      return false;
    }
  };

  const handleDeleteAccount = async (accountName) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus akun '${accountName}'?`)) return;
    try {
      const res = await fetch(`/api/accounts/${encodeURIComponent(accountName)}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        fetchAccounts();
      } else {
        addToast(data.error || 'Gagal menghapus akun', 'error');
      }
    } catch {
      addToast('Terjadi kesalahan koneksi server', 'error');
    }
  };

  const handleAddTransaction = async (txPayload) => {
    if (txPayload.debit === txPayload.credit) {
      addToast('Akun Debit dan Credit tidak boleh sama!', 'error');
      return false;
    }
    const amt = parseFloat(txPayload.amount);
    if (isNaN(amt) || amt <= 0) {
      addToast('Nominal harus lebih dari 0!', 'error');
      return false;
    }
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txPayload)
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        fetchTransactions();
        return true;
      } else {
        addToast(data.error || 'Gagal menyimpan transaksi', 'error');
        return false;
      }
    } catch {
      addToast('Terjadi kesalahan koneksi server', 'error');
      return false;
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan/menghapus transaksi ini?')) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        fetchTransactions();
      } else {
        addToast(data.error || 'Gagal menghapus transaksi', 'error');
      }
    } catch {
      addToast('Terjadi kesalahan koneksi server', 'error');
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('🔴 PERINGATAN: Apakah Anda yakin ingin menghapus SELURUH daftar akun dan riwayat transaksi secara permanen?')) return;
    if (!window.confirm('Tindakan ini 100% TIDAK DAPAT DIBATALKAN. Lanjutkan?')) return;
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message);
        fetchAccounts();
        fetchTransactions();
        setActiveMenu('Dashboard');
      } else {
        addToast(data.error || 'Gagal melakukan reset', 'error');
      }
    } catch {
      addToast('Terjadi kesalahan koneksi server', 'error');
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notifikasi */}
      <ToastContainer toasts={toasts} />

      {/* Mobile Topbar */}
      <MobileTopbar onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />

      {/* Sidebar Navigasi */}
      <Sidebar
        activeMenu={activeMenu}
        onSelectMenu={setActiveMenu}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main View Area */}
      <main className="main-content">
        <header className="header-section">
          <h1 className="header-title">{activeMenu}</h1>
          <span className="header-subtitle">
            <span className="live-indicator" />
            {activeMenu === 'Dashboard' 
              ? 'Data otomatis diperbarui dari database cloud...' 
              : 'Pembukuan akuntansi terintegrasi'}
          </span>
        </header>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {activeMenu === 'Dashboard' && (
              <DashboardView
                data={dashboardData}
                onNavigateToAccounts={() => setActiveMenu('Chart of Accounts')}
              />
            )}

            {activeMenu === 'Chart of Accounts' && (
              <AccountsView
                accounts={accounts}
                onAddAccount={handleAddAccount}
                onDeleteAccount={handleDeleteAccount}
                onResetDatabase={handleResetDatabase}
              />
            )}

            {activeMenu === 'Input Journal' && (
              <JournalView
                accounts={accounts}
                transactions={transactions}
                onAddTransaction={handleAddTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onNavigateToAccounts={() => setActiveMenu('Chart of Accounts')}
              />
            )}

            {activeMenu === 'General Ledger' && (
              <LedgerView
                accounts={accounts}
                selectedAccount={ledgerAccount}
                onSelectAccount={acc => {
                  setLedgerAccount(acc);
                  fetchLedger(acc);
                }}
                data={ledgerData}
              />
            )}

            {activeMenu === 'Trial Balance' && (
              <TrialBalanceView data={trialBalanceData} />
            )}

            {activeMenu === 'Income Statement' && (
              <IncomeStatementView data={incomeStatementData} />
            )}

            {activeMenu === 'Balance Sheet' && (
              <BalanceSheetView data={balanceSheetData} />
            )}

            {activeMenu === 'Cashflow' && (
              <CashflowView
                data={cashflowData}
                selectedAccount={cashflowAccount}
                onSelectAccount={acc => {
                  setCashflowAccount(acc);
                  fetchCashflow(acc);
                }}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
