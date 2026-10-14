const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductStats,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

// All product routes require valid JWT authentication
router.use(protect);

// Product statistics (available to authenticated users)
router.get('/stats', getProductStats);

// Product list (Admin & User) & Create product (Admin only)
router
  .route('/')
  .get(getProducts)
  .post(requireAdmin, createProduct);

// Single product view (Admin & User), Update (Admin only), Delete (Admin only)
router
  .route('/:id')
  .get(getProductById)
  .put(requireAdmin, updateProduct)
  .delete(requireAdmin, deleteProduct);

module.exports = router;
