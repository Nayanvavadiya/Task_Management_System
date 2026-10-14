import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Boxes,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem('inventory_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('inventory_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon-wrapper">
          <Boxes size={24} />
        </div>
        <div>
          <h1 className="brand-title">Inventro</h1>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '-2px' }}>
            Enterprise Inventory & RBAC
          </p>
        </div>
      </div>

      <div className="navbar-actions">
        {user && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {isAdmin ? (
                  <ShieldCheck size={16} color="#8b5cf6" />
                ) : (
                  <UserIcon size={16} color="#06b6d4" />
                )}
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {user.name}
                </span>
                <span className={`badge ${isAdmin ? 'badge-role-admin' : 'badge-role-user'}`}>
                  {user.role}
                </span>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="btn btn-icon"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={logout}
              className="btn btn-secondary"
              title="Logout from session"
            >
              <LogOut size={16} />
              <span className="hidden-mobile">Sign Out</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
