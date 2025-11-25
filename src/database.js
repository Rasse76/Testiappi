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
      image_url TEXT,
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
    { name: 'Fishing Rod', description: 'Carbon fiber spinning rod, 7ft medium action', quantity: 25, price: 89.99, image_url: '/images/fishing-rod.svg' },
    { name: 'Tackle Box', description: 'Waterproof tackle box with 3 trays', quantity: 40, price: 34.99, image_url: '/images/tackle-box.svg' },
    { name: 'Fishing Reel', description: 'Baitcasting reel with 7:1 gear ratio', quantity: 30, price: 129.99, image_url: '/images/fishing-reel.svg' },
    { name: 'Fishing Line', description: 'Braided fishing line, 300 yards, 20lb test', quantity: 100, price: 24.99, image_url: '/images/fishing-line.svg' },
    { name: 'Lure Kit', description: 'Assorted bass lures, 50 piece set', quantity: 50, price: 45.99, image_url: '/images/lure-kit.svg' }
  ];

  const insert = db.prepare('INSERT INTO items (name, description, quantity, price, image_url) VALUES (?, ?, ?, ?, ?)');
  
  for (const item of testItems) {
    insert.run(item.name, item.description, item.quantity, item.price, item.image_url);
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
