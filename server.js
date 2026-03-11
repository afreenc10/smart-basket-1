import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import cors from 'cors';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ─── DB Connection ────────────────────────────────────────────────────────────
const db = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_change_this';

// ─── Initialize Database Tables ───────────────────────────────────────────────
async function initializeTables() {
  try {
    // Create saved_addresses table
    await db.query(`
      CREATE TABLE IF NOT EXISTS saved_addresses (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        pincode VARCHAR(10) NOT NULL,
        is_default BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_is_default (is_default)
      )
    `);

    // Create saved_payments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS saved_payments (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        card_holder VARCHAR(255) NOT NULL,
        card_number VARCHAR(255) NOT NULL,
        payment_method VARCHAR(50) NOT NULL DEFAULT 'credit_card',
        is_default BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_is_default (is_default)
      )
    `);

    // Create wishlist table
    await db.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        product_id VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_product (user_id, product_id),
        INDEX idx_user_id (user_id),
        INDEX idx_product_id (product_id)
      )
    `);

    console.log('✅ Database tables initialized');
  } catch (err) {
    console.error('Error initializing tables:', err);
  }
}

await initializeTables();

// ─── Middleware: verify JWT ───────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ─── Auth Routes ─────────────────────────────────────────────────────────────

// SIGN UP
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existing.length > 0)
      return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const [result] =await db.query(
  'INSERT INTO users (id, email, password) VALUES (?, ?, ?)',
  [userId, email, hashedPassword]
);

    const user = { id: userId, email };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SIGN IN
app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0)
      return res.status(401).json({ error: 'Invalid email or password' });

    const dbUser = rows[0];
    const isValid = await bcrypt.compare(password, dbUser.password);
    if (!isValid)
      return res.status(401).json({ error: 'Invalid email or password' });

    const user = { id: dbUser.id, email: dbUser.email };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET CURRENT USER (validate stored token)
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// SIGN OUT (stateless — client just deletes the token)
app.post('/api/auth/signout', (_req, res) => {
  res.json({ message: 'Signed out' });
});

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products ORDER BY name;');
    res.json(rows);
    //res.send("hello world");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/orders', async (req, res) => {
  const {
    order_number,
    user_id,
    customer_name,
    customer_phone,
    delivery_address,
    pincode,
    total_amount,
    status,
    items, // array of { product_id, quantity, price }
  } = req.body;

  if (!items || items.length === 0)
    return res.status(400).json({ error: 'No items in order' });

  try {
    const orderId = uuidv4();

    // Insert order
    await db.query(
      `INSERT INTO orders 
        (id, order_number, user_id, customer_name, customer_phone, delivery_address, pincode, total_amount, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, order_number, user_id || null, customer_name, customer_phone, delivery_address, pincode, total_amount, status]
    );

    // Insert order items
    for (const item of items) {
      await db.query(
        `INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), orderId, item.product_id, item.quantity, item.price]
      );
    }

    res.json({ id: orderId, order_number });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ─── Add these routes to your server.js ──────────────────────────────────────

// GET orders for logged-in user
app.get('/api/orders/my-orders', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET orders for guest (by order_numbers stored in localStorage)
app.post('/api/orders/guest', async (req, res) => {
  const { order_numbers } = req.body;
  if (!order_numbers || order_numbers.length === 0)
    return res.json([]);

  try {
    const placeholders = order_numbers.map(() => '?').join(', ');
    const [rows] = await db.query(
      `SELECT * FROM orders WHERE order_number IN (${placeholders}) ORDER BY created_at DESC`,
      order_numbers
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Track order by order ID
app.get('/api/orders/track/:orderId', async (req, res) => {
  const { orderId } = req.params;
  
  if (!orderId || !orderId.startsWith('ORD')) {
    return res.status(400).json({ error: 'Invalid order ID format' });
  }

  try {
    const [orderRows] = await db.query(
      'SELECT * FROM orders WHERE order_number = ?',
      [orderId]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderRows[0];

    // Get order items
    const [itemRows] = await db.query(
      `SELECT oi.product_id, oi.quantity, oi.price, p.name as product_name 
       FROM order_items oi 
       LEFT JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [order.id]
    );

    order.items = itemRows;
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search orders by phone number
app.post('/api/orders/search-by-phone', async (req, res) => {
  const { phone } = req.body;

  if (!phone || phone.length < 10) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }

  try {
    const [orderRows] = await db.query(
      'SELECT * FROM orders WHERE customer_phone LIKE ? ORDER BY created_at DESC',
      [`%${phone}%`]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'No orders found' });
    }

    // Get items for all orders
    const ordersWithItems = await Promise.all(
      orderRows.map(async (order) => {
        const [itemRows] = await db.query(
          `SELECT oi.product_id, oi.quantity, oi.price, p.name as product_name 
           FROM order_items oi 
           LEFT JOIN products p ON oi.product_id = p.id 
           WHERE oi.order_id = ?`,
          [order.id]
        );
        order.items = itemRows;
        return order;
      })
    );

    res.json(ordersWithItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Saved Addresses ──────────────────────────────────────────────────────────

// GET user's saved addresses
app.get('/api/user/addresses', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, phone, address, pincode, is_default FROM saved_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new saved address
app.post('/api/user/addresses', authMiddleware, async (req, res) => {
  const { name, phone, address, pincode } = req.body;

  if (!name || !phone || !address || !pincode) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const addressId = uuidv4();
    const [existing] = await db.query(
      'SELECT id FROM saved_addresses WHERE user_id = ?',
      [req.user.id]
    );

    const is_default = existing.length === 0;

    await db.query(
      `INSERT INTO saved_addresses (id, user_id, name, phone, address, pincode, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [addressId, req.user.id, name, phone, address, pincode, is_default]
    );

    res.json({ id: addressId, name, phone, address, pincode, is_default });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update saved address
app.put('/api/user/addresses/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, phone, address, pincode } = req.body;

  if (!name || !phone || !address || !pincode) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    await db.query(
      `UPDATE saved_addresses SET name = ?, phone = ?, address = ?, pincode = ? 
       WHERE id = ? AND user_id = ?`,
      [name, phone, address, pincode, id, req.user.id]
    );
    res.json({ id, name, phone, address, pincode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE saved address
app.delete('/api/user/addresses/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(
      'DELETE FROM saved_addresses WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT set default address
app.put('/api/user/addresses/:id/default', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(
      'UPDATE saved_addresses SET is_default = 0 WHERE user_id = ?',
      [req.user.id]
    );

    await db.query(
      'UPDATE saved_addresses SET is_default = 1 WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({ message: 'Default address updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Saved Payment Methods ────────────────────────────────────────────────────

// GET user's saved payment methods
app.get('/api/user/payments', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, card_holder, CONCAT('****-****-****-', SUBSTR(card_number, -4)) as last_four, 
              payment_method, is_default FROM saved_payments WHERE user_id = ? 
       ORDER BY is_default DESC, created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new saved payment method
app.post('/api/user/payments', authMiddleware, async (req, res) => {
  const { card_holder, card_number, payment_method } = req.body;

  if (!card_holder || !card_number || !payment_method) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const paymentId = uuidv4();
    const [existing] = await db.query(
      'SELECT id FROM saved_payments WHERE user_id = ?',
      [req.user.id]
    );

    const is_default = existing.length === 0;

    await db.query(
      `INSERT INTO saved_payments (id, user_id, card_holder, card_number, payment_method, is_default)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [paymentId, req.user.id, card_holder, card_number, payment_method, is_default]
    );

    const last_four = card_number.slice(-4);
    res.json({
      id: paymentId,
      card_holder,
      last_four,
      payment_method,
      is_default,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update saved payment method
app.put('/api/user/payments/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { card_holder, card_number, payment_method } = req.body;

  if (!card_holder || !card_number || !payment_method) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    await db.query(
      `UPDATE saved_payments SET card_holder = ?, card_number = ?, payment_method = ? 
       WHERE id = ? AND user_id = ?`,
      [card_holder, card_number, payment_method, id, req.user.id]
    );

    const last_four = card_number.slice(-4);
    res.json({
      id,
      card_holder,
      last_four,
      payment_method,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE saved payment method
app.delete('/api/user/payments/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(
      'DELETE FROM saved_payments WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    res.json({ message: 'Payment method deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT set default payment method
app.put('/api/user/payments/:id/default', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(
      'UPDATE saved_payments SET is_default = 0 WHERE user_id = ?',
      [req.user.id]
    );

    await db.query(
      'UPDATE saved_payments SET is_default = 1 WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({ message: 'Default payment method updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Wishlist ─────────────────────────────────────────────────────────────

// GET user's wishlist with product details
app.get('/api/user/wishlist', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.* FROM products p
       INNER JOIN wishlist w ON p.id = w.product_id
       WHERE w.user_id = ? 
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add product to wishlist
app.post('/api/user/wishlist', authMiddleware, async (req, res) => {
  const { product_id } = req.body;

  if (!product_id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    const wishlistId = uuidv4();
    
    // Check if product exists
    const [productRows] = await db.query(
      'SELECT id FROM products WHERE id = ?',
      [product_id]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Try to add to wishlist
    await db.query(
      `INSERT INTO wishlist (id, user_id, product_id) VALUES (?, ?, ?)`,
      [wishlistId, req.user.id, product_id]
    );

    res.json({ id: wishlistId, product_id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Product already in wishlist' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE remove product from wishlist
app.delete('/api/user/wishlist/:productId', authMiddleware, async (req, res) => {
  const { productId } = req.params;

  try {
    const [result] = await db.query(
      'DELETE FROM wishlist WHERE product_id = ? AND user_id = ?',
      [productId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found in wishlist' });
    }

    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET check if product is in wishlist
app.get('/api/user/wishlist/check/:productId', authMiddleware, async (req, res) => {
  const { productId } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT id FROM wishlist WHERE product_id = ? AND user_id = ?',
      [productId, req.user.id]
    );

    res.json({ inWishlist: rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(3001, () => {
  console.log('✅ API server running at http://localhost:3001');
});
