import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Use a connection string from Vercel environment variables
const pool = new Pool({
  // IMPORTANT: This uses the POSTGRES_URL environment variable
  connectionString: process.env.POSTGRES_URL,
});

// CRITICAL: We test the connection immediately and report the status.
// This allows the server to start, even if the DB is briefly offline.
pool.connect()
    .then(client => {
        console.log("Database connection successful!");
        client.release();
    })
    .catch(err => {
        // This log will appear in Vercel's logs if the password or URL is wrong nj
        console.error("CRITICAL: Database connection failed on startup:", err.message);
    });

// We export the query function for controllers to use
export const query = (text, params) => pool.query(text, params);