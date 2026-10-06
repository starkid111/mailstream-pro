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
        {/* Mobile Header Banner (Matching Brevo mobile drawer header) */}
        <div
          className="mobile-drawer-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.25rem',
            background: '#e6f4ea',
            borderBottom: '1px solid #c6f6d5',
            margin: '-1.5rem -1rem 1.25rem -1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#00925d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Mail size={16} />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#00925d', letterSpacing: '-0.03em' }}>
              MailStream <span style={{ color: '#0f172a' }}>Pro</span>
            </span>
          </div>
          <button
            onClick={onCloseMobileMenu}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '0.2rem' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Desktop Menu Header */}
        <div
          className="desktop-menu-header"
          style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '0 0.75rem 0.5rem 0.75rem',
          }}
        >
          Navigation
        </div>

        {/* Nav Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/campaigns'}
                onClick={onCloseMobileMenu}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? '#0f172a' : '#334155',
                  background: isActive ? '#dcfce7' : 'transparent',
                  textDecoration: 'none',
                  transition: 'var(--transition)',
                })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <Icon size={20} style={{ color: '#0f172a' }} />
                  <span>{item.label}</span>
                </div>
                <ArrowRight size={16} style={{ color: '#64748b', opacity: 0.7 }} />
              </NavLink>
            );
          })}
        </div>

        {/* User Account Section at bottom of drawer */}
        <div className="mobile-user-profile-section" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem', padding: '0 0.5rem' }}>
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
            style={{ width: '100%', fontSize: '0.88rem', justifyContent: 'center', borderRadius: '10px' }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
