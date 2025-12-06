import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pkg from 'pg'; 
import summaryRoutes from './routes/Summary.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

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
app.use('/api/dashboard', dashboardRoutes);


app.get('/', (req, res) => {
  res.send('API is running...');
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));