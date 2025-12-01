import express from 'express';
import pkg from 'pg';
import verifyToken from '../middleware/Auth.js'; 

const { Pool } = pkg;
const router = express.Router();

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});


router.get('/monthly', verifyToken, async (req, res) => {
  const { year, month } = req.query;
  

  const userId = req.user.id || req.user.UserID; 

  try {
    const query = `
      SELECT 
        EXTRACT(DAY FROM d_date) as day,
        SUM(income) as total_income,
        SUM(expense) as total_expense
      FROM (
        SELECT "In_Date" as d_date, "In_Amount" as income, 0 as expense 
        FROM "Income" WHERE "UserID" = $1 
        AND EXTRACT(YEAR FROM "In_Date") = $2 AND EXTRACT(MONTH FROM "In_Date") = $3
        
        UNION ALL
        
        SELECT "Ex_Date" as d_date, 0 as income, "Ex_Amount" as expense 
        FROM "Expenses" WHERE "UserID" = $1 
        AND EXTRACT(YEAR FROM "Ex_Date") = $2 AND EXTRACT(MONTH FROM "Ex_Date") = $3
      ) as combined
      GROUP BY day
    `;
    
    const result = await pool.query(query, [userId, year, parseInt(month) + 1]);
    
    const dataMap = {};
    result.rows.forEach(row => {
      dataMap[row.day] = {
        income: Number(row.total_income),
        expense: Number(row.total_expense)
      };
    });

    res.json(dataMap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error fetching monthly data' });
  }
});


router.get('/yearly', verifyToken, async (req, res) => {
  const { year } = req.query;
  const userId = req.user.id || req.user.UserID; 

  try {
    const query = `
      SELECT 
        EXTRACT(MONTH FROM d_date) as month_num,
        SUM(income) as total_income,
        SUM(expense) as total_expense
      FROM (
        SELECT "In_Date" as d_date, "In_Amount" as income, 0 as expense 
        FROM "Income" WHERE "UserID" = $1 AND EXTRACT(YEAR FROM "In_Date") = $2
        
        UNION ALL
        
        SELECT "Ex_Date" as d_date, 0 as income, "Ex_Amount" as expense 
        FROM "Expenses" WHERE "UserID" = $1 AND EXTRACT(YEAR FROM "Ex_Date") = $2
      ) as combined
      GROUP BY month_num
      ORDER BY month_num
    `;

    const result = await pool.query(query, [userId, year]);
    
    const yearlyData = Array.from({ length: 12 }, (_, i) => ({
      monthIndex: i,
      income: 0,
      expense: 0
    }));

    result.rows.forEach(row => {
      const idx = row.month_num - 1; 
      if (yearlyData[idx]) {
        yearlyData[idx].income = Number(row.total_income);
        yearlyData[idx].expense = Number(row.total_expense);
      }
    });

    res.json(yearlyData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error fetching yearly data' });
  }
});

export default router;