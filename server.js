import express from 'express';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ─── DB Connection ────────────────────────────────────────────────────────────
const dbPath = path.join(__dirname, 'db', 'smart_cart.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_change_this';

console.log('✅ Connected to SQLite database at:', dbPath);

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
app.post('/api/auth/signup', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    
    if (existing)
      return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = uuidv4();
    
    db.prepare('INSERT INTO users (id, email, password) VALUES (?, ?, ?)')
      .run(userId, email, hashedPassword);

    const user = { id: userId, email };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SIGN IN
app.post('/api/auth/signin', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const dbUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!dbUser)
      return res.status(401).json({ error: 'Invalid email or password' });

    const isValid = bcrypt.compareSync(password, dbUser.password);
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

// ─── Products Routes ──────────────────────────────────────────────────────────

// GET all products with category info
app.get('/api/products', (req, res) => {
  try {
    const { category } = req.query;
    let query = `
      SELECT p.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM products p
      JOIN categories c ON p.category_id = c.id
    `;
    let params = [];

    if (category) {
      query += ' WHERE c.name = ?';
      params.push(category);
    }

    query += ' ORDER BY p.name';

    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = db
      .prepare(
        `SELECT c.*, COUNT(p.id) as product_count
         FROM categories c
         LEFT JOIN products p ON c.id = p.category_id
         GROUP BY c.id
         ORDER BY c.name`
      )
      .all();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET products by category with product count
app.get('/api/categories/:categoryId/products', (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = db
      .prepare(
        `SELECT p.*
         FROM products p
         WHERE p.category_id = ?
         ORDER BY p.name`
      )
      .all(categoryId);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Orders Routes ────────────────────────────────────────────────────────────

app.post('/api/orders', (req, res) => {
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
    db.prepare(
      `INSERT INTO orders 
        (id, order_number, user_id, customer_name, customer_phone, delivery_address, pincode, total_amount, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(orderId, order_number, user_id || null, customer_name, customer_phone, delivery_address, pincode, total_amount, status);

    // Insert order items
    for (const item of items) {
      db.prepare(
        `INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)`
      ).run(uuidv4(), orderId, item.product_id, item.quantity, item.price);
    }

    res.json({ id: orderId, order_number });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET orders for logged-in user
app.get('/api/orders/my-orders', authMiddleware, (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC'
    ).all(req.user.id);

    // Fetch items for each order
    const ordersWithItems = rows.map((order) => {
      const itemRows = db.prepare(
        `SELECT oi.product_id, oi.quantity, oi.price, p.name as product_name, p.image_url 
         FROM order_items oi 
         LEFT JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`
      ).all(order.id);
      order.items = itemRows;
      return order;
    });

    res.json(ordersWithItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET orders for guest (by order_numbers stored in localStorage)
app.post('/api/orders/guest', (req, res) => {
  const { order_numbers } = req.body;
  if (!order_numbers || order_numbers.length === 0)
    return res.json([]);

  try {
    const placeholders = order_numbers.map(() => '?').join(', ');
    const rows = db.prepare(
      `SELECT * FROM orders WHERE order_number IN (${placeholders}) ORDER BY created_at DESC`
    ).all(...order_numbers);

    // Fetch items for each order
    const ordersWithItems = rows.map((order) => {
      const itemRows = db.prepare(
        `SELECT oi.product_id, oi.quantity, oi.price, p.name as product_name, p.image_url 
         FROM order_items oi 
         LEFT JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`
      ).all(order.id);
      order.items = itemRows;
      return order;
    });

    res.json(ordersWithItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Track order by order ID
app.get('/api/orders/track/:orderId', (req, res) => {
  const { orderId } = req.params;
  
  if (!orderId || !orderId.startsWith('ORD')) {
    return res.status(400).json({ error: 'Invalid order ID format' });
  }

  try {
    const order = db.prepare(
      'SELECT * FROM orders WHERE order_number = ?'
    ).get(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get order items with product images
    const itemRows = db.prepare(
      `SELECT oi.product_id, oi.quantity, oi.price, p.name as product_name, p.image_url 
       FROM order_items oi 
       LEFT JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`
    ).all(order.id);

    order.items = itemRows;
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search orders by phone number
app.post('/api/orders/search-by-phone', (req, res) => {
  const { phone } = req.body;

  if (!phone || phone.length < 10) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }

  try {
    const orderRows = db.prepare(
      'SELECT * FROM orders WHERE customer_phone LIKE ? ORDER BY created_at DESC'
    ).all(`%${phone}%`);

    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'No orders found' });
    }

    // Get items for all orders
    const ordersWithItems = orderRows.map((order) => {
      const itemRows = db.prepare(
        `SELECT oi.product_id, oi.quantity, oi.price, p.name as product_name, p.image_url 
         FROM order_items oi 
         LEFT JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`
      ).all(order.id);
      order.items = itemRows;
      return order;
    });

    res.json(ordersWithItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Saved Addresses ──────────────────────────────────────────────────────────

// GET user's saved addresses
app.get('/api/user/addresses', authMiddleware, (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT id, name, phone, address, pincode, is_default FROM saved_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC'
    ).all(req.user.id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new saved address
app.post('/api/user/addresses', authMiddleware, (req, res) => {
  const { name, phone, address, pincode } = req.body;

  if (!name || !phone || !address || !pincode) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existing = db.prepare(
      'SELECT id FROM saved_addresses WHERE user_id = ?'
    ).get(req.user.id);

    const is_default = existing ? 0 : 1;
    const addressId = uuidv4();

    db.prepare(
      `INSERT INTO saved_addresses (id, user_id, name, phone, address, pincode, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(addressId, req.user.id, name, phone, address, pincode, is_default);

    res.json({ id: addressId, name, phone, address, pincode, is_default });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update saved address
app.put('/api/user/addresses/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { name, phone, address, pincode } = req.body;

  if (!name || !phone || !address || !pincode) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    db.prepare(
      `UPDATE saved_addresses SET name = ?, phone = ?, address = ?, pincode = ? 
       WHERE id = ? AND user_id = ?`
    ).run(name, phone, address, pincode, id, req.user.id);
    res.json({ id, name, phone, address, pincode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE saved address
app.delete('/api/user/addresses/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  try {
    db.prepare(
      'DELETE FROM saved_addresses WHERE id = ? AND user_id = ?'
    ).run(id, req.user.id);
    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT set default address
app.put('/api/user/addresses/:id/default', authMiddleware, (req, res) => {
  const { id } = req.params;

  try {
    db.prepare(
      'UPDATE saved_addresses SET is_default = 0 WHERE user_id = ?'
    ).run(req.user.id);

    db.prepare(
      'UPDATE saved_addresses SET is_default = 1 WHERE id = ? AND user_id = ?'
    ).run(id, req.user.id);

    res.json({ message: 'Default address updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Saved Payment Methods ────────────────────────────────────────────────────

// GET user's saved payment methods
app.get('/api/user/payments', authMiddleware, (req, res) => {
  try {
    const rows = db.prepare(
      `SELECT id, card_holder, 
              ('****-****-****-' || SUBSTR(card_number, -4)) as last_four, 
              payment_method, is_default FROM saved_payments WHERE user_id = ? 
       ORDER BY is_default DESC, created_at DESC`
    ).all(req.user.id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new saved payment method
app.post('/api/user/payments', authMiddleware, (req, res) => {
  const { card_holder, card_number, payment_method } = req.body;

  if (!card_holder || !card_number || !payment_method) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existing = db.prepare(
      'SELECT id FROM saved_payments WHERE user_id = ?'
    ).get(req.user.id);

    const is_default = existing ? 0 : 1;
    const paymentId = uuidv4();

    db.prepare(
      `INSERT INTO saved_payments (id, user_id, card_holder, card_number, payment_method, is_default)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(paymentId, req.user.id, card_holder, card_number, payment_method, is_default);

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
app.put('/api/user/payments/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { card_holder, card_number, payment_method } = req.body;

  if (!card_holder || !card_number || !payment_method) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    db.prepare(
      `UPDATE saved_payments SET card_holder = ?, card_number = ?, payment_method = ? 
       WHERE id = ? AND user_id = ?`
    ).run(card_holder, card_number, payment_method, id, req.user.id);

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
app.delete('/api/user/payments/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  try {
    db.prepare(
      'DELETE FROM saved_payments WHERE id = ? AND user_id = ?'
    ).run(id, req.user.id);
    res.json({ message: 'Payment method deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT set default payment method
app.put('/api/user/payments/:id/default', authMiddleware, (req, res) => {
  const { id } = req.params;

  try {
    db.prepare(
      'UPDATE saved_payments SET is_default = 0 WHERE user_id = ?'
    ).run(req.user.id);

    db.prepare(
      'UPDATE saved_payments SET is_default = 1 WHERE id = ? AND user_id = ?'
    ).run(id, req.user.id);

    res.json({ message: 'Default payment method updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Wishlist ─────────────────────────────────────────────────────────────

// GET user's wishlist with product details
app.get('/api/user/wishlist', authMiddleware, (req, res) => {
  try {
    const rows = db.prepare(
      `SELECT p.* FROM products p
       INNER JOIN wishlist w ON p.id = w.product_id
       WHERE w.user_id = ? 
       ORDER BY w.created_at DESC`
    ).all(req.user.id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add product to wishlist
app.post('/api/user/wishlist', authMiddleware, (req, res) => {
  const { product_id } = req.body;

  if (!product_id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    const product = db.prepare(
      'SELECT id FROM products WHERE id = ?'
    ).get(product_id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const wishlistId = uuidv4();
    db.prepare(
      `INSERT INTO wishlist (id, user_id, product_id) VALUES (?, ?, ?)`
    ).run(wishlistId, req.user.id, product_id);

    res.json({ id: wishlistId, product_id });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Product already in wishlist' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE remove product from wishlist
app.delete('/api/user/wishlist/:productId', authMiddleware, (req, res) => {
  const { productId } = req.params;

  try {
    const result = db.prepare(
      'DELETE FROM wishlist WHERE product_id = ? AND user_id = ?'
    ).run(productId, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Item not found in wishlist' });
    }

    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET check if product is in wishlist
app.get('/api/user/wishlist/check/:productId', authMiddleware, (req, res) => {
  const { productId } = req.params;

  try {
    const row = db.prepare(
      'SELECT id FROM wishlist WHERE product_id = ? AND user_id = ?'
    ).get(productId, req.user.id);

    res.json({ inWishlist: !!row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(3001, () => {
  console.log('✅ API server running at http://localhost:3001');
});
