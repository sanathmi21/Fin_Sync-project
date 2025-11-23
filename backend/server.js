import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Import your routes (Adjust the filenames to match what is inside your routes folder)
// Example: import expensesRoutes from './routes/expenses.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test Route (To check if server works)
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Use Routes
// app.use('/api/expenses', expensesRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});