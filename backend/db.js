
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();



const { Pool } = pkg;


export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});


(async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("🌐 Connected to NEON PostgreSQL Database!");
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
  }
})();
