import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header
      style={{
        height: '64px',
        borderBottom: '1px solid #e2e8f0',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
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
          }}
        >
          <Mail size={18} />
        </div>
        <span style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.03em', color: '#0f172a' }}>
          MailStream <span style={{ color: '#00925d' }}>Pro</span>
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isAuthenticated ? (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#f8fafc',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.88rem',
                border: '1px solid #e2e8f0',
                color: '#0f172a',
              }}
            >
              <UserIcon size={16} style={{ color: '#00925d' }} />
              <span style={{ fontWeight: '600' }}>{user?.name}</span>
            </div>

            <button className="btn btn-secondary btn-sm" onClick={logout} title="Sign Out">
              <LogOut size={16} /> Sign Out
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-secondary btn-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get Started Free
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
