'use client';

export default function LoadingSpinner({ message = 'Memuat data akuntansi...' }) {
  return (
    <div className="loading-overlay">
      <div className="spinner" />
      <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
    </div>
  );
}
