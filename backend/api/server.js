import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pkg from 'pg';
import summaryRoutes from '../routes/Summary.js';
import authRoutes from '../routes/authRoutes.js';
import transactionsRoutes from '../routes/Transactions.js';
import dashboardRoutes from '../routes/dashboardRoutes.js';
import expenseRoutes from '../routes/expenseRoutes.js'; 
import incomeRoutes from '../routes/incomeRoutes.js';  
import verifyToken from '../middleware/Auth.js';        

const { Pool } = pkg;

dotenv.config();

const app = express();

// Middlewares 
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://fin-sync-project-frontend.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

//Routes
app.use('/api/summary', summaryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionsRoutes);

app.use('/api/dashboard',  verifyToken, dashboardRoutes);


app.use('/api/expenses', verifyToken, expenseRoutes); 
app.use('/api/income', verifyToken, incomeRoutes);   


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test database connection
pool.connect()
  .then(() => console.log('Connected to Neon PostgreSQL Database!'))
  .catch(err => console.error('Database connection error:', err));

app.get('/', (req, res) => {
  res.send('API is running...');
});

//NEW ADDED TEST ROUTES

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Database Connected', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

//NEW ADDED SERVER LISTENING FOR DEVELOPMENT

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API Base: http://localhost:${PORT}/api`);
  });
}

//Export as Vercel function handler
export default app;