import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Send, PlusCircle, X, LogOut, User as UserIcon, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ mobileMenuOpen, onCloseMobileMenu }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/recipients', label: 'Recipients', icon: Users },
    { to: '/campaigns', label: 'Campaigns', icon: Send },
    { to: '/campaigns/new', label: 'Create Campaign', icon: PlusCircle },
  ];

  return (
    <>
      {/* Mobile Dark Overlay */}
      <div
        className={`sidebar-overlay ${mobileMenuOpen ? 'mobile-open' : ''}`}
        onClick={onCloseMobileMenu}
      />

      <aside className={`app-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Mobile Header (only visible on mobile) */}
        <div className="mobile-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '28px', height: '28px', borderRadius: '7px',
                background: 'linear-gradient(135deg, #34d399, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.35)',
              }}
            >
              <Mail size={15} />
            </div>
            <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff', letterSpacing: '-0.03em' }}>
              MailStream <span style={{ color: '#10b981' }}>Pro</span>
            </span>
          </div>
          <button
            onClick={onCloseMobileMenu}
            aria-label="Close menu"
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer', color: '#a1a1a1', padding: '0.3rem', borderRadius: '6px',
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Label */}
        <div className="desktop-menu-header" style={{ marginTop: '0.5rem' }}>Navigation</div>

        {/* Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                onClick={onCloseMobileMenu}
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} className="nav-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Mobile User Section */}
        <div className="mobile-user-profile-section">
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem',
              padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)', color: '#10b981',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <UserIcon size={16} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#ededed', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'User Account'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b6b6b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => {
              onCloseMobileMenu();
              logout();
            }}
            style={{ width: '100%', fontSize: '0.85rem', justifyContent: 'center' }}
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
