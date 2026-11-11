'use client';

import { useState } from 'react';
import { FileText, Trash2, AlertCircle } from 'lucide-react';
import { formatRupiah } from '@/frontend/utils/formatters';
import EmptyState from '@/frontend/components/EmptyState';

export default function JournalView({
  accounts,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  onNavigateToAccounts
}) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    debit: accounts.length > 0 ? accounts[0].account : '',
    credit: accounts.length > 0 ? accounts[0].account : '',
    amount: '',
    description: ''
  });

  if (accounts.length === 0) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Akun Belum Dibuat"
        description="Anda harus menambahkan minimal beberapa akun di menu Chart of Accounts terlebih dahulu sebelum menginput jurnal umum."
        actionText="Buka Chart of Accounts"
        onAction={onNavigateToAccounts}
      />
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onAddTransaction(formData);
    if (success) {
      setFormData(prev => ({
        ...prev,
        amount: '',
        description: ''
      }));
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => b.id - a.id);

  return (
    <div>
      {/* Form Input Jurnal */}
      <div className="glass-card">
        <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Buat Jurnal Umum Baru</h4>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Tanggal Transaksi</label>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Akun Debit</label>
              <select
                className="form-select"
                value={formData.debit || (accounts[0] ? accounts[0].account : '')}
                onChange={e => setFormData({ ...formData, debit: e.target.value })}
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
                value={formData.credit || (accounts[0] ? accounts[0].account : '')}
                onChange={e => setFormData({ ...formData, credit: e.target.value })}
              >
                {accounts.map(acc => (
                  <option key={acc.account} value={acc.account}>{acc.account}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr 2fr', marginTop: 16 }}>
            <div className="form-group">
              <label className="form-label">Nominal (Rp) - Tanpa Titik/Koma</label>
              <input
                type="number"
                placeholder="Contoh: 1500000"
                className="form-input"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Keterangan / Deskripsi</label>
              <input
                type="text"
                placeholder="Keterangan transaksi..."
                className="form-input"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn-submit" style={{ marginTop: 16 }}>
            <FileText size={16} /> Post ke Database
          </button>
        </form>
      </div>

      {/* Riwayat Transaksi */}
      <div className="glass-card">
        <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
          Riwayat Jurnal & Batalkan Transaksi
        </h4>
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
              {sortedTransactions.length > 0 ? (
                sortedTransactions.map(tx => (
                  <tr key={tx.id}>
                    <td>#{tx.id}</td>
                    <td>{tx.date}</td>
                    <td className="emerald-text bold-text">{tx.debit}</td>
                    <td className="rose-text bold-text">{tx.credit}</td>
                    <td className="text-right bold-text" style={{ color: '#fff' }}>
                      {formatRupiah(tx.amount)}
                    </td>
                    <td>{tx.description}</td>
                    <td className="text-center">
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
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
                  <td colSpan="7" className="text-center" style={{ color: 'var(--text-muted)' }}>
                    Belum ada riwayat transaksi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
