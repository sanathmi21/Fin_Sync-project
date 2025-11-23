import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pkg from 'pg'; 
const { Pool } = pkg; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const pool = new Pool({

  connectionString: process.env.DATABASE_URL, 
  ssl: {
    rejectUnauthorized: false 
  }
});

pool.connect()
  .then(() => console.log('Connected to Neon PostgreSQL Database!'))
  .catch(err => console.error('Database connection error:', err));

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Test DB Route
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Database Connected', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});