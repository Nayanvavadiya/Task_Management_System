import React from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Calendar, User, Tag, Package, DollarSign, Edit2 } from 'lucide-react';

export const ProductDetailModal = ({ isOpen, onClose, product, onEdit }) => {
  const { isAdmin } = useAuth();

  if (!isOpen || !product) return null;

  const getStockBadge = (stock) => {
    if (stock === 0) {
      return <span className="badge badge-out-of-stock">Out of Stock</span>;
    }
    if (stock <= 10) {
      return <span className="badge badge-low-stock">Low Stock ({stock} Remaining)</span>;
    }
    return <span className="badge badge-in-stock">In Stock ({stock} Available)</span>;
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-category">{product.category}</span>
            {getStockBadge(product.stockQuantity)}
          </div>
          <button
            onClick={onClose}
            className="btn btn-icon"
            style={{ width: '32px', height: '32px' }}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {product.imageUrl && (
            <div
              style={{
                width: '100%',
                height: '240px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                marginBottom: '1.25rem',
                background: 'var(--bg-tertiary)',
              }}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
            {product.name}
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '1rem',
              marginBottom: '1.25rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              ${Number(product.price).toFixed(2)}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Unit Price USD
            </span>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Product Overview
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              {product.description}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              padding: '1rem',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>
                Stock Count
              </span>
              <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
                {product.stockQuantity} units
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>
                Category
              </span>
              <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
                {product.category}
              </strong>
            </div>

            {product.createdAt && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>
                  Added On
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}

            {product.createdBy?.name && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>
                  Created By
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {product.createdBy.name}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          {isAdmin && (
            <button
              onClick={() => {
                onClose();
                onEdit(product);
              }}
              className="btn btn-secondary"
            >
              <Edit2 size={16} />
              <span>Edit Product</span>
            </button>
          )}
          <button onClick={onClose} className="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
