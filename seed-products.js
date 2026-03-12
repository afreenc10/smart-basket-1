import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path
const dbPath = path.join(__dirname, 'db', 'smart_cart.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

console.log('✅ Connected to SQLite database');

// Dummy products with Indian pricing (in INR)
const products = [
  // ─── FRUITS ───────────────────────────────────────
  {
    name: 'Fresh Apples (Himalayan)',
    description: 'Crisp and sweet Himalayan apples, rich in antioxidants',
    price: 150,
    category: 'Fruits',
    image_url: 'https://via.placeholder.com/300x200?text=Apples',
    stock_quantity: 50,
  },
  {
    name: 'Bananas - Premium',
    description: 'Golden ripe bananas, perfect source of potassium and energy',
    price: 45,
    category: 'Fruits',
    image_url: 'https://via.placeholder.com/300x200?text=Bananas',
    stock_quantity: 80,
  },
  {
    name: 'Fresh Oranges',
    description: 'Juicy oranges loaded with vitamin C for immunity',
    price: 120,
    category: 'Fruits',
    image_url: 'https://via.placeholder.com/300x200?text=Oranges',
    stock_quantity: 60,
  },
  {
    name: 'Grapes - Black Seedless',
    description: 'Sweet black seedless grapes, perfect for snacking',
    price: 180,
    category: 'Fruits',
    image_url: 'https://via.placeholder.com/300x200?text=Grapes',
    stock_quantity: 40,
  },
  {
    name: 'Mangoes - Alphonso',
    description: 'King of fruits - sweet and aromatic Alphonso mangoes',
    price: 200,
    category: 'Fruits',
    image_url: 'https://via.placeholder.com/300x200?text=Mangoes',
    stock_quantity: 35,
  },
  {
    name: 'Watermelon - Fresh',
    description: 'Refreshing watermelon, 80% water content, perfect for summer',
    price: 80,
    category: 'Fruits',
    image_url: 'https://via.placeholder.com/300x200?text=Watermelon',
    stock_quantity: 25,
  },

  // ─── VEGETABLES ───────────────────────────────────
  {
    name: 'Tomatoes - Fresh',
    description: 'Ripe, juicy tomatoes perfect for salads and cooking',
    price: 35,
    category: 'Vegetables',
    image_url: 'https://via.placeholder.com/300x200?text=Tomatoes',
    stock_quantity: 100,
  },
  {
    name: 'Carrots - Farm Fresh',
    description: 'Orange carrots rich in beta-carotene and nutrients',
    price: 40,
    category: 'Vegetables',
    image_url: 'https://via.placeholder.com/300x200?text=Carrots',
    stock_quantity: 90,
  },
  {
    name: 'Spinach - Organic',
    description: 'Fresh organic spinach, excellent source of iron',
    price: 50,
    category: 'Vegetables',
    image_url: 'https://via.placeholder.com/300x200?text=Spinach',
    stock_quantity: 60,
  },
  {
    name: 'Broccoli - Fresh',
    description: 'Green broccoli florets, packed with vitamin C and fiber',
    price: 60,
    category: 'Vegetables',
    image_url: 'https://via.placeholder.com/300x200?text=Broccoli',
    stock_quantity: 45,
  },
  {
    name: 'Capsicum - Bell Peppers',
    description: 'Colorful capsicums in red, yellow, and green',
    price: 75,
    category: 'Vegetables',
    image_url: 'https://via.placeholder.com/300x200?text=Capsicum',
    stock_quantity: 55,
  },
  {
    name: 'Onions - Red',
    description: 'Fresh red onions for cooking and salads',
    price: 30,
    category: 'Vegetables',
    image_url: 'https://via.placeholder.com/300x200?text=Onions',
    stock_quantity: 120,
  },

  // ─── DAIRY ────────────────────────────────────────
  {
    name: 'Milk - Full Cream (1L)',
    description: 'Fresh full cream milk, pasteurized and homogenized',
    price: 65,
    category: 'Dairy',
    image_url: 'https://via.placeholder.com/300x200?text=Milk',
    stock_quantity: 150,
  },
  {
    name: 'Yogurt - Natural',
    description: 'Creamy natural yogurt with live cultures, 500g',
    price: 45,
    category: 'Dairy',
    image_url: 'https://via.placeholder.com/300x200?text=Yogurt',
    stock_quantity: 80,
  },
  {
    name: 'Cheese - Mozzarella',
    description: 'Mozzarella cheese for pizzas and cooking, 200g',
    price: 120,
    category: 'Dairy',
    image_url: 'https://via.placeholder.com/300x200?text=Cheese',
    stock_quantity: 40,
  },
  {
    name: 'Butter - Premium',
    description: 'Pure butter made from fresh milk, 200g',
    price: 85,
    category: 'Dairy',
    image_url: 'https://via.placeholder.com/300x200?text=Butter',
    stock_quantity: 60,
  },
  {
    name: 'Paneer - Fresh',
    description: 'Fresh cottage cheese (paneer), 200g packet',
    price: 95,
    category: 'Dairy',
    image_url: 'https://via.placeholder.com/300x200?text=Paneer',
    stock_quantity: 70,
  },
  {
    name: 'Curd - Set (500ml)',
    description: 'Thick and creamy set curd, fresh and nutritious',
    price: 35,
    category: 'Dairy',
    image_url: 'https://via.placeholder.com/300x200?text=Curd',
    stock_quantity: 100,
  },

  // ─── SNACKS ───────────────────────────────────────
  {
    name: 'Potato Chips - Salted',
    description: 'Crispy potato chips with light salting, 100g',
    price: 30,
    category: 'Snacks',
    image_url: 'https://via.placeholder.com/300x200?text=Chips',
    stock_quantity: 120,
  },
  {
    name: 'Namkeen Mix - Spicy',
    description: 'Traditional Indian spicy namkeen snack mix, 200g',
    price: 50,
    category: 'Snacks',
    image_url: 'https://via.placeholder.com/300x200?text=Namkeen',
    stock_quantity: 90,
  },
  {
    name: 'Peanuts - Roasted & Salted',
    description: 'Crunchy roasted peanuts, healthy protein snack, 150g',
    price: 45,
    category: 'Snacks',
    image_url: 'https://via.placeholder.com/300x200?text=Peanuts',
    stock_quantity: 75,
  },
  {
    name: 'Cookies - Chocolate Chip',
    description: 'Delicious chocolate chip cookies, 200g pack',
    price: 75,
    category: 'Snacks',
    image_url: 'https://via.placeholder.com/300x200?text=Cookies',
    stock_quantity: 60,
  },
  {
    name: 'Biscuits - Digestive',
    description: 'Healthy digestive biscuits, 300g pack',
    price: 60,
    category: 'Snacks',
    image_url: 'https://via.placeholder.com/300x200?text=Biscuits',
    stock_quantity: 85,
  },
  {
    name: 'Popcorn - Caramel',
    description: 'Sweet caramel flavored popcorn, 100g',
    price: 55,
    category: 'Snacks',
    image_url: 'https://via.placeholder.com/300x200?text=Popcorn',
    stock_quantity: 50,
  },

  // ─── BEVERAGES ────────────────────────────────────
  {
    name: 'Orange Juice - Fresh',
    description: 'Fresh squeezed orange juice, 1L carton',
    price: 85,
    category: 'Beverages',
    image_url: 'https://via.placeholder.com/300x200?text=OrangeJuice',
    stock_quantity: 70,
  },
  {
    name: 'Apple Juice - Premium',
    description: 'Premium apple juice with no added sugar, 1L',
    price: 95,
    category: 'Beverages',
    image_url: 'https://via.placeholder.com/300x200?text=AppleJuice',
    stock_quantity: 65,
  },
  {
    name: 'Mango Juice - Natural',
    description: 'Natural mango juice concentrate, 750ml',
    price: 70,
    category: 'Beverages',
    image_url: 'https://via.placeholder.com/300x200?text=MangoJuice',
    stock_quantity: 60,
  },
  {
    name: 'Iced Tea - Lemon',
    description: 'Refreshing lemon iced tea, 1L bottle',
    price: 50,
    category: 'Beverages',
    image_url: 'https://via.placeholder.com/300x200?text=IcedTea',
    stock_quantity: 80,
  },
  {
    name: 'Coffee - Ground',
    description: 'Premium ground coffee beans, 200g pack',
    price: 120,
    category: 'Beverages',
    image_url: 'https://via.placeholder.com/300x200?text=Coffee',
    stock_quantity: 55,
  },
  {
    name: 'Tea - Assam Chai',
    description: 'Premium Assam black tea loose leaves, 100g',
    price: 90,
    category: 'Beverages',
    image_url: 'https://via.placeholder.com/300x200?text=Tea',
    stock_quantity: 70,
  },
];

// Insert products into database
async function seedProducts() {
  try {
    // Check if products already exist
    const existingCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    
    if (existingCount > 0) {
      console.log(`⚠️  Database already has ${existingCount} products. Skipping seed to avoid duplicates.`);
      db.close();
      process.exit(0);
    }

    const insertStmt = db.prepare(`
      INSERT INTO products (id, name, description, price, category, image_url, stock_quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    let inserted = 0;
    for (const product of products) {
      try {
        insertStmt.run(
          uuidv4(),
          product.name,
          product.description,
          product.price,
          product.category,
          product.image_url,
          product.stock_quantity
        );
        inserted++;
      } catch (err) {
        console.error(`Error inserting ${product.name}:`, err.message);
      }
    }

    console.log(`\n✅ Successfully seeded ${inserted} products!\n`);
    
    // Display summary by category
    const summary = db.prepare(`
      SELECT category, COUNT(*) as count, 
             MIN(price) as min_price, 
             MAX(price) as max_price 
      FROM products 
      GROUP BY category 
      ORDER BY category
    `).all();

    console.log('📊 Products Summary by Category:\n');
    console.table(summary);
    
    db.close();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding products:', err);
    db.close();
    process.exit(1);
  }
}

seedProducts();
