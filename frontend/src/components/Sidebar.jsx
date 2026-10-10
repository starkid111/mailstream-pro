import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Send, PlusCircle, X, LogOut, User as UserIcon, ArrowRight, Mail } from 'lucide-react';
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
        {/* Mobile Header Banner (Only visible on mobile screen sizes inside slide-out drawer) */}
        <div className="mobile-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#00925d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Mail size={16} />
            </div>
            <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#00925d', letterSpacing: '-0.03em' }}>
              MailStream <span style={{ color: '#0f172a' }}>Pro</span>
            </span>
          </div>
          <button
            onClick={onCloseMobileMenu}
            aria-label="Close menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '0.2rem', display: 'flex', alignItems: 'center' }}
          >
            <X size={22} />
          </button>
        </div>



        {/* Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
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
                <Icon size={18} className="nav-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Account Section at bottom (Only visible in mobile slide-out drawer) */}
        <div className="mobile-user-profile-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem', padding: '0 0.25rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#e6f4ea', color: '#00925d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '700' }}>
              <UserIcon size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'User Account'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
            style={{ width: '100%', fontSize: '0.88rem', justifyContent: 'center', borderRadius: '8px' }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
