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
    return;
  }
  console.log('✅ Database connected at:', dbPath);

  // Create test table
  db.run(
    `CREATE TABLE IF NOT EXISTS test (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user TEXT NOT NULL
    )`,
    (err) => {
      if (err) {
        console.error('Error creating table:', err);
      } else {
        console.log('✅ Test table created with columns: id, user');
      }
      
      // Close database
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('✅ Database closed successfully');
        }
      });
    }
  );
});
