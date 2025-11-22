// 1. Import the query function using 'import'
// The path '../db/index.js' goes up one level to 'db' folder
import { query } from '../db/index.js';

// 2. Get Total Student Count
// We use 'export' instead of 'exports.'
export const getStudentCount = async (req, res) => {
  try {
    // Run SQL query to count rows in the Students table
    const result = await query('SELECT COUNT(*) FROM Students');
    
    // Send the count back to the frontend
    // Note: Postgres returns count as a string, so frontend might need to convert it
    res.json({ count: result.rows[0].count });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 3. Get All Students (for the Admin list)
export const getAllStudents = async (req, res) => {
  try {
    // Select all columns from Students table
    const result = await query('SELECT * FROM Students ORDER BY id ASC');
    
    // Send the list of students back as JSON
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};