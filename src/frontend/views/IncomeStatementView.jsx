'use client';

import { formatRupiah } from '@/frontend/utils/formatters';

export default function IncomeStatementView({ data }) {
  if (!data) return null;

  return (
    <div className="glass-card">
      <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Profit and Loss (P&L) Statement</h4>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
        Laporan Laba Rugi Akrual Bulanan & Akumulasi Tahun Penuh
      </p>

      {data.empty ? (
        <div className="empty-state">
          <p style={{ color: 'var(--text-muted)' }}>Belum ada data transaksi keuangan untuk laba rugi.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="app-table">
            <thead>
              <tr>
                <th>Kategori</th>
                {data.months.map(m => (
                  <th key={m} className="text-right">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => (
                <tr 
                  key={i} 
                  className={['Gross Profit', 'Net Profit'].includes(row.Kategori) ? 'row-total' : ''}
                >
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
      )}
    </div>
  );
}
