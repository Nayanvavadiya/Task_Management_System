import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, product }) => {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !product) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm(product._id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
            <AlertTriangle size={20} />
            <h2 className="modal-title" style={{ fontSize: '1.15rem' }}>Confirm Deletion</h2>
          </div>
          <button onClick={onClose} className="btn btn-icon" style={{ width: '30px', height: '30px' }} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 }}>
            Are you sure you want to delete <strong style={{ color: 'var(--text-main)' }}>"{product.name}"</strong>?
          </p>
          <p style={{ fontSize: '0.8rem', color: '#f87171', background: 'var(--danger-bg)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--danger-border)' }}>
            Warning: This action will permanently remove this item from the inventory catalog and cannot be undone.
          </p>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary" disabled={deleting}>
            Cancel
          </button>
          <button onClick={handleConfirm} className="btn btn-danger" disabled={deleting}>
            {deleting ? 'Deleting...' : (
              <>
                <Trash2 size={16} />
                <span>Delete Permanently</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
