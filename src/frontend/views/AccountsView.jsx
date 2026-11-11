'use client';

import { useState } from 'react';
import { Plus, Trash2, AlertCircle, RotateCcw } from 'lucide-react';

export default function AccountsView({ 
  accounts, 
  onAddAccount, 
  onDeleteAccount, 
  onResetDatabase 
}) {
  const [newAccount, setNewAccount] = useState({ account: '', type: 'Asset' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onAddAccount(newAccount);
    if (success) {
      setNewAccount({ account: '', type: 'Asset' });
    }
  };

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h4 style={{ fontSize: 18, fontWeight: 600 }}>Chart of Accounts (Daftar Akun)</h4>
        <div className="badge badge-success">{accounts.length} Akun Terdaftar</div>
      </div>

      <div className="table-responsive" style={{ marginBottom: 32 }}>
        <table className="app-table">
          <thead>
            <tr>
              <th>Nama Akun</th>
              <th>Tipe Akun (Kelompok Akun)</th>
              <th className="text-center" style={{ width: 100 }}>Aksi</th>
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
                      onClick={() => onDeleteAccount(acc.account)} 
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
                <td colSpan="3" className="text-center" style={{ color: 'var(--text-muted)' }}>
                  Belum ada akun terdaftar. Tambahkan akun baru di bawah.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, borderTop: '1px solid var(--glass-border)', paddingTop: 24 }}>
        Tambah Akun Baru
      </h4>
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label className="form-label">Nama Akun</label>
          <input
            type="text"
            placeholder="Masukkan nama akun..."
            className="form-input"
            value={newAccount.account}
            onChange={e => setNewAccount({ ...newAccount, account: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Tipe Akun</label>
          <select
            className="form-select"
            value={newAccount.type}
            onChange={e => setNewAccount({ ...newAccount, type: e.target.value })}
          >
            {['Asset', 'Liability', 'Equity', 'Revenue', 'COGS', 'Expense'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-submit">
            <Plus size={16} /> Tambah Akun
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div style={{ marginTop: 40, borderTop: '1px solid rgba(244,63,94,0.2)', paddingTop: 24 }}>
        <h5 className="rose-text" style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertCircle size={16} /> Zona Bahaya (Danger Zone)
        </h5>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
          Tindakan ini akan menghapus permanen seluruh daftar akun dan semua riwayat transaksi dari database Anda.
        </p>
        <button onClick={onResetDatabase} className="btn-delete" style={{ padding: '10px 20px', fontSize: 13, fontWeight: 600 }}>
          <RotateCcw size={14} /> Reset Seluruh Data Pembukuan
        </button>
      </div>
    </div>
  );
}
