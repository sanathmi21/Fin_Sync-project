import express from 'express';

// Import the controller functions
// Note the .js extension is required!
import { getStudentCount, getAllStudents } from '../controllers/studentController.js';

const router = express.Router();

// Define endpoints
// GET /api/students/count
router.get('/count', getStudentCount);

// GET /api/students
router.get('/', getAllStudents);

// Export using 'export default' (ES Modules style)
export default router;