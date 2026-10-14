const User = require('../models/User');
const Product = require('../models/Product');

const seedInitialData = async () => {
  try {
    // 1. Seed default Admin if not exists
    let admin = await User.findOne({ email: 'admin@inventory.com' });
    if (!admin) {
      admin = await User.create({
        name: 'System Admin',
        email: 'admin@inventory.com',
        password: 'AdminPassword123!',
        role: 'Admin',
      });
      console.log('[Seed] Default Admin account created (admin@inventory.com / AdminPassword123!)');
    }

    // 2. Seed default regular User if not exists
    let regularUser = await User.findOne({ email: 'user@inventory.com' });
    if (!regularUser) {
      regularUser = await User.create({
        name: 'Demo Standard User',
        email: 'user@inventory.com',
        password: 'UserPassword123!',
        role: 'User',
      });
      console.log('[Seed] Default Regular User account created (user@inventory.com / UserPassword123!)');
    }

    // 3. Seed sample products if database is empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const sampleProducts = [
        {
          name: 'MacBook Pro 16" M3 Max',
          description: 'High-performance laptop featuring 16-core CPU, 40-core GPU, 36GB unified memory, and 1TB SSD storage. Ideal for creators and engineers.',
          price: 2499.99,
          stockQuantity: 18,
          category: 'Computers',
          imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
          createdBy: admin._id,
        },
        {
          name: 'Sony WH-1000XM5 Wireless Headphones',
          description: 'Industry-leading noise canceling wireless over-ear headphones with 30-hour battery life and ultra-comfortable lightweight design.',
          price: 399.00,
          stockQuantity: 6, // Low stock
          category: 'Audio & Video',
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
          createdBy: admin._id,
        },
        {
          name: 'Dell UltraSharp 32" 4K USB-C Hub Monitor',
          description: 'IPS Black technology with 2000:1 contrast ratio, 98% DCI-P3 color gamut, and 90W power delivery over USB-C.',
          price: 799.50,
          stockQuantity: 24,
          category: 'Electronics',
          imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
          createdBy: admin._id,
        },
        {
          name: 'Logitech MX Master 3S Wireless Mouse',
          description: 'Quiet Clicks, 8K DPI any-surface tracking, ultra-fast MagSpeed scrolling, and multi-device Bluetooth pairing.',
          price: 99.99,
          stockQuantity: 0, // Out of stock
          category: 'Mobile & Accessories',
          imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
          createdBy: admin._id,
        },
        {
          name: 'Keychron Q1 Pro Custom Mechanical Keyboard',
          description: 'QMK/VIA wireless mechanical keyboard with CNC machined aluminum body, hot-swappable switches, and double-gasket design.',
          price: 198.00,
          stockQuantity: 14,
          category: 'Computers',
          imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
          createdBy: admin._id,
        },
        {
          name: 'Herman Miller Aeron Ergonomic Chair',
          description: 'Ergonomic office work chair featuring breathable Pellicle mesh, PostureFit SL sacral support, and fully adjustable arms.',
          price: 1450.00,
          stockQuantity: 4, // Low stock
          category: 'Office Equipment',
          imageUrl: 'https://images.unsplash.com/photo-1580481077195-c546a3d9050d?auto=format&fit=crop&w=600&q=80',
          createdBy: admin._id,
        },
        {
          name: 'Apple iPhone 16 Pro 256GB',
          description: 'Titanium design with thinner borders, A18 Pro chip, 48MP Fusion camera system with 5x Telephoto lens, and Camera Control.',
          price: 1099.00,
          stockQuantity: 32,
          category: 'Mobile & Accessories',
          imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
          createdBy: admin._id,
        },
        {
          name: 'Epson EcoTank Wireless Supertank Printer',
          description: 'Cartridge-free supertank printing system with easily refillable high-yield ink tanks, auto 2-sided printing, and Wi-Fi Direct.',
          price: 349.99,
          stockQuantity: 0, // Out of stock
          category: 'Office Equipment',
          imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80',
          createdBy: admin._id,
        },
      ];

      await Product.insertMany(sampleProducts);
      console.log(`[Seed] Seeded ${sampleProducts.length} sample products with varied stock statuses.`);
    }
  } catch (error) {
    console.error('[Seed] Error during seeding:', error.message);
  }
};

module.exports = seedInitialData;
