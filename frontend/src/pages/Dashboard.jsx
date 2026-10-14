import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import StatCards from '../components/StatCards';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import ProductDetailModal from '../components/ProductDetailModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import Pagination from '../components/Pagination';
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  RefreshCw,
  PackageOpen,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Electronics',
  'Computers',
  'Mobile & Accessories',
  'Audio & Video',
  'Office Equipment',
  'Home & Living',
  'Other',
];

export const Dashboard = () => {
  const { user, isAdmin, showToast } = useAuth();

  // Inventory data states
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters and controls
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [stockStatus, setStockStatus] = useState('all'); // all, inStock, lowStock, outOfStock
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 8;

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.getProductStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      console.warn('Failed to fetch stats:', err.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        search,
        category: category !== 'All' ? category : undefined,
        stockStatus: stockStatus !== 'all' ? stockStatus : undefined,
        sortBy,
        order,
        page: currentPage,
        limit,
      };

      const res = await api.getProducts(params);
      if (res.success) {
        setProducts(res.products);
        setTotalPages(res.totalPages);
        setTotalProducts(res.totalProducts);
      }
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search, category, stockStatus, sortBy, order, currentPage]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handlers for Admin actions
  const handleCreateOrUpdateProduct = async (productData) => {
    if (productToEdit) {
      const res = await api.updateProduct(productToEdit._id, productData);
      showToast(`Updated "${res.product.name}" successfully!`, 'success');
    } else {
      const res = await api.createProduct(productData);
      showToast(`Added "${res.product.name}" to inventory!`, 'success');
    }
    fetchProducts();
    fetchStats();
  };

  const handleDeleteProduct = async (id) => {
    await api.deleteProduct(id);
    showToast('Product successfully removed from inventory.', 'success');
    fetchProducts();
    fetchStats();
  };

  const openCreateModal = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const openEditModal = (product) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  };

  const openDetailModal = (product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleStockFilterClick = (statusKey) => {
    setStockStatus(statusKey);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    if (value === 'price-asc') {
      setSortBy('price');
      setOrder('asc');
    } else if (value === 'price-desc') {
      setSortBy('price');
      setOrder('desc');
    } else if (value === 'name-asc') {
      setSortBy('name');
      setOrder('asc');
    } else if (value === 'stock-desc') {
      setSortBy('stockQuantity');
      setOrder('desc');
    } else {
      setSortBy('createdAt');
      setOrder('desc');
    }
    setCurrentPage(1);
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        {/* Top Banner / Welcome Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Inventory Catalog</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Real-time product stock, category tracking, and lifecycle management
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => {
                fetchProducts();
                fetchStats();
              }}
              className="btn btn-secondary"
              title="Refresh Catalog Data"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>

            {isAdmin && (
              <button onClick={openCreateModal} className="btn btn-primary">
                <Plus size={18} />
                <span>Add Product</span>
              </button>
            )}
          </div>
        </div>

        {/* Analytic KPI Stat Cards */}
        <StatCards stats={stats} loading={statsLoading} />

        {/* Filter and Control Bar */}
        <div className="glass-panel controls-bar">
          {/* Search Box */}
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="input-field"
              placeholder="Search by product name or description..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          {/* Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--text-dim)" />
            <select
              className="filter-select"
              value={category}
              onChange={handleCategoryChange}
              aria-label="Filter by category"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowUpDown size={16} color="var(--text-dim)" />
            <select
              className="filter-select"
              onChange={handleSortChange}
              defaultValue="newest"
              aria-label="Sort products"
            >
              <option value="newest">Sort: Newest Added</option>
              <option value="price-asc">Sort: Price (Low to High)</option>
              <option value="price-desc">Sort: Price (High to Low)</option>
              <option value="name-asc">Sort: Name (A - Z)</option>
              <option value="stock-desc">Sort: Stock Level (High to Low)</option>
            </select>
          </div>

          {/* Stock Filter Pills */}
          <div className="filter-group">
            <button
              onClick={() => handleStockFilterClick('all')}
              className={`pill-filter ${stockStatus === 'all' ? 'active' : ''}`}
            >
              All Stock
            </button>
            <button
              onClick={() => handleStockFilterClick('inStock')}
              className={`pill-filter ${stockStatus === 'inStock' ? 'active' : ''}`}
            >
              In Stock
            </button>
            <button
              onClick={() => handleStockFilterClick('lowStock')}
              className={`pill-filter ${stockStatus === 'lowStock' ? 'active' : ''}`}
            >
              Low Stock
            </button>
            <button
              onClick={() => handleStockFilterClick('outOfStock')}
              className={`pill-filter ${stockStatus === 'outOfStock' ? 'active' : ''}`}
            >
              Out of Stock
            </button>
          </div>
        </div>

        {/* Error Alert State */}
        {error && (
          <div
            style={{
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              color: '#f87171',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <AlertCircle size={22} />
            <div>
              <strong style={{ display: 'block' }}>Failed to load inventory</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Loading Spinner State */}
        {loading ? (
          <div className="state-container">
            <div className="spinner" />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Fetching product inventory catalog...
            </p>
          </div>
        ) : products.length === 0 ? (
          /* Empty State */
          <div className="glass-panel state-container">
            <PackageOpen size={48} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>No Products Found</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '420px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {search || category !== 'All' || stockStatus !== 'all'
                ? 'No inventory items match your current filter criteria. Try resetting filters.'
                : 'Your product catalog is currently empty. Add your first item to start tracking!'}
            </p>
            {search || category !== 'All' || stockStatus !== 'all' ? (
              <button
                onClick={() => {
                  setSearch('');
                  setCategory('All');
                  setStockStatus('all');
                  setCurrentPage(1);
                }}
                className="btn btn-secondary"
              >
                Clear All Filters
              </button>
            ) : isAdmin ? (
              <button onClick={openCreateModal} className="btn btn-primary">
                <Plus size={16} />
                <span>Add First Product</span>
              </button>
            ) : null}
          </div>
        ) : (
          /* Product Grid Display */
          <>
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onViewDetails={openDetailModal}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalProducts={totalProducts}
              limit={limit}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </>
        )}
      </main>

      {/* Admin Create / Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleCreateOrUpdateProduct}
        productToEdit={productToEdit}
      />

      {/* Product Specification Detail Modal */}
      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        product={selectedProduct}
        onEdit={openEditModal}
      />

      {/* Admin Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProduct}
        product={productToDelete}
      />
    </div>
  );
};

export default Dashboard;
