'use client';

import { formatRupiah } from '@/frontend/utils/formatters';

export default function CashflowView({
  data,
  selectedAccount,
  onSelectAccount
}) {
  if (!data) return null;

  return (
    <div className="glass-card">
      <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Cashflow Statement</h4>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
        Laporan Arus Kas Bulanan Berdasarkan Akun Kas/Bank
      </p>

      {data.empty ? (
        <div className="empty-state">
          <p style={{ color: 'var(--text-muted)' }}>
            Silakan buat akun bertipe Asset (Kas/Bank) dan input transaksi terlebih dahulu.
          </p>
        </div>
      ) : (
        <div>
          <div className="form-group" style={{ maxWidth: 400, marginBottom: 30 }}>
            <label className="form-label">Pilih Akun Kas/Bank untuk Dilacak:</label>
            <select
              className="form-select"
              value={selectedAccount || (data.available_accounts ? data.available_accounts[0] : '')}
              onChange={e => onSelectAccount(e.target.value)}
            >
              {data.available_accounts && data.available_accounts.map(acc => (
                <option key={acc} value={acc}>{acc}</option>
              ))}
            </select>
          </div>

          <div className="table-responsive">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Kategori Aliran Kas</th>
                  {data.months.map(m => (
                    <th key={m} className="text-right">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, i) => (
                  <tr key={i} className={row.Kategori === 'Net Cashflow' ? 'row-total' : ''}>
                    <td className="bold-text">{row.Kategori}</td>
                    {data.months.map(m => (
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
  );
}
