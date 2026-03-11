-- Seed data for Smart Basket products
-- Using real food image URLs from free image sources

-- Clear existing products
DELETE FROM products;

-- Insert products with real food images
INSERT INTO products (name, category, price, stock, image_url, rating, description) VALUES

-- Fruits & Vegetables
('Fresh Tomatoes', 'Fruits & Vegetables', 45, 50, 
  'https://images.unsplash.com/photo-1592924357228-3aa7e4b05911?w=500&h=500&fit=crop', 
  4.5, 'Fresh, ripe tomatoes perfect for salads and cooking'),

('Organic Bananas', 'Fruits & Vegetables', 60, 40,
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&h=500&fit=crop',
  4.7, 'Golden ripe bananas rich in potassium'),

('Green Lettuce', 'Fruits & Vegetables', 30, 35,
  'https://images.unsplash.com/photo-1622488460045-eea13ee57dba?w=500&h=500&fit=crop',
  4.4, 'Crisp green lettuce for fresh salads'),

('Red Bell Peppers', 'Fruits & Vegetables', 55, 30,
  'https://images.unsplash.com/photo-1599599810694-b5ac4dd64b73?w=500&h=500&fit=crop',
  4.6, 'Sweet and colorful bell peppers'),

('Carrots Bundle', 'Fruits & Vegetables', 40, 45,
  'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500&h=500&fit=crop',
  4.5, 'Fresh orange carrots loaded with vitamins'),

('Broccoli', 'Fruits & Vegetables', 75, 25,
  'https://images.unsplash.com/photo-1537097304980-a6b94cb53375?w=500&h=500&fit=crop',
  4.6, 'Healthy green broccoli florets'),

('Apples (6pc)', 'Fruits & Vegetables', 120, 50,
  'https://images.unsplash.com/photo-1560806e614c9efb8c7715336675b632?w=500&h=500&fit=crop',
  4.8, 'Crisp and sweet red apples'),

-- Dairy & Eggs
('Fresh Milk (1L)', 'Dairy & Eggs', 50, 80,
  'https://images.unsplash.com/photo-1585707860893-dcb8d0f6efdd?w=500&h=500&fit=crop',
  4.6, 'Pure fresh cow milk, delivered daily'),

('Cheddar Cheese', 'Dairy & Eggs', 280, 20,
  'https://images.unsplash.com/photo-1589985643862-17fef6c41e90?w=500&h=500&fit=crop',
  4.7, 'Aged cheddar cheese block'),

('Eggs (12)', 'Dairy & Eggs', 65, 60,
  'https://images.unsplash.com/photo-1582722872544-26f5f24db6d0?w=500&h=500&fit=crop',
  4.8, 'Fresh farm eggs, 12 pieces per pack'),

('Yogurt (500ml)', 'Dairy & Eggs', 85, 40,
  'https://images.unsplash.com/photo-1488527345591-e1b5c35d372c?w=500&h=500&fit=crop',
  4.5, 'Creamy natural yogurt with live cultures'),

('Butter (200g)', 'Dairy & Eggs', 120, 35,
  'https://images.unsplash.com/photo-1589985643862-17fef6c41e90?w=500&h=500&fit=crop',
  4.7, 'Unsalted premium butter'),

-- Bakery
('Whole Wheat Bread', 'Bakery', 40, 50,
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&h=500&fit=crop',
  4.6, 'Fresh baked whole wheat bread'),

('Croissants (4pc)', 'Bakery', 120, 30,
  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&h=500&fit=crop',
  4.7, 'Buttery French croissants'),

('Chocolate Brownies', 'Bakery', 150, 25,
  'https://images.unsplash.com/photo-1607920591413-264ec2aac4e0?w=500&h=500&fit=crop',
  4.8, 'Decadent chocolate brownies (4 pieces)'),

('Multigrain Bread', 'Bakery', 45, 40,
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop',
  4.5, 'Nutritious multigrain bread loaf'),

('Pastries Mix', 'Bakery', 200, 20,
  'https://images.unsplash.com/photo-1551632786-de10babe1910?w=500&h=500&fit=crop',
  4.6, 'Assorted freshly baked pastries'),

-- Beverages
('Orange Juice (1L)', 'Beverages', 80, 45,
  'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&h=500&fit=crop',
  4.7, 'Fresh pressed orange juice'),

('Green Tea (25 bags)', 'Beverages', 120, 35,
  'https://images.unsplash.com/photo-1597318130431-5c9b0f4531e8?w=500&h=500&fit=crop',
  4.6, 'Organic green tea bags'),

('Coffee Beans (500g)', 'Beverages', 350, 25,
  'https://images.unsplash.com/photo-1559056169-641ef11885ce?w=500&h=500&fit=crop',
  4.8, 'Premium arabica coffee beans'),

('Almond Milk (1L)', 'Beverages', 90, 40,
  'https://images.unsplash.com/photo-1599599810694-b5ac4dd64b73?w=500&h=500&fit=crop',
  4.5, 'Unsweetened almond milk'),

('Sparkling Water (6pk)', 'Beverages', 180, 30,
  'https://images.unsplash.com/photo-1553531088-f352953c61d8?w=500&h=500&fit=crop',
  4.4, 'Natural sparkling mineral water'),

-- Snacks
('Mixed Nuts (250g)', 'Snacks', 280, 30,
  'https://images.unsplash.com/photo-1585707860893-dcb8d0f6efdd?w=500&h=500&fit=crop',
  4.7, 'Roasted mixed nuts and dry fruits'),

('Chips Pack (100g)', 'Snacks', 50, 60,
  'https://images.unsplash.com/photo-1583202543412-ccb32e7b3b5d?w=500&h=500&fit=crop',
  4.4, 'Crispy and tasty potato chips'),

('Dark Chocolate Bar', 'Snacks', 80, 50,
  'https://images.unsplash.com/photo-1599599810694-b5ac4dd64b73?w=500&h=500&fit=crop',
  4.8, '70% dark chocolate bar'),

('Granola (400g)', 'Snacks', 220, 25,
  'https://images.unsplash.com/photo-1594521033221-3454efcf69bd?w=500&h=500&fit=crop',
  4.6, 'Organic honey granola with nuts'),

('Protein Bars (6pc)', 'Snacks', 180, 35,
  'https://images.unsplash.com/photo-1585329249908-7f5a9c9e4c0a?w=500&h=500&fit=crop',
  4.5, 'High protein energy bars'),

-- Staples
('Rice (5kg)', 'Staples', 250, 50,
  'https://images.unsplash.com/photo-1586190251891-2a5dd5a9f7ee?w=500&h=500&fit=crop',
  4.7, 'Pure premium basmati rice'),

('Lentils (1kg)', 'Staples', 120, 40,
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&h=500&fit=crop',
  4.6, 'High protein red lentils'),

('Olive Oil (500ml)', 'Staples', 450, 20,
  'https://images.unsplash.com/photo-1552353949-bebff9260b97?w=500&h=500&fit=crop',
  4.8, 'Extra virgin olive oil'),

('Sugar (1kg)', 'Staples', 40, 80,
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=500&fit=crop',
  4.5, 'Refined white sugar'),

('Salt (500g)', 'Staples', 20, 100,
  'https://images.unsplash.com/photo-1596098325095-fa3c9f4fe6cb?w=500&h=500&fit=crop',
  4.6, 'Sea salt for cooking'),

('Pasta (500g)', 'Staples', 60, 45,
  'https://images.unsplash.com/photo-1586190251891-2a5dd5a9f7ee?w=500&h=500&fit=crop',
  4.5, 'Italian durum wheat pasta');
