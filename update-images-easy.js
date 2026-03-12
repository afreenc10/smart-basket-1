import Database from "better-sqlite3";

const db = new Database("db/smart_cart.db");

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UPDATE IMAGE URLs - Easy Update Tool
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Helper function to update any product's image
function updateImage(productName, newImageUrl) {
  try {
    const product = db.prepare(`SELECT id FROM products WHERE name = ?`).get(productName);
    
    if (!product) {
      console.log(`❌ Product not found: "${productName}"`);
      return false;
    }

    db.prepare(`UPDATE products SET image_url = ? WHERE id = ?`)
      .run(newImageUrl, product.id);
    
    console.log(`✅ Updated: ${productName}`);
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

// Get all products for reference
function listAllProducts() {
  const products = db.prepare(`
    SELECT name, image_url 
    FROM products 
    ORDER BY name
  `).all();

  console.log("\n📦 All Products:\n");
  products.forEach((p, i) => {
    const url = p.image_url ? p.image_url.substring(0, 50) + "..." : "No URL";
    console.log(`${i + 1}. ${p.name}`);
    console.log(`   ${url}\n`);
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USAGE EXAMPLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log("\n🖼️  IMAGE URL UPDATE TOOL\n");
console.log("═══════════════════════════════════════════════════════════════════\n");

// Show all products
listAllProducts();

console.log("\n🔧 HOW TO UPDATE:\n");
console.log("1️⃣  Edit this file (update-image-urls.js) at the bottom");
console.log("2️⃣  Add your updates in the format:\n");
console.log('    updateImage("Product Name", "https://new-image-url.jpg");');
console.log("\n3️⃣  Run: node update-image-urls.js\n");

console.log("═══════════════════════════════════════════════════════════════════\n");
console.log("📝 PASTE YOUR UPDATES BELOW (uncomment and edit):\n");
console.log('// updateImage("Fresh Apples (Himalayan)", "https://your-new-url.jpg");');
console.log('// updateImage("Bananas - Premium", "https://another-url.jpg");');
console.log('// updateImage("Oranges - Fresh", "https://third-url.jpg");\n');

console.log("💡 UNSPLASH URLS EXAMPLE:\n");
const exampleUrls = [
  'https://images.unsplash.com/photo-1560806887-1295766dd32c?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1615485236612-cf56e6d42e0b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1588195538326-c5b1e6f10ead?w=400&h=300&fit=crop'
];

exampleUrls.forEach((url, i) => {
  console.log(`Example ${i + 1}: ${url}`);
});

console.log("\n═══════════════════════════════════════════════════════════════════\n");

// ════════════════════════════════════════════════════════════════════════════
// ⬇️  ADD YOUR UPDATES HERE ⬇️
// ════════════════════════════════════════════════════════════════════════════

// Uncomment and edit the lines below with your product names and image URLs:
// CORRECT: Use images.unsplash.com URLs (not unsplash.com/photos)
updateImage("Apple Juice - Premium", "https://plus.unsplash.com/premium_photo-1663089590359-6ec775dd518e?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=400&h=300&fit=crop");
// updateImage("Bananas - Premium", "https://images.unsplash.com/photo-1615485236612-cf56e6d42e0b?w=400&h=300&fit=crop");

db.close();
