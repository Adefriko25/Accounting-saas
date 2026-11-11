'use client';

import { formatRupiah } from '@/frontend/utils/formatters';

export default function BalanceSheetView({ data }) {
  if (!data) return null;

  return (
    <div className="glass-card">
      <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Balance Sheet (Neraca)</h4>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
        Akumulasi Saldo Posisi Keuangan per Bulan
      </p>

      {data.empty ? (
        <div className="empty-state">
          <p style={{ color: 'var(--text-muted)' }}>Belum ada data transaksi keuangan untuk neraca.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="app-table">
            <thead>
              <tr>
                <th>Nama Akun / Klasifikasi</th>
                {data.months.map(m => (
                  <th key={m} className="text-right">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => {
                let cls = '';
                if (row.is_header) cls = 'row-header';
                else if (row.is_total) cls = 'row-total';
                else if (row.is_check) cls = 'row-check';
                else if (row.is_spacer) cls = 'row-spacer';

                return (
                  <tr key={i} className={cls}>
                    {row.is_spacer ? (
                      <td colSpan={data.months.length + 1} />
                    ) : (
                      <>
                        <td className={row.is_header || row.is_total ? 'bold-text' : ''}>
                          {row.Account}
                        </td>
                        {data.months.map(m => (
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
  );
}
