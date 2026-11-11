'use client';

import { CheckCircle, AlertCircle } from 'lucide-react';

export default function ToastContainer({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' ? (
            <CheckCircle size={18} className="emerald-text" />
          ) : (
            <AlertCircle size={18} className="rose-text" />
          )}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
