import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'db', 'smart_cart.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

console.log('✅ Starting complete database setup...\n');

// Sample user data
const sampleUsers = [
  {
    email: 'john@example.com',
    password: 'password123',
  },
  {
    email: 'priya@example.com',
    password: 'secure456',
  },
  {
    email: 'amit@example.com',
    password: 'mypass789',
  },
];

// Add sample users
console.log('📝 Adding sample users...');
const userInsert = db.prepare('INSERT INTO users (id, email, password) VALUES (?, ?, ?)');

const userIds = [];
for (const user of sampleUsers) {
  const userId = uuidv4();
  const hashedPassword = bcrypt.hashSync(user.password, 10);
  userInsert.run(userId, user.email, hashedPassword);
  userIds.push(userId);
  console.log(`  ✓ ${user.email}`);
}

// Add sample addresses for first user
console.log('\n📍 Adding sample addresses...');
const addressInsert = db.prepare(
  'INSERT INTO saved_addresses (id, user_id, name, phone, address, pincode, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)'
);

const addresses = [
  {
    name: 'Home',
    phone: '9876543210',
    address: '123 Main Street, Apartment 4B, New Delhi',
    pincode: '110001',
    is_default: 1,
  },
  {
    name: 'Office',
    phone: '9876543210',
    address: '456 Business Park, Sector 18, Noida',
    pincode: '201301',
    is_default: 0,
  },
];

for (const addr of addresses) {
  addressInsert.run(
    uuidv4(),
    userIds[0],
    addr.name,
    addr.phone,
    addr.address,
    addr.pincode,
    addr.is_default
  );
  console.log(`  ✓ ${addr.name} - ${addr.address}`);
}

// Add sample payment methods
console.log('\n💳 Adding sample payment methods...');
const paymentInsert = db.prepare(
  'INSERT INTO saved_payments (id, user_id, card_holder, card_number, payment_method, is_default) VALUES (?, ?, ?, ?, ?, ?)'
);

const payments = [
  {
    card_holder: 'JOHN SMITH',
    card_number: '4532123456789012',
    payment_method: 'credit_card',
    is_default: 1,
  },
  {
    card_holder: 'JOHN SMITH',
    card_number: '5425123456789456',
    payment_method: 'debit_card',
    is_default: 0,
  },
];

for (const payment of payments) {
  paymentInsert.run(
    uuidv4(),
    userIds[0],
    payment.card_holder,
    payment.card_number,
    payment.payment_method,
    payment.is_default
  );
  console.log(`  ✓ ${payment.card_holder} - ${payment.payment_method}`);
}

// Get some products for sample orders
console.log('\n📦 Creating sample orders...');
const products = db.prepare('SELECT id, price FROM products LIMIT 10').all();

if (products.length > 0) {
  const orderInsert = db.prepare(
    `INSERT INTO orders (id, order_number, user_id, customer_name, customer_phone, delivery_address, pincode, total_amount, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const orderItemInsert = db.prepare(
    'INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)'
  );

  // Create 2 sample orders
  for (let i = 0; i < 2; i++) {
    const orderId = uuidv4();
    const orderNumber = `ORD${Date.now()}${i}`;
    const totalAmount = products.reduce((sum, p) => sum + p.price, 0);

    orderInsert.run(
      orderId,
      orderNumber,
      userIds[0],
      'John Smith',
      '9876543210',
      '123 Main Street, New Delhi',
      '110001',
      totalAmount,
      'delivered'
    );

    // Add order items
    for (const product of products.slice(0, 3)) {
      orderItemInsert.run(
        uuidv4(),
        orderId,
        product.id,
        1,
        product.price
      );
    }

    console.log(`  ✓ Order ${orderNumber} - ₹${totalAmount}`);
  }
}

// Display complete database schema summary
console.log('\n📊 Database Schema Summary:\n');

const tables = [
  'users',
  'products',
  'orders',
  'order_items',
  'saved_addresses',
  'saved_payments',
  'wishlist',
  'test',
];

for (const table of tables) {
  const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get().count;
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  console.log(`✓ ${table.toUpperCase()}`);
  console.log(`  Records: ${count}`);
  console.log(`  Columns: ${columns.map((c) => c.name).join(', ')}`);
  console.log();
}

db.close();
console.log('✅ Complete database setup finished successfully!\n');
process.exit(0);
