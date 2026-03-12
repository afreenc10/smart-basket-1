import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'db', 'smart_cart.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

console.log('✅ Starting product seeding with images...\n');

// Get category IDs
const categories = db.prepare('SELECT id, name FROM categories').all();
const categoryMap = {};
categories.forEach((cat) => {
  categoryMap[cat.name] = cat.id;
});

// Products with proper image URLs (using Unsplash API and placeholder services)
const products = [
  // ─── FRUITS ───────────────────────────────────────
  {
    name: 'Fresh Apples (Himalayan)',
    description: 'Crisp and sweet Himalayan apples, rich in antioxidants',
    price: 150,
    category: 'Fruits',
    image_url: 'https://images.unsplash.com/photo-1560806887-1295766dd32c?w=400&h=300&fit=crop',
    stock_quantity: 50,
  },
  {
    name: 'Bananas - Premium',
    description: 'Golden ripe bananas, perfect source of potassium and energy',
    price: 45,
    category: 'Fruits',
    image_url: 'https://images.unsplash.com/photo-1603073163537-7e3f65b9cf68?w=400&h=300&fit=crop',
    stock_quantity: 80,
  },
  {
    name: 'Fresh Oranges',
    description: 'Juicy oranges loaded with vitamin C for immunity',
    price: 120,
    category: 'Fruits',
    image_url: 'https://images.unsplash.com/photo-1612528443702-f6741f70a049?w=400&h=300&fit=crop',
    stock_quantity: 60,
  },
  {
    name: 'Grapes - Black Seedless',
    description: 'Sweet black seedless grapes, perfect for snacking',
    price: 180,
    category: 'Fruits',
    image_url: 'https://images.unsplash.com/photo-1585036781584-38325a760b8d?w=400&h=300&fit=crop',
    stock_quantity: 40,
  },
  {
    name: 'Mangoes - Alphonso',
    description: 'King of fruits - sweet and aromatic Alphonso mangoes',
    price: 200,
    category: 'Fruits',
    image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop',
    stock_quantity: 35,
  },
  {
    name: 'Watermelon - Fresh',
    description: 'Refreshing watermelon, 80% water content, perfect for summer',
    price: 80,
    category: 'Fruits',
    image_url: 'https://images.unsplash.com/photo-1599599810694-b3e63ca8c0d0?w=400&h=300&fit=crop&q=60&ixlib=rb-4.0.3',
    stock_quantity: 25,
  },

  // ─── VEGETABLES ───────────────────────────────────
  {
    name: 'Tomatoes - Fresh',
    description: 'Ripe, juicy tomatoes perfect for salads and cooking',
    price: 35,
    category: 'Vegetables',
    image_url: 'https://images.unsplash.com/photo-1592841494921-cc0b7fe55fcd?w=400&h=300&fit=crop',
    stock_quantity: 100,
  },
  {
    name: 'Carrots - Farm Fresh',
    description: 'Orange carrots rich in beta-carotene and nutrients',
    price: 40,
    category: 'Vegetables',
    image_url: 'https://images.unsplash.com/photo-1585107614326-a90da3b8f4f4?w=400&h=300&fit=crop',
    stock_quantity: 90,
  },
  {
    name: 'Spinach - Organic',
    description: 'Fresh organic spinach, excellent source of iron',
    price: 50,
    category: 'Vegetables',
    image_url: 'https://images.unsplash.com/photo-1511689915661-ef2e4a0a2e84?w=400&h=300&fit=crop',
    stock_quantity: 60,
  },
  {
    name: 'Broccoli - Fresh',
    description: 'Green broccoli florets, packed with vitamin C and fiber',
    price: 60,
    category: 'Vegetables',
    image_url: 'https://images.unsplash.com/photo-1591614143001-d79cf3a983f3?w=400&h=300&fit=crop',
    stock_quantity: 45,
  },
  {
    name: 'Capsicum - Bell Peppers',
    description: 'Colorful capsicums in red, yellow, and green',
    price: 75,
    category: 'Vegetables',
    image_url: 'https://images.unsplash.com/photo-1599926078925-2661e6f5c8a6?w=400&h=300&fit=crop',
    stock_quantity: 55,
  },
  {
    name: 'Onions - Red',
    description: 'Fresh red onions for cooking and salads',
    price: 30,
    category: 'Vegetables',
    image_url: 'https://images.unsplash.com/photo-1620246784302-32cc0d8d8b7c?w=400&h=300&fit=crop',
    stock_quantity: 120,
  },

  // ─── DAIRY ────────────────────────────────────────
  {
    name: 'Milk - Full Cream (1L)',
    description: 'Fresh full cream milk, pasteurized and homogenized',
    price: 65,
    category: 'Dairy',
    image_url: 'https://images.unsplash.com/photo-1550583724-b2692b25a968?w=400&h=300&fit=crop',
    stock_quantity: 150,
  },
  {
    name: 'Yogurt - Natural',
    description: 'Creamy natural yogurt with live cultures, 500g',
    price: 45,
    category: 'Dairy',
    image_url: 'https://images.unsplash.com/photo-1488477181946-6b0a75f743ae?w=400&h=300&fit=crop',
    stock_quantity: 80,
  },
  {
    name: 'Cheese - Mozzarella',
    description: 'Mozzarella cheese for pizzas and cooking, 200g',
    price: 120,
    category: 'Dairy',
    image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop',
    stock_quantity: 40,
  },
  {
    name: 'Butter - Premium',
    description: 'Pure butter made from fresh milk, 200g',
    price: 85,
    category: 'Dairy',
    image_url: 'https://images.unsplash.com/photo-1532634726-c92a12dd0cfa?w=400&h=300&fit=crop',
    stock_quantity: 60,
  },
  {
    name: 'Paneer - Fresh',
    description: 'Fresh cottage cheese (paneer), 200g packet',
    price: 95,
    category: 'Dairy',
    image_url: 'https://images.unsplash.com/photo-1589985643862-69a1b65c98e7?w=400&h=300&fit=crop',
    stock_quantity: 70,
  },
  {
    name: 'Curd - Set (500ml)',
    description: 'Thick and creamy set curd, fresh and nutritious',
    price: 35,
    category: 'Dairy',
    image_url: 'https://images.unsplash.com/photo-1488477181946-6b0a75f743ae?w=400&h=300&fit=crop',
    stock_quantity: 100,
  },

  // ─── SNACKS ───────────────────────────────────────
  {
    name: 'Potato Chips - Salted',
    description: 'Crispy potato chips with light salting, 100g',
    price: 30,
    category: 'Snacks',
    image_url: 'https://images.unsplash.com/photo-1566478989037-c272e501a6dc?w=400&h=300&fit=crop',
    stock_quantity: 120,
  },
  {
    name: 'Namkeen Mix - Spicy',
    description: 'Traditional Indian spicy namkeen snack mix, 200g',
    price: 50,
    category: 'Snacks',
    image_url: 'https://images.unsplash.com/photo-1585239852359-640dba8dff91?w=400&h=300&fit=crop',
    stock_quantity: 90,
  },
  {
    name: 'Peanuts - Roasted & Salted',
    description: 'Crunchy roasted peanuts, healthy protein snack, 150g',
    price: 45,
    category: 'Snacks',
    image_url: 'https://images.unsplash.com/photo-1599599810694-b3e63ca8c0d0?w=400&h=300&fit=crop&q=60&ixlib=rb-4.0.3',
    stock_quantity: 75,
  },
  {
    name: 'Cookies - Chocolate Chip',
    description: 'Delicious chocolate chip cookies, 200g pack',
    price: 75,
    category: 'Snacks',
    image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop',
    stock_quantity: 60,
  },
  {
    name: 'Biscuits - Digestive',
    description: 'Healthy digestive biscuits, 300g pack',
    price: 60,
    category: 'Snacks',
    image_url: 'https://images.unsplash.com/photo-1599599810694-b3e63ca8c0d0?w=400&h=300&fit=crop&q=60&ixlib=rb-4.0.3',
    stock_quantity: 85,
  },
  {
    name: 'Popcorn - Caramel',
    description: 'Sweet caramel flavored popcorn, 100g',
    price: 55,
    category: 'Snacks',
    image_url: 'https://images.unsplash.com/photo-1585239852359-640dba8dff91?w=400&h=300&fit=crop',
    stock_quantity: 50,
  },

  // ─── BEVERAGES ────────────────────────────────────
  {
    name: 'Orange Juice - Fresh',
    description: 'Fresh squeezed orange juice, 1L carton',
    price: 85,
    category: 'Beverages',
    image_url: 'https://unsplash.com/photos/fresh-detox-juice-from-fruit-in-glass-bottles-on-a-kitchen-counter-r5qwql_km04?w=400&h=300&fit=crop',
    stock_quantity: 70,
  },
  {
    name: 'Apple Juice - Premium',
    description: 'Premium apple juice with no added sugar, 1L',
    price: 95,
    category: 'Beverages',
    image_url: 'https://images.unsplash.com/photo-1600271886742-f049cd1dcb47?w=400&h=300&fit=crop',
    stock_quantity: 65,
  },
  {
    name: 'Mango Juice - Natural',
    description: 'Natural mango juice concentrate, 750ml',
    price: 70,
    category: 'Beverages',
    image_url: 'https://images.unsplash.com/photo-1600271886742-f049cd1dcb47?w=400&h=300&fit=crop',
    stock_quantity: 60,
  },
  {
    name: 'Iced Tea - Lemon',
    description: 'Refreshing lemon iced tea, 1L bottle',
    price: 50,
    category: 'Beverages',
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    stock_quantity: 80,
  },
  {
    name: 'Coffee - Ground',
    description: 'Premium ground coffee beans, 200g pack',
    price: 120,
    category: 'Beverages',
    image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=400&h=300&fit=crop',
    stock_quantity: 55,
  },
  {
    name: 'Tea - Assam Chai',
    description: 'Premium Assam black tea loose leaves, 100g',
    price: 90,
    category: 'Beverages',
    image_url: 'https://images.unsplash.com/photo-1597318086315-cfee158be657?w=400&h=300&fit=crop',
    stock_quantity: 70,
  },
];

// Insert products
console.log('📦 Seeding products by category...\n');

const productInsert = db.prepare(
  'INSERT INTO products (id, name, description, price, category_id, image_url, stock_quantity) VALUES (?, ?, ?, ?, ?, ?, ?)'
);

let insertedCount = 0;
let categoryStats = {};

for (const product of products) {
  try {
    const categoryId = categoryMap[product.category];
    if (!categoryId) {
      console.error(`❌ Category not found: ${product.category}`);
      continue;
    }

    productInsert.run(
      uuidv4(),
      product.name,
      product.description,
      product.price,
      categoryId,
      product.image_url,
      product.stock_quantity
    );

    if (!categoryStats[product.category]) {
      categoryStats[product.category] = 0;
    }
    categoryStats[product.category]++;
    insertedCount++;
  } catch (err) {
    console.error(`❌ Error inserting ${product.name}:`, err.message);
  }
}

console.log(`✅ Successfully seeded ${insertedCount} products!\n`);

// Display summary
console.log('📊 Products by Category:\n');
Object.keys(categoryStats).forEach((cat) => {
  console.log(`  ${cat}: ${categoryStats[cat]} products`);
});

// Verify data
const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
const categoryDetails = db
  .prepare(
    `SELECT c.name, c.icon, COUNT(p.id) as product_count, 
            MIN(p.price) as min_price, MAX(p.price) as max_price,
            SUM(p.stock_quantity) as total_stock
     FROM categories c
     LEFT JOIN products p ON c.id = p.category_id
     GROUP BY c.id
     ORDER BY c.name`
  )
  .all();

console.log('\n📋 Category Details:\n');
console.table(categoryDetails);

db.close();
console.log('\n✅ Product seeding completed with images!\n');
process.exit(0);
