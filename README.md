# Testiappi - Inventory Management

A web application to manage inventory sales items. Users can add new items, delete and browse them.

## Features

- **Add Items**: Create new inventory items with name, description, quantity, and price
- **Browse Items**: View all inventory items in a table with search functionality
- **Edit Items**: Update existing item details
- **Delete Items**: Remove items from the inventory
- **Statistics Dashboard**: View total items, quantity, and value at a glance
- **Local Database**: SQLite database with pre-populated test data

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

### Running Tests

```bash
npm test
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | Get all items |
| GET | `/api/items/:id` | Get a specific item |
| POST | `/api/items` | Create a new item |
| PUT | `/api/items/:id` | Update an item |
| DELETE | `/api/items/:id` | Delete an item |

## Project Structure

```
├── public/
│   └── index.html      # Frontend UI
├── src/
│   ├── app.js          # Express application and routes
│   ├── database.js     # SQLite database setup and operations
│   └── server.js       # Server entry point
├── tests/
│   └── app.test.js     # API tests
├── package.json
└── README.md
```

## Test Data

The application comes pre-loaded with 10 sample inventory items including laptops, mice, keyboards, monitors, and more.
