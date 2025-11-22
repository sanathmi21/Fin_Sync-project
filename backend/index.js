import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import your routes
// Make sure the file at ./routes/studentRoutes.js exists!
import studentRoutes from './routes/studentRoutes.js'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// === ROUTES ===
// 1. Student Routes (GET /api/students/count, GET /api/students)
app.use('/api/students', studentRoutes);

// 2. Basic Test Route (GET /)
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running successfully!' });
});

// === SERVER STARTUP ===
// This logic handles both Local Development and Vercel Deployment

// If we are NOT on Vercel (running locally), start the server on a port
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export the app for Vercel (Serverless Function)
export default app;