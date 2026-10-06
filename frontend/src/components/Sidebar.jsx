import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Send, PlusCircle } from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/recipients', label: 'Recipients', icon: Users },
    { to: '/campaigns', label: 'Campaigns', icon: Send },
    { to: '/campaigns/new', label: 'Create Campaign', icon: PlusCircle },
  ];

  return (
    <aside
      style={{
        width: '240px',
        borderRight: '1px solid #e2e8f0',
        background: '#ffffff',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
      }}
    >
      <div
        style={{
          fontSize: '0.72rem',
          fontWeight: '700',
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          padding: '0 0.75rem 0.5rem 0.75rem',
        }}
      >
        Menu
      </div>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/campaigns'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              fontWeight: isActive ? '600' : '500',
              color: isActive ? '#00925d' : '#475569',
              background: isActive ? '#e6f4ea' : 'transparent',
              textDecoration: 'none',
              transition: 'var(--transition)',
            })}
          >
            <Icon size={18} style={{ color: undefined }} />
            {item.label}
          </NavLink>
        );
      })}
    </aside>
  );
};
