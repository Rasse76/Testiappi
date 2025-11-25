const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { getDatabase } = require('./database');

const app = express();

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api/', apiLimiter);

// Validation helpers
function isValidId(id) {
  const num = parseInt(id, 10);
  return !isNaN(num) && num > 0 && String(num) === String(id);
}

function sanitizeNumber(value, defaultValue = 0) {
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) return defaultValue;
  return num;
}

// Get all items
app.get('/api/items', (req, res) => {
  try {
    const db = getDatabase();
    const items = db.prepare('SELECT * FROM items ORDER BY created_at DESC').all();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Get a single item by ID
app.get('/api/items/:id', (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }
    
    const db = getDatabase();
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(parseInt(req.params.id, 10));
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// Add a new item
app.post('/api/items', (req, res) => {
  try {
    const { name, description, quantity, price, image_url } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const sanitizedQuantity = Math.floor(sanitizeNumber(quantity, 0));
    const sanitizedPrice = sanitizeNumber(price, 0);
    
    const db = getDatabase();
    const result = db.prepare(
      'INSERT INTO items (name, description, quantity, price, image_url) VALUES (?, ?, ?, ?, ?)'
    ).run(name.trim(), description || '', sanitizedQuantity, sanitizedPrice, image_url || null);
    
    const newItem = db.prepare('SELECT * FROM items WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Update an item
app.put('/api/items/:id', (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }
    
    const { name, description, quantity, price, image_url } = req.body;
    const db = getDatabase();
    const itemId = parseInt(req.params.id, 10);
    
    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const sanitizedQuantity = Math.floor(sanitizeNumber(quantity, 0));
    const sanitizedPrice = sanitizeNumber(price, 0);
    
    db.prepare(
      'UPDATE items SET name = ?, description = ?, quantity = ?, price = ?, image_url = ? WHERE id = ?'
    ).run(name.trim(), description || '', sanitizedQuantity, sanitizedPrice, image_url || null, itemId);
    
    const updatedItem = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete an item
app.delete('/api/items/:id', (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }
    
    const db = getDatabase();
    const itemId = parseInt(req.params.id, 10);
    
    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    db.prepare('DELETE FROM items WHERE id = ?').run(itemId);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = app;
