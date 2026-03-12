import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path
const dbPath = path.join(__dirname, 'db', 'smart_cart.db');

// Create/open database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database:', dbPath);

  // Run migrations
  runMigrations();
});

async function runMigrations() {
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Products table
    `CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT,
      image_url TEXT,
      stock_quantity INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Orders table
    `CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      pincode TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )`,

    // Order items table
    `CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )`,

    // Saved addresses table
    `CREATE TABLE IF NOT EXISTS saved_addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      pincode TEXT NOT NULL,
      is_default BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // Saved payments table
    `CREATE TABLE IF NOT EXISTS saved_payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      card_holder TEXT NOT NULL,
      card_number TEXT NOT NULL,
      payment_method TEXT DEFAULT 'credit_card',
      is_default BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // Wishlist table
    `CREATE TABLE IF NOT EXISTS wishlist (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id)
    )`,

    // Test table (keeping it from before)
    `CREATE TABLE IF NOT EXISTS test (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user TEXT NOT NULL
    )`
  ];

  // Execute each table creation
  for (const sql of tables) {
    await new Promise((resolve, reject) => {
      db.run(sql, (err) => {
        if (err) {
          console.error('Error creating table:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Create indexes for better performance
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number)',
    'CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)',
    'CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)',
    'CREATE INDEX IF NOT EXISTS idx_saved_addresses_user_id ON saved_addresses(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_saved_payments_user_id ON saved_payments(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id)'
  ];

  for (const sql of indexes) {
    await new Promise((resolve, reject) => {
      db.run(sql, (err) => {
        if (err) {
          console.error('Error creating index:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  console.log('✅ All tables created successfully');
  console.log('✅ All indexes created successfully');
  console.log('\nTables created:');
  console.log('  - users');
  console.log('  - products');
  console.log('  - orders');
  console.log('  - order_items');
  console.log('  - saved_addresses');
  console.log('  - saved_payments');
  console.log('  - wishlist');
  console.log('  - test');

  // Close database
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
      process.exit(1);
    } else {
      console.log('\n✅ Database migration completed successfully');
      process.exit(0);
    }
  });
}
