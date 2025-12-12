// db.js
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

// Create and export a single Pool instance for database connections
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Test database connection
pool.connect()
  .then(() => console.log("Connected to NEON PostgreSQL Database!"))
  .catch(err => console.error("Database connection error:", err));
