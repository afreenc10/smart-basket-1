import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'db', 'smart_cart.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

console.log('✅ Starting database migration with categories...\n');

// Drop old products table if exists to recreate with category reference
try {
  db.exec('DROP TABLE IF EXISTS wishlist');
  db.exec('DROP TABLE IF EXISTS order_items');
  db.exec('DROP TABLE IF EXISTS orders');
  db.exec('DROP TABLE IF EXISTS products');
  console.log('✓ Dropped old tables');
} catch (err) {
  console.log('Note: Tables were already updated');
}

// Create categories table
console.log('\n📂 Creating categories table...');
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
console.log('✓ Categories table created');

// Create updated products table with category reference
console.log('📦 Creating updated products table...');
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category_id TEXT NOT NULL,
    image_url TEXT,
    stock_quantity INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  )
`);
console.log('✓ Products table created');

// Recreate orders and related tables
console.log('📋 Creating orders table...');
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
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
  )
`);
console.log('✓ Orders table created');

console.log('📝 Creating order_items table...');
db.exec(`
  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  )
`);
console.log('✓ Order items table created');

console.log('❤️  Creating wishlist table...');
db.exec(`
  CREATE TABLE IF NOT EXISTS wishlist (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
  )
`);
console.log('✓ Wishlist table created');

// Create indexes
console.log('\n🔍 Creating indexes...');
db.exec('CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id)');
db.exec('CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)');
db.exec('CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)');
db.exec('CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)');
db.exec('CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id)');
db.exec('CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id)');
console.log('✓ All indexes created');

// Insert categories with proper icons and colors
console.log('\n🏷️  Inserting categories...\n');

const categories = [
  {
    name: 'Fruits',
    description: 'Fresh fruits rich in vitamins and minerals',
    icon: '🍎',
    color: '#FF6B6B',
  },
  {
    name: 'Vegetables',
    description: 'Fresh vegetables and greens from farms',
    icon: '🥬',
    color: '#51CF66',
  },
  {
    name: 'Dairy',
    description: 'Milk, yogurt, cheese and dairy products',
    icon: '🥛',
    color: '#FFD93D',
  },
  {
    name: 'Snacks',
    description: 'Tasty snacks and munchies',
    icon: '🍿',
    color: '#FF922B',
  },
  {
    name: 'Beverages',
    description: 'Juices, tea, coffee and drinks',
    icon: '☕',
    color: '#A78BFA',
  },
];

const categoryInsert = db.prepare(
  'INSERT INTO categories (id, name, description, icon, color) VALUES (?, ?, ?, ?, ?)'
);

const categoryMap = {};
for (const cat of categories) {
  const catId = uuidv4();
  categoryInsert.run(catId, cat.name, cat.description, cat.icon, cat.color);
  categoryMap[cat.name] = catId;
  console.log(`  ✓ ${cat.icon} ${cat.name}`);
}

db.close();
console.log('\n✅ Migration completed successfully!');
process.exit(0);
