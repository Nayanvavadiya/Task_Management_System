import React, { useState, useEffect, useRef } from 'react';
import { X, Image as ImageIcon, AlertCircle } from 'lucide-react';

const MAX_SOURCE_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_STORED_IMAGE_SIZE = 300 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const CATEGORIES = [
  'Electronics',
  'Computers',
  'Mobile & Accessories',
  'Audio & Video',
  'Office Equipment',
  'Home & Living',
  'Other',
];

export const ProductModal = ({ isOpen, onClose, onSave, productToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    category: 'Electronics',
    imageUrl: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedImageName, setSelectedImageName] = useState('');
  const imageInputRef = useRef(null);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        description: productToEdit.description || '',
        price: productToEdit.price ?? '',
        stockQuantity: productToEdit.stockQuantity ?? '',
        category: productToEdit.category || 'Electronics',
        imageUrl: productToEdit.imageUrl || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        stockQuantity: '',
        category: 'Electronics',
        imageUrl: '',
      });
    }
    setErrors({});
    setSelectedImageName('');
    if (imageInputRef.current) imageInputRef.current.value = '';
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Product name is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.price || Number(formData.price) <= 0) {
      errs.price = 'Price must be greater than 0';
    }
    if (
      formData.stockQuantity === '' ||
      Number(formData.stockQuantity) < 0 ||
      !Number.isInteger(Number(formData.stockQuantity))
    ) {
      errs.stockQuantity = 'Stock must be a non-negative whole integer';
    }
    if (!formData.category) errs.category = 'Category is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: 'Choose a JPG, PNG, or WebP image.' }));
      return;
    }

    if (file.size > MAX_SOURCE_IMAGE_SIZE) {
      setErrors((prev) => ({ ...prev, image: 'Choose an image smaller than 10 MB.' }));
      return;
    }

    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Image canvas unavailable');
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();

      let compressedImage;
      for (const quality of [0.82, 0.72, 0.62, 0.52, 0.42]) {
        compressedImage = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
        if (compressedImage && compressedImage.size <= MAX_STORED_IMAGE_SIZE) break;
      }
      if (!compressedImage || compressedImage.size > MAX_STORED_IMAGE_SIZE) {
        throw new Error('Image is too large after optimization');
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          setErrors((prev) => ({ ...prev, image: 'Could not read this image.' }));
          return;
        }
        setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
        setSelectedImageName(file.name);
        setErrors((prev) => {
          const { image, ...remaining } = prev;
          return remaining;
        });
      };
      reader.onerror = () => {
        setErrors((prev) => ({ ...prev, image: 'Could not read this image.' }));
      };
      reader.readAsDataURL(compressedImage);
    } catch {
      setErrors((prev) => ({ ...prev, image: 'Could not optimize this image. Try another file.' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSave({
        ...formData,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
      });
      onClose();
    } catch (err) {
      setErrors((prev) => ({ ...prev, api: err.message }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {productToEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="btn btn-icon"
            style={{ width: '32px', height: '32px' }}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.api && (
              <div
                style={{
                  background: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  color: '#f87171',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{errors.api}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Dell XPS 15 Laptop"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              {errors.name && (
                <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.name}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
                {errors.price && (
                  <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.price}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Stock Quantity *</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  className="form-input"
                  placeholder="0"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  required
                />
                {errors.stockQuantity && (
                  <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.stockQuantity}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-input filter-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Comprehensive description of product specifications and features..."
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
              {errors.description && (
                <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.description}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Image (Optional)</label>
              <label className="form-label" htmlFor="product-image-url">Image URL</label>
              <input
                id="product-image-url"
                type="url"
                className="form-input"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl.startsWith('data:image/') ? '' : formData.imageUrl}
                onChange={(e) => {
                  setFormData({ ...formData, imageUrl: e.target.value });
                  setSelectedImageName('');
                  setErrors((prev) => {
                    const { image, ...remaining } = prev;
                    return remaining;
                  });
                }}
              />
              <label className="form-label" htmlFor="product-image-file" style={{ marginTop: '0.75rem' }}>
                <ImageIcon size={15} style={{ verticalAlign: 'text-bottom', marginRight: '0.35rem' }} />
                Choose an image from your device
              </label>
              <input
                id="product-image-file"
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="form-input"
                onChange={handleImageChange}
              />
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
                JPG, PNG, or WebP. Up to 10 MB; optimized when selected.
              </span>
              {selectedImageName && (
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Selected: {selectedImageName}
                </span>
              )}
              {errors.image && (
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#ef4444', marginTop: '0.35rem' }}>
                  {errors.image}
                </span>
              )}
              {formData.imageUrl && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    maxHeight: '120px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <img
                    key={formData.imageUrl}
                    src={formData.imageUrl}
                    alt="Preview"
                    style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : productToEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
