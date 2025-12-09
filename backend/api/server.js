import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pkg from 'pg';
import summaryRoutes from '../routes/Summary.js';
import authRoutes from '../routes/authRoutes.js';
import transactionsRoutes from '../routes/Transactions.js';
import dashboardRoutes from '../routes/dashboardRoutes.js';

const { Pool } = pkg;

dotenv.config();

const app = express();

// Middlewares 
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.json());

//Routes
app.use('/api/summary', summaryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/dashboard', dashboardRoutes);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => console.log('Connected to Neon PostgreSQL Database!'))
  .catch(err => console.error('Database connection error:', err));

app.get('/', (req, res) => {
  res.send('API is running...');
});

//Export as Vercel function handler
export default app;
