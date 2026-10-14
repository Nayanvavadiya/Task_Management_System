const Product = require('../models/Product');

// @desc    Get all products with search, filter, sort & pagination
// @route   GET /api/products
// @access  Private (Admin & User)
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      sortBy = 'createdAt',
      order = 'desc',
      stockStatus,
      page = 1,
      limit = 8,
    } = req.query;

    const query = {};

    // 1. Search filter (Regex on name and description)
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // 2. Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // 3. Stock status filter
    if (stockStatus) {
      if (stockStatus === 'outOfStock') {
        query.stockQuantity = 0;
      } else if (stockStatus === 'lowStock') {
        query.stockQuantity = { $gt: 0, $lte: 10 };
      } else if (stockStatus === 'inStock') {
        query.stockQuantity = { $gt: 10 };
      }
    }

    // 4. Sorting logic
    let sortOptions = {};
    if (sortBy === 'price') {
      sortOptions.price = order === 'asc' ? 1 : -1;
    } else if (sortBy === 'name') {
      sortOptions.name = order === 'asc' ? 1 : -1;
    } else if (sortBy === 'stockQuantity') {
      sortOptions.stockQuantity = order === 'asc' ? 1 : -1;
    } else {
      sortOptions.createdAt = order === 'asc' ? 1 : -1;
    }

    // 5. Pagination logic
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 8);
    const skip = (pageNum - 1) * limitNum;

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(totalProducts / limitNum) || 1;

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory stats summary (Total products, total stock, total valuation, low stock, out of stock)
// @route   GET /api/products/stats
// @access  Private (Admin & User)
const getProductStats = async (req, res, next) => {
  try {
    const products = await Product.find({});

    const totalProducts = products.length;
    let totalStock = 0;
    let totalValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let inStockCount = 0;

    const categoryCounts = {};

    products.forEach((p) => {
      totalStock += p.stockQuantity;
      totalValue += p.price * p.stockQuantity;

      if (p.stockQuantity === 0) {
        outOfStockCount++;
      } else if (p.stockQuantity <= 10) {
        lowStockCount++;
      } else {
        inStockCount++;
      }

      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalStock,
        totalValue: Math.round(totalValue * 100) / 100,
        inStockCount,
        lowStockCount,
        outOfStockCount,
        categoryCounts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product details by ID
// @route   GET /api/products/:id
// @access  Private (Admin & User)
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found with the specified ID.',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Admin Only)
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stockQuantity, category, imageUrl } = req.body;

    if (!name || !description || price === undefined || stockQuantity === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description, price, stock quantity, and category.',
      });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than zero.',
      });
    }

    if (Number(stockQuantity) < 0 || !Number.isInteger(Number(stockQuantity))) {
      return res.status(400).json({
        success: false,
        message: 'Stock quantity must be a non-negative whole integer.',
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      stockQuantity: Number(stockQuantity),
      category: category.trim(),
      imageUrl: imageUrl ? imageUrl.trim() : '',
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing product
// @route   PUT /api/products/:id
// @access  Private (Admin Only)
const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found with the specified ID.',
      });
    }

    const { name, description, price, stockQuantity, category, imageUrl } = req.body;

    if (price !== undefined && Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than zero.',
      });
    }

    if (stockQuantity !== undefined && (Number(stockQuantity) < 0 || !Number.isInteger(Number(stockQuantity)))) {
      return res.status(400).json({
        success: false,
        message: 'Stock quantity must be a non-negative whole integer.',
      });
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (price !== undefined) updateFields.price = Number(price);
    if (stockQuantity !== undefined) updateFields.stockQuantity = Number(stockQuantity);
    if (category !== undefined) updateFields.category = category.trim();
    if (imageUrl !== undefined) updateFields.imageUrl = imageUrl.trim();

    product = await Product.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin Only)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found with the specified ID.',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Product "${product.name}" deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductStats,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
