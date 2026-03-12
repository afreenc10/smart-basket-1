# 🛍️ Smart Cart - Complete Database Schema

## Database Migration Summary
✅ Successfully migrated from **MySQL** to **SQLite**
✅ Database location: `./db/smart_cart.db`
✅ 8 tables created with proper relationships and indexes
✅ 30 sample products added across 5 categories
✅ Sample users, addresses, payments, and orders created

---

## 📊 Database Tables

### 1. **users** (4 records)
Stores user account information
```
Columns:
- id (TEXT PRIMARY KEY) - Unique identifier
- email (TEXT UNIQUE) - Email address for login
- password (TEXT) - Hashed password (bcrypt)
- created_at (DATETIME) - Account creation timestamp
- updated_at (DATETIME) - Last update timestamp
```

**Sample Users:**
- john@example.com
- priya@example.com
- amit@example.com

---

### 2. **products** (30 records)
Complete product catalog with pricing in INR
```
Columns:
- id (TEXT PRIMARY KEY) - Product identifier
- name (TEXT) - Product name
- description (TEXT) - Product description
- price (REAL) - Price in Indian Rupees (₹)
- category (TEXT) - Product category
- image_url (TEXT) - Product image URL
- stock_quantity (INTEGER) - Available stock
- created_at (DATETIME) - Creation timestamp
- updated_at (DATETIME) - Update timestamp
```

**Categories & Product Count:**
- 🍎 **Fruits** (6 products): ₹45-₹200
  - Bananas, Apples, Oranges, Grapes, Mangoes, Watermelon
  
- 🥬 **Vegetables** (6 products): ₹30-₹75
  - Tomatoes, Carrots, Spinach, Broccoli, Capsicum, Onions
  
- 🥛 **Dairy** (6 products): ₹35-₹120
  - Milk, Yogurt, Cheese, Butter, Paneer, Curd
  
- 🍿 **Snacks** (6 products): ₹30-₹75
  - Chips, Namkeen Mix, Peanuts, Cookies, Biscuits, Popcorn
  
- ☕ **Beverages** (6 products): ₹50-₹120
  - Orange Juice, Apple Juice, Mango Juice, Iced Tea, Coffee, Tea

---

### 3. **orders** (2 records)
Customer orders and order history
```
Columns:
- id (TEXT PRIMARY KEY) - Order identifier
- order_number (TEXT UNIQUE) - Unique order number
- user_id (TEXT FK) - Reference to user
- customer_name (TEXT) - Customer name
- customer_phone (TEXT) - Contact number
- delivery_address (TEXT) - Delivery location
- pincode (TEXT) - Postal code
- total_amount (REAL) - Order total in ₹
- status (TEXT) - Order status (pending/delivered/cancelled)
- created_at (DATETIME) - Order creation time
- updated_at (DATETIME) - Last update time
```

---

### 4. **order_items** (6 records)
Individual items within orders
```
Columns:
- id (TEXT PRIMARY KEY) - Item identifier
- order_id (TEXT FK) - Reference to order
- product_id (TEXT FK) - Reference to product
- quantity (INTEGER) - Item quantity
- price (REAL) - Price per unit at purchase time
- created_at (DATETIME) - Creation timestamp
```

---

### 5. **saved_addresses** (2 records)
User's saved delivery addresses
```
Columns:
- id (TEXT PRIMARY KEY) - Address identifier
- user_id (TEXT FK) - Reference to user
- name (TEXT) - Address nickname (Home/Office/etc)
- phone (TEXT) - Contact number
- address (TEXT) - Full address
- pincode (TEXT) - Postal code
- is_default (BOOLEAN) - Mark as default address
- created_at (DATETIME) - Saved timestamp
- updated_at (DATETIME) - Update timestamp
```

**Sample Addresses:**
1. Home (Default) - New Delhi, 110001
2. Office - Noida, 201301

---

### 6. **saved_payments** (2 records)
Saved payment methods for checkout
```
Columns:
- id (TEXT PRIMARY KEY) - Payment identifier
- user_id (TEXT FK) - Reference to user
- card_holder (TEXT) - Cardholder name
- card_number (TEXT) - Encrypted card number
- payment_method (TEXT) - credit_card/debit_card/upi
- is_default (BOOLEAN) - Mark as default payment
- created_at (DATETIME) - Saved timestamp
- updated_at (DATETIME) - Update timestamp
```

**Sample Payments:**
1. JOHN SMITH - Credit Card (Default)
2. JOHN SMITH - Debit Card

---

### 7. **wishlist** (0 records)
User's wishlist items
```
Columns:
- id (TEXT PRIMARY KEY) - Wishlist item identifier
- user_id (TEXT FK) - Reference to user
- product_id (TEXT FK) - Reference to product
- created_at (DATETIME) - Added timestamp
- UNIQUE(user_id, product_id) - Prevent duplicates
```

---

### 8. **test** (0 records)
Test table for database operations
```
Columns:
- id (INTEGER PRIMARY KEY AUTOINCREMENT)
- user (TEXT)
```

---

## 💰 Price Range by Category

| Category    | Min Price | Max Price | Items |
|-------------|-----------|-----------|-------|
| Fruits     | ₹45       | ₹200      | 6     |
| Vegetables | ₹30       | ₹75       | 6     |
| Dairy      | ₹35       | ₹120      | 6     |
| Snacks     | ₹30       | ₹75       | 6     |
| Beverages  | ₹50       | ₹120      | 6     |

---

## 🔒 Database Features

✅ **Foreign Key Constraints** - Enforced referential integrity
✅ **Indexes** - Created on all frequently queried columns:
  - Users: email (unique)
  - Orders: user_id, order_number
  - Order Items: order_id, product_id
  - Addresses: user_id
  - Payments: user_id
  - Wishlist: user_id, product_id

✅ **Data Integrity** - All constraints properly configured
✅ **ACID Compliance** - SQLite3 with transaction support
✅ **Timestamps** - Automatic created_at/updated_at on all tables

---

## 🚀 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products?category=Fruits` - Filter by category

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/signout` - Logout

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/my-orders` - User's orders (auth required)
- `POST /api/orders/guest` - Guest order tracking
- `GET /api/orders/track/:orderId` - Track order by ID
- `POST /api/orders/search-by-phone` - Search by phone

### Addresses
- `GET /api/user/addresses` - Get saved addresses
- `POST /api/user/addresses` - Add new address
- `PUT /api/user/addresses/:id` - Update address
- `DELETE /api/user/addresses/:id` - Delete address
- `PUT /api/user/addresses/:id/default` - Set as default

### Payments
- `GET /api/user/payments` - Get saved payments
- `POST /api/user/payments` - Add new payment
- `PUT /api/user/payments/:id` - Update payment
- `DELETE /api/user/payments/:id` - Delete payment
- `PUT /api/user/payments/:id/default` - Set as default

### Wishlist
- `GET /api/user/wishlist` - Get wishlist items
- `POST /api/user/wishlist` - Add to wishlist
- `DELETE /api/user/wishlist/:productId` - Remove from wishlist
- `GET /api/user/wishlist/check/:productId` - Check if in wishlist

---

## 📁 Helper Scripts

### Seeding Scripts
```bash
node migrate-to-sqlite.js      # Create database schema
node seed-products.js          # Add 30 products
node seed-complete-db.js       # Add users, addresses, payments, orders
node show-db-summary.js        # Display database contents
```

---

## ✨ Sample Data Available

**Users:** 4 accounts with sample credentials
**Products:** 30 items across 5 categories
**Orders:** 2 sample orders with items
**Addresses:** 2 saved addresses (Home & Office)
**Payments:** 2 saved payment methods

All data is ready for testing the application!

---

## 🛠️ Technology Stack

- **Database:** SQLite3
- **ORM/Driver:** better-sqlite3
- **Authentication:** JWT + bcryptjs
- **Server:** Express.js
- **Backend Language:** Node.js (ES6 modules)

---

*Database setup completed on March 12, 2026*
