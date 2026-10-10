import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Mail, Menu, X, Bell, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header
      className="main-navbar"
      style={{
        height: '64px',
        borderBottom: '1px solid #e2e8f0',
        background: '#ffffff',
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
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: '#00925d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(0, 146, 93, 0.25)',
            flexShrink: 0,
          }}
        >
          <Mail size={18} />
        </div>
        <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.03em', color: '#00925d' }}>
          MailStream <span style={{ color: '#0f172a' }}>Pro</span>
        </span>
      </Link>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isAuthenticated ? (
          <>
            {/* Desktop User Badge */}
            <div
              className="desktop-user-pill"
              style={{
                alignItems: 'center',
                gap: '0.4rem',
                background: '#f8fafc',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                border: '1px solid #e2e8f0',
                color: '#0f172a',
              }}
            >
              <UserIcon size={15} style={{ color: '#00925d' }} />
              <span style={{ fontWeight: '600' }}>{user?.name}</span>
            </div>

            {/* Desktop Sign Out */}
            <button className="btn btn-secondary btn-sm desktop-user-pill" onClick={logout} title="Sign Out">
              <LogOut size={16} /> Sign Out
            </button>

            {/* Mobile Hamburger Menu Toggle on the Far Right */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#0f172a',
                padding: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
