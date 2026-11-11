'use client';

import { List } from 'lucide-react';

export default function MobileTopbar({ onToggleSidebar }) {
  return (
    <div className="mobile-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="brand-icon" style={{ width: 34, height: 34, fontSize: 16 }}>A</div>
        <span className="brand-name" style={{ fontSize: 18 }}>Accounting SaaS</span>
      </div>
      <button 
        className="menu-toggle" 
        onClick={onToggleSidebar}
        aria-label="Toggle Navigation Menu"
      >
        <List size={22} />
      </button>
    </div>
  );
}
