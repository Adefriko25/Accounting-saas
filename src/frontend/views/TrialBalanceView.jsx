'use client';

import { formatRupiah } from '@/frontend/utils/formatters';

export default function TrialBalanceView({ data }) {
  if (!data) return null;

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h4 style={{ fontSize: 18, fontWeight: 600 }}>Trial Balance (Neraca Saldo)</h4>
        {!data.empty && (
          <span className={`badge ${data.balanced ? 'badge-success' : 'badge-error'}`}>
            {data.balanced ? '✅ SEIMBANG (BALANCED)' : '❌ TIDAK SEIMBANG'}
          </span>
        )}
      </div>

      <div className="table-responsive" style={{ marginBottom: 30 }}>
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
            {data.empty ? (
              <tr>
                <td colSpan="4" className="text-center" style={{ color: 'var(--text-muted)' }}>
                  Belum ada data transaksi untuk neraca saldo.
                </td>
              </tr>
            ) : (
              data.entries.map((e, i) => (
                <tr key={i}>
                  <td className="bold-text">{e.account}</td>
                  <td>{e.type}</td>
                  <td className="text-right emerald-text">
                    {e.debit > 0 ? formatRupiah(e.debit) : '-'}
                  </td>
                  <td className="text-right rose-text">
                    {e.credit > 0 ? formatRupiah(e.credit) : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!data.empty && (
        <div className="metrics-grid" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 24 }}>
          <div className="glass-card metric-card" style={{ marginBottom: 0 }}>
            <div className="metric-header">TOTAL SALDO DEBIT</div>
            <div className="metric-value emerald-text">{formatRupiah(data.total_debit)}</div>
          </div>
          <div className="glass-card metric-card" style={{ marginBottom: 0 }}>
            <div className="metric-header">TOTAL SALDO CREDIT</div>
            <div className="metric-value rose-text">{formatRupiah(data.total_credit)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
