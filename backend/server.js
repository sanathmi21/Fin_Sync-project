import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pkg from 'pg'; 
import summaryRoutes from './routes/Summary.js';
import authRoutes from './routes/authRoutes.js';
import transactionsRoutes from './routes/Transactions.js';

const { Pool } = pkg; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET","POST","PUT","DELETE"]
}));
app.use(express.json());
app.use('/api/summary', summaryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionsRoutes); 

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


if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;