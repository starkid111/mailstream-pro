import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Mail, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header
      className="main-navbar"
      style={{
        height: '64px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Left Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #34d399, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
            flexShrink: 0,
          }}
        >
          <Mail size={16} />
        </div>
        <span style={{ fontSize: '1.1rem', fontWeight: '700', letterSpacing: '-0.03em', color: '#fff' }}>
          MailStream <span style={{ color: '#10b981' }}>Pro</span>
        </span>
      </Link>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {isAuthenticated ? (
          <>
            {/* Desktop User Badge */}
            <div
              className="desktop-user-pill"
              style={{
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '0.3rem 0.85rem',
                borderRadius: '999px',
                fontSize: '0.83rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ededed',
              }}
            >
              <UserIcon size={13} style={{ color: '#10b981' }} />
              <span style={{ fontWeight: '500' }}>{user?.name}</span>
            </div>

            {/* Desktop Sign Out */}
            <button
              className="btn btn-secondary btn-sm desktop-user-pill"
              onClick={logout}
              title="Sign Out"
              style={{ gap: '0.35rem' }}
            >
              <LogOut size={14} /> Sign Out
            </button>

            {/* Mobile Hamburger */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                color: '#ededed',
                padding: '0.4rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </>
        ) : (
          <div className="nav-public-actions">
            <Link to="/login" className="btn btn-secondary btn-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
