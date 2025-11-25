const Database = require('better-sqlite3');
const path = require('path');

let db;

function initializeDatabase(dbPath = path.join(__dirname, '..', 'inventory.db')) {
  db = new Database(dbPath);
  
  // Create items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      quantity INTEGER NOT NULL DEFAULT 0,
      price REAL NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Check if we need to add test data
  const count = db.prepare('SELECT COUNT(*) as count FROM items').get();
  if (count.count === 0) {
    seedDatabase();
  }
  
  return db;
}

function seedDatabase() {
  const testItems = [
    { name: 'Laptop', description: 'Dell XPS 15 inch laptop', quantity: 10, price: 1299.99 },
    { name: 'Mouse', description: 'Wireless Logitech mouse', quantity: 50, price: 29.99 },
    { name: 'Keyboard', description: 'Mechanical gaming keyboard', quantity: 30, price: 79.99 },
    { name: 'Monitor', description: '27 inch 4K display', quantity: 15, price: 449.99 },
    { name: 'Headphones', description: 'Noise-cancelling wireless headphones', quantity: 25, price: 199.99 },
    { name: 'USB Hub', description: '7-port USB 3.0 hub', quantity: 40, price: 24.99 },
    { name: 'Webcam', description: '1080p HD webcam', quantity: 20, price: 59.99 },
    { name: 'Desk Lamp', description: 'LED desk lamp with adjustable brightness', quantity: 35, price: 34.99 },
    { name: 'Chair', description: 'Ergonomic office chair', quantity: 8, price: 299.99 },
    { name: 'Desk Mat', description: 'Large leather desk mat', quantity: 45, price: 19.99 }
  ];

  const insert = db.prepare('INSERT INTO items (name, description, quantity, price) VALUES (?, ?, ?, ?)');
  
  for (const item of testItems) {
    insert.run(item.name, item.description, item.quantity, item.price);
  }
}

function getDatabase() {
  return db;
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  initializeDatabase,
  getDatabase,
  closeDatabase,
  seedDatabase
};
