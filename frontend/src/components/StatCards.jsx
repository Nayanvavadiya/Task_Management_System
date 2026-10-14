import React from 'react';
import { Package, CheckCircle2, AlertTriangle, XCircle, DollarSign } from 'lucide-react';

export const StatCards = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="stats-grid">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="glass-panel stat-card" style={{ height: '94px', opacity: 0.6 }}>
            <div className="spinner" style={{ width: '24px', height: '24px', margin: 0 }} />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      label: 'Total Products',
      value: stats.totalProducts ?? 0,
      icon: <Package size={22} />,
      iconColor: '#6366f1',
      iconBg: 'rgba(99, 102, 241, 0.15)',
      accentColor: '#6366f1',
    },
    {
      label: 'In Stock',
      value: stats.inStockCount ?? 0,
      icon: <CheckCircle2 size={22} />,
      iconColor: '#10b981',
      iconBg: 'rgba(16, 185, 129, 0.15)',
      accentColor: '#10b981',
    },
    {
      label: 'Low Stock (≤10)',
      value: stats.lowStockCount ?? 0,
      icon: <AlertTriangle size={22} />,
      iconColor: '#f59e0b',
      iconBg: 'rgba(245, 158, 11, 0.15)',
      accentColor: '#f59e0b',
    },
    {
      label: 'Out of Stock',
      value: stats.outOfStockCount ?? 0,
      icon: <XCircle size={22} />,
      iconColor: '#ef4444',
      iconBg: 'rgba(239, 68, 68, 0.15)',
      accentColor: '#ef4444',
    },
    {
      label: 'Inventory Valuation',
      value: `$${(stats.totalValue || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <DollarSign size={22} />,
      iconColor: '#a855f7',
      iconBg: 'rgba(168, 85, 247, 0.15)',
      accentColor: '#a855f7',
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="glass-panel stat-card"
          style={{
            '--accent-color': card.accentColor,
            '--icon-bg': card.iconBg,
            '--icon-color': card.iconColor,
          }}
        >
          <div className="stat-icon-wrapper">{card.icon}</div>
          <div className="stat-info">
            <span className="stat-label">{card.label}</span>
            <span className="stat-value">{card.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCards;
