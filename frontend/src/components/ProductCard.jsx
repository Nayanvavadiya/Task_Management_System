import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Edit2, Trash2, Eye, Package, AlertCircle } from 'lucide-react';

export const ProductCard = ({ product, onViewDetails, onEdit, onDelete }) => {
  const { isAdmin } = useAuth();

  const getStockBadge = (stock) => {
    if (stock === 0) {
      return <span className="badge badge-out-of-stock">Out of Stock</span>;
    }
    if (stock <= 10) {
      return <span className="badge badge-low-stock">Low Stock ({stock})</span>;
    }
    return <span className="badge badge-in-stock">In Stock ({stock})</span>;
  };

  return (
    <div className="glass-panel product-card">
      <div className="product-image-container">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-image"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.querySelector('.fallback-placeholder').style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="product-image-placeholder fallback-placeholder"
          style={{ display: product.imageUrl ? 'none' : 'flex' }}
        >
          <Package size={36} />
          <span style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>No Image Provided</span>
        </div>

        <div className="product-stock-floating-badge">
          {getStockBadge(product.stockQuantity)}
        </div>
      </div>

      <div className="product-card-body">
        <div className="product-card-header">
          <span className="badge badge-category">{product.category}</span>
        </div>

        <h3 className="product-name" title={product.name}>
          {product.name}
        </h3>

        <p className="product-description" title={product.description}>
          {product.description}
        </p>

        <div className="product-meta-row">
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>
              Unit Price
            </span>
            <span className="product-price">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>
              Stock Level
            </span>
            <span className="product-stock-count" style={{ fontWeight: 600 }}>
              {product.stockQuantity} units
            </span>
          </div>
        </div>

        <div className="product-actions-bar">
          <button
            onClick={() => onViewDetails(product)}
            className="btn btn-secondary"
            style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
          >
            <Eye size={15} />
            <span>Details</span>
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => onEdit(product)}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.65rem' }}
                title="Edit Product (Admin only)"
                aria-label="Edit product"
              >
                <Edit2 size={15} color="#818cf8" />
              </button>

              <button
                onClick={() => onDelete(product)}
                className="btn btn-danger"
                style={{ padding: '0.5rem 0.65rem' }}
                title="Delete Product (Admin only)"
                aria-label="Delete product"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
