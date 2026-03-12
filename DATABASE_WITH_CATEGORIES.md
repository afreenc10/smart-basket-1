# 🛍️ Smart Cart - Complete Database with Categories & Images

## ✅ Latest Updates

### ✨ Recent Changes
- ✅ Added **Categories Table** - Separate table for better organization
- ✅ Added **Product Images** - Using Unsplash API for high-quality images
- ✅ **Category-wise Separation** - Products organized by 5 main categories
- ✅ New API Endpoints - `/api/categories`, `/api/products?category=Fruits`
- ✅ **Database Integrity** - Foreign keys properly configured

---

## 📊 Database Schema

### 1. **categories** TABLE
Centralized product categories with metadata
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Sample Categories:**
| Icon | Name | Description | Color |
|------|------|-------------|-------|
| 🍎 | Fruits | Fresh fruits rich in vitamins and minerals | #FF6B6B |
| 🥬 | Vegetables | Fresh vegetables and greens from farms | #51CF66 |
| 🥛 | Dairy | Milk, yogurt, cheese and dairy products | #FFD93D |
| 🍿 | Snacks | Tasty snacks and munchies | #FF922B |
| ☕ | Beverages | Juices, tea, coffee and drinks | #A78BFA |

---

### 2. **products** TABLE (Updated)
Now references categories table with image URLs
```sql
CREATE TABLE products (
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
);
```

**Product Count:** 30 products (6 per category)

---

## 🍎 FRUITS CATEGORY (6 Products)

| Name | Price (₹) | Stock | Image |
|------|-----------|-------|-------|
| Fresh Apples (Himalayan) | 150 | 50 | ✅ High-quality image |
| Bananas - Premium | 45 | 80 | ✅ High-quality image |
| Fresh Oranges | 120 | 60 | ✅ High-quality image |
| Grapes - Black Seedless | 180 | 40 | ✅ High-quality image |
| Mangoes - Alphonso | 200 | 35 | ✅ High-quality image |
| Watermelon - Fresh | 80 | 25 | ✅ High-quality image |

**Price Range:** ₹45 - ₹200

---

## 🥬 VEGETABLES CATEGORY (6 Products)

| Name | Price (₹) | Stock | Image |
|------|-----------|-------|-------|
| Onions - Red | 30 | 120 | ✅ High-quality image |
| Tomatoes - Fresh | 35 | 100 | ✅ High-quality image |
| Carrots - Farm Fresh | 40 | 90 | ✅ High-quality image |
| Spinach - Organic | 50 | 60 | ✅ High-quality image |
| Broccoli - Fresh | 60 | 45 | ✅ High-quality image |
| Capsicum - Bell Peppers | 75 | 55 | ✅ High-quality image |

**Price Range:** ₹30 - ₹75

---

## 🥛 DAIRY CATEGORY (6 Products)

| Name | Price (₹) | Stock | Image |
|------|-----------|-------|-------|
| Curd - Set (500ml) | 35 | 100 | ✅ High-quality image |
| Yogurt - Natural | 45 | 80 | ✅ High-quality image |
| Milk - Full Cream (1L) | 65 | 150 | ✅ High-quality image |
| Butter - Premium | 85 | 60 | ✅ High-quality image |
| Paneer - Fresh | 95 | 70 | ✅ High-quality image |
| Cheese - Mozzarella | 120 | 40 | ✅ High-quality image |

**Price Range:** ₹35 - ₹120

---

## 🍿 SNACKS CATEGORY (6 Products)

| Name | Price (₹) | Stock | Image |
|------|-----------|-------|-------|
| Potato Chips - Salted | 30 | 120 | ✅ High-quality image |
| Peanuts - Roasted & Salted | 45 | 75 | ✅ High-quality image |
| Namkeen Mix - Spicy | 50 | 90 | ✅ High-quality image |
| Popcorn - Caramel | 55 | 50 | ✅ High-quality image |
| Biscuits - Digestive | 60 | 85 | ✅ High-quality image |
| Cookies - Chocolate Chip | 75 | 60 | ✅ High-quality image |

**Price Range:** ₹30 - ₹75

---

## ☕ BEVERAGES CATEGORY (6 Products)

| Name | Price (₹) | Stock | Image |
|------|-----------|-------|-------|
| Iced Tea - Lemon | 50 | 80 | ✅ High-quality image |
| Mango Juice - Natural | 70 | 60 | ✅ High-quality image |
| Orange Juice - Fresh | 85 | 70 | ✅ High-quality image |
| Tea - Assam Chai | 90 | 70 | ✅ High-quality image |
| Apple Juice - Premium | 95 | 65 | ✅ High-quality image |
| Coffee - Ground | 120 | 55 | ✅ High-quality image |

**Price Range:** ₹50 - ₹120

---

## 🖼️ Image Sources

All product images are sourced from **Unsplash API** - High-quality, free images
- Each product has a unique image URL
- Images are cached and optimized (400x300px)
- Full URLs stored in `image_url` column
- Example: `https://images.unsplash.com/photo-1560806887-1295766dd32c?w=400&h=300&fit=crop`

---

## 🔌 API Endpoints

### Categories
```
GET /api/categories
```
**Response:**
```json
[
  {
    "id": "uuid...",
    "name": "Fruits",
    "description": "Fresh fruits...",
    "icon": "🍎",
    "color": "#FF6B6B",
    "product_count": 6
  }
]
```

### Products
```
GET /api/products
GET /api/products?category=Fruits
GET /api/categories/:categoryId/products
```

**Response Sample:**
```json
[
  {
    "id": "uuid...",
    "name": "Fresh Apples (Himalayan)",
    "description": "Crisp and sweet...",
    "price": 150,
    "category_id": "uuid...",
    "category_name": "Fruits",
    "category_icon": "🍎",
    "category_color": "#FF6B6B",
    "image_url": "https://images.unsplash.com/...",
    "stock_quantity": 50,
    "created_at": "2026-03-12 17:00:00"
  }
]
```

---

## 📁 Helper Scripts

### Database Seeding
```bash
# Run all migrations and seeding
node migrate-add-categories.js       # Create categories table
node seed-products-with-images.js    # Seed products with images

# Verification
node verify-products.js              # Check database contents
```

---

## 📊 Database Statistics

- **Total Products:** 30
- **Total Categories:** 5
- **Total Users:** 4
- **Total Orders:** 2
- **Images:** 30 High-quality Unsplash images

### Storage Breakdown
- **Fruits:** 6 products, ₹45-₹200
- **Vegetables:** 6 products, ₹30-₹75
- **Dairy:** 6 products, ₹35-₹120
- **Snacks:** 6 products, ₹30-₹75
- **Beverages:** 6 products, ₹50-₹120

---

## 🔒 Data Integrity Features

✅ **Foreign Key Constraints** - Enforced category relationships
✅ **Unique Categories** - Cannot have duplicate category names
✅ **Cascading Deletes** - Removing category removes products
✅ **Proper Indexing** - Performance optimization on foreign keys
✅ **Image URLs** - Full URLs stored for frontend rendering

---

## 🚀 Frontend Integration

### Display Products by Category
```js
// Fetch specific category
const response = await fetch('/api/products?category=Fruits');
const products = await response.json();

// Display with images
products.forEach(product => {
  // Use product.image_url for <img> tags
  // Use product.category_icon for category badge
  // Use product.price in INR for pricing
});
```

### Category Dropdown
```js
// Fetch all categories
const response = await fetch('/api/categories');
const categories = await response.json();

// Create filter options with icons
categories.forEach(cat => {
  // Use cat.icon for visual representation
  // Use cat.product_count for "6 items" display
});
```

---

## 📱 Responsive Design Support

- Images optimized for mobile (400x300px)
- Category icons (emoji) display beautifully on all devices
- Color scheme supports light/dark modes
- Price formatting in INR (₹) symbol

---

## 🛠️ Technology Stack

- **Database:** SQLite3
- **Driver:** better-sqlite3
- **Image Service:** Unsplash API
- **Server:** Express.js with Node.js
- **Authentication:** JWT + bcryptjs

---

## ✨ Next Steps

1. ✅ Display categories on homepage
2. ✅ Show product images in cards
3. ✅ Filter products by category
4. ✅ Add category badges with icons
5. ✅ Implement image lazy loading

---

*Database fully migrated to SQLite with centralized categories and quality images - March 12, 2026*
