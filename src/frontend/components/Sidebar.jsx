'use client';

import { NAVIGATION_ITEMS } from '@/frontend/constants/navigation';

export default function Sidebar({ activeMenu, onSelectMenu, isOpen, onClose }) {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="brand-section">
          <div className="brand-icon">A</div>
          <span className="brand-name">Accounting SaaS</span>
        </div>

        <ul className="nav-menu">
          {NAVIGATION_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeMenu === item.name;
            return (
              <li key={item.name} className="nav-item">
                <a
                  onClick={() => {
                    onSelectMenu(item.name);
                    onClose();
                  }}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <div className="user-profile">
          <div className="avatar" />
          <div className="profile-info">
            <span className="profile-name">Administrator</span>
            <span className="profile-role">Neon PostgreSQL</span>
          </div>
        </div>
      </aside>
    </>
  );
}
