const request = require('supertest');
const path = require('path');
const fs = require('fs');
const { initializeDatabase, closeDatabase } = require('../src/database');
const app = require('../src/app');

const testDbPath = path.join(__dirname, 'test-inventory.db');

beforeAll(() => {
  // Initialize test database
  initializeDatabase(testDbPath);
});

afterAll(() => {
  // Clean up
  closeDatabase();
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});

describe('Inventory API', () => {
  describe('GET /api/items', () => {
    it('should return all items', async () => {
      const response = await request(app).get('/api/items');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should have required fields in items', async () => {
      const response = await request(app).get('/api/items');
      const item = response.body[0];
      
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('description');
      expect(item).toHaveProperty('quantity');
      expect(item).toHaveProperty('price');
      expect(item).toHaveProperty('image_url');
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const newItem = {
        name: 'Test Item',
        description: 'A test item for testing',
        quantity: 5,
        price: 19.99
      };

      const response = await request(app)
        .post('/api/items')
        .send(newItem);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(newItem.name);
      expect(response.body.description).toBe(newItem.description);
      expect(response.body.quantity).toBe(newItem.quantity);
      expect(response.body.price).toBe(newItem.price);
      expect(response.body).toHaveProperty('id');
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ description: 'No name item', quantity: 1 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name is required');
    });

    it('should return 400 if name is empty', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: '   ', description: 'Empty name' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name is required');
    });

    it('should sanitize negative quantity to 0', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: 'Negative Test', quantity: -5, price: 10 });

      expect(response.status).toBe(201);
      expect(response.body.quantity).toBe(0);
    });

    it('should sanitize negative price to 0', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: 'Negative Price Test', quantity: 10, price: -5 });

      expect(response.status).toBe(201);
      expect(response.body.price).toBe(0);
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return a specific item', async () => {
      const response = await request(app).get('/api/items/1');
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app).get('/api/items/99999');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Item not found');
    });

    it('should return 400 for invalid item ID', async () => {
      const response = await request(app).get('/api/items/invalid');
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid item ID');
    });
  });

  describe('PUT /api/items/:id', () => {
    let testItemId;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: 'Update Test Item', quantity: 1, price: 10 });
      testItemId = response.body.id;
    });

    it('should update an existing item', async () => {
      const updatedData = {
        name: 'Updated Item Name',
        description: 'Updated description',
        quantity: 10,
        price: 29.99
      };

      const response = await request(app)
        .put(`/api/items/${testItemId}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updatedData.name);
      expect(response.body.description).toBe(updatedData.description);
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .put('/api/items/99999')
        .send({ name: 'Test', quantity: 1 });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Item not found');
    });

    it('should return 400 if name is empty', async () => {
      const response = await request(app)
        .put(`/api/items/${testItemId}`)
        .send({ name: '', quantity: 1 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name is required');
    });
  });

  describe('DELETE /api/items/:id', () => {
    let testItemId;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: 'Delete Test Item', quantity: 1, price: 5 });
      testItemId = response.body.id;
    });

    it('should delete an existing item', async () => {
      const response = await request(app).delete(`/api/items/${testItemId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Item deleted successfully');

      // Verify item is deleted
      const getResponse = await request(app).get(`/api/items/${testItemId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app).delete('/api/items/99999');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Item not found');
    });
  });
});
