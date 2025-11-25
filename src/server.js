const app = require('./app');
const { initializeDatabase } = require('./database');

const PORT = process.env.PORT || 3000;

// Initialize database
initializeDatabase();

app.listen(PORT, () => {
  console.log(`Inventory Management Server running on http://localhost:${PORT}`);
});
