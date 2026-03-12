import Database from "better-sqlite3";

const db = new Database("db/smart_cart.db");

console.log("\n🖼️  Update Product Image URLs\n");

// Get all products with their current image URLs
const products = db.prepare(`
  SELECT id, name, image_url 
  FROM products 
  ORDER BY name
`).all();

console.log("📦 Current Products with Image URLs:\n");
products.forEach((p, index) => {
  const preview = p.image_url ? p.image_url.substring(0, 60) + "..." : "No image";
  console.log(`${index + 1}. ${p.name}`);
  console.log(`   URL: ${preview}\n`);
});

// Example: Update a specific product's image URL
console.log("\n✏️  EXAMPLE: How to update an image URL\n");
console.log("const updateProduct = db.prepare(`");
console.log("  UPDATE products");
console.log("  SET image_url = ?");
console.log("  WHERE id = ?");
console.log("`);");
console.log("\nupdateProduct.run('https://new-image-url.com/image.jpg', 'product-id-here');");

console.log("\n💡 Or use the interactive function below:\n");
console.log("updateProductImage('Fresh Apples (Himalayan)', 'https://your-new-url.jpg');\n");

// Helper function to update by product name
function updateProductImage(productName, newImageUrl) {
  const product = db.prepare(`SELECT id FROM products WHERE name = ?`).get(productName);
  
  if (!product) {
    console.log(`❌ Product "${productName}" not found`);
    return false;
  }

  const update = db.prepare(`UPDATE products SET image_url = ? WHERE id = ?`);
  update.run(newImageUrl, product.id);
  
  const updated = db.prepare(`SELECT name, image_url FROM products WHERE id = ?`).get(product.id);
  console.log(`✅ Updated: ${updated.name}`);
  console.log(`   New URL: ${updated.image_url}\n`);
  return true;
}

console.log("📝 Quick Update Examples:\n");
console.log("// Update Fresh Apples image:");
console.log("updateProductImage('Fresh Apples (Himalayan)', 'https://images.unsplash.com/photo-xxxxx?w=400&h=300&fit=crop');");

db.close();
