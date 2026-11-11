'use client';

import { formatRupiah } from '@/frontend/utils/formatters';

export default function LedgerView({
  accounts,
  selectedAccount,
  onSelectAccount,
  data
}) {
  return (
    <div className="glass-card">
      <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Buku Besar Per Akun</h4>

      {accounts.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Silakan buat akun terlebih dahulu.</p>
      ) : (
        <div>
          <div className="form-grid" style={{ gridTemplateColumns: '2fr 1fr', marginBottom: 30 }}>
            <div className="form-group">
              <label className="form-label">Pilih Akun yang Dilacak:</label>
              <select
                className="form-select"
                value={selectedAccount}
                onChange={e => onSelectAccount(e.target.value)}
              >
                {accounts.map(acc => (
                  <option key={acc.account} value={acc.account}>{acc.account}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ justifyContent: 'flex-end' }}>
              {data && (
                <div className="badge badge-warning" style={{ padding: '12px 18px', borderRadius: 10, width: '100%' }}>
                  TIPE AKUN: {data.type}
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
                {data && data.entries && data.entries.length > 0 ? (
                  data.entries.map((e, i) => (
                    <tr key={i}>
                      <td>{e.date}</td>
                      <td>{e.description}</td>
                      <td className="text-right emerald-text">
                        {e.debit > 0 ? formatRupiah(e.debit) : '-'}
                      </td>
                      <td className="text-right rose-text">
                        {e.credit > 0 ? formatRupiah(e.credit) : '-'}
                      </td>
                      <td className="text-right bold-text" style={{ color: '#fff' }}>
                        {formatRupiah(e.balance)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center" style={{ color: 'var(--text-muted)' }}>
                      Belum ada entri transaksi untuk akun ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
