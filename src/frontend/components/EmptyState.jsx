'use client';

import { FileText } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = FileText, 
  title = 'Belum Ada Data', 
  description = 'Silakan isi data terlebih dahulu.',
  actionText,
  onAction
}) {
  return (
    <div className="glass-card empty-state">
      <div className="empty-icon">
        <Icon size={32} />
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-desc">{description}</p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn-submit">
          {actionText}
        </button>
      )}
    </div>
  );
}
