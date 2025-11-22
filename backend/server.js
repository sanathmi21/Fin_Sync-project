// server.js
import express from 'express';
import dotenv from 'dotenv';
import pkg from 'pg';  // pg module for PostgreSQL
const { Pool } = pkg;

// Load environment variables
dotenv.config();

const app = express();

// Connect to Vercel Postgres (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // required for Neon SSL
});

// Test database route
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database connection error');
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


app.get('/create-users-table', async (req, res) => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(query);
    res.send('Users table created successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating table');
  }
});
