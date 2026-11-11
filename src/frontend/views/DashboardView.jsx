'use client';

import { TrendingUp, Activity, Wallet, FileText } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { formatRupiah } from '@/frontend/utils/formatters';
import EmptyState from '@/frontend/components/EmptyState';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f43f5e', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899', '#14b8a6'];

export default function DashboardView({ data, onNavigateToAccounts }) {
  if (!data || data.empty) {
    return (
      <EmptyState
        icon={FileText}
        title="Belum Ada Data Keuangan"
        description="Silakan isi Chart of Accounts dan Input Journal terlebih dahulu agar Dashboard dapat menampilkan analisa grafik interaktif."
        actionText="Mulai Isi Akun"
        onAction={onNavigateToAccounts}
      />
    );
  }

  const latest = data.monthly_data[data.monthly_data.length - 1] || {};
  const totalIn = data.monthly_data.reduce((acc, m) => acc + m.CashIn, 0);
  const totalOut = data.monthly_data.reduce((acc, m) => acc + m.CashOut, 0);

  return (
    <div>
      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-header">
            <span>Revenue Terakhir</span>
            <TrendingUp size={16} />
          </div>
          <div className="metric-value">{formatRupiah(latest.Revenue)}</div>
          <div className={`metric-change ${latest.Growth >= 0 ? 'positive' : 'negative'}`}>
            {latest.Growth >= 0 ? '+' : ''}{(latest.Growth || 0).toFixed(1)}% MoM Growth
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-header">
            <span>Net Profit Terakhir</span>
            <Activity size={16} />
          </div>
          <div className="metric-value emerald-text">{formatRupiah(latest.NetProfit)}</div>
          <div className="metric-change positive">
            Net Margin: {(latest.NetMargin || 0).toFixed(1)}%
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
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Chart 1: Revenue vs Growth */}
        <div className="glass-card chart-card">
          <h4 className="chart-title">Revenue vs Growth</h4>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data.monthly_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="Month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#141c33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Legend />
              <Bar yAxisId="left" dataKey="Revenue" fill="#3b82f6" name="Revenue (Rp)" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="Growth" stroke="#f43f5e" name="Growth (%)" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Profit Margins */}
        <div className="glass-card chart-card">
          <h4 className="chart-title">Gross Profit & Net Profit Margin</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthly_data}>
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

        {/* Chart 3: Revenue vs COGS */}
        <div className="glass-card chart-card">
          <h4 className="chart-title">Revenue vs COGS</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthly_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="Month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#141c33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="Revenue" fill="#3b82f6" name="Revenue" radius={[4, 4, 0, 0]} />
              <Bar dataKey="COGS" fill="#f43f5e" name="COGS" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 4: Expense Breakdown & Cashflow Donut */}
        <div className="glass-card chart-card">
          <h4 className="chart-title">Alokasi Beban & Arus Kas</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <h5 style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>ALOKASI BEBAN</h5>
              {data.expense_breakdown && data.expense_breakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={data.expense_breakdown}
                      dataKey="amount"
                      nameKey="account"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {data.expense_breakdown.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#141c33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', padding: '50px 0' }}>Belum ada data beban.</p>
              )}
            </div>

            <div>
              <h5 style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>TOTAL CASHFLOW</h5>
              {totalIn > 0 || totalOut > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Cash In', value: totalIn },
                        { name: 'Cash Out', value: totalOut }
                      ]}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#3b82f6" />
                    </Pie>
                    <Tooltip contentStyle={{ background: '#141c33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', padding: '50px 0' }}>Belum ada arus kas.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
