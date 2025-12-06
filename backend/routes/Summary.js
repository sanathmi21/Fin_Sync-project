import express from 'express';
import pkg from 'pg';
import verifyToken from '../middleware/Auth.js';

const { Pool } = pkg;
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Monthly Summary
router.get('/monthly', verifyToken, async (req, res) => {
  const { year, month } = req.query;
  const userId = req.user.id || req.user.UserID;
  const userType = req.user.userType || 'Personal'; 

  try {
    let incomeQuery = '';
    let expenseQuery = '';
    let incomeParams = [userId, year, parseInt(month) + 1];
    let expenseParams = [userId, year, parseInt(month) + 1];

    if (userType === 'Business') {
      incomeQuery = `
        SELECT "Busi_In_Date"::date AS date, SUM("Busi_Total_Amount") AS total_income
        FROM "Income_Busi"
        WHERE "UserID" = $1
        AND EXTRACT(YEAR FROM "Busi_In_Date") = $2
        AND EXTRACT(MONTH FROM "Busi_In_Date") = $3
        GROUP BY "Busi_In_Date"
      `;
      expenseQuery = `
        SELECT "Busi_Ex_Date"::date AS date, SUM("Busi_Ex_Amount") AS total_expense
        FROM "Expenses_Busi"
        WHERE "UserID" = $1
        AND EXTRACT(YEAR FROM "Busi_Ex_Date") = $2
        AND EXTRACT(MONTH FROM "Busi_Ex_Date") = $3
        GROUP BY "Busi_Ex_Date"
      `;
    } else {
      incomeQuery = `
        SELECT "In_Date"::date AS date, SUM("In_Amount") AS total_income
        FROM "Income"
        WHERE "UserID" = $1
        AND EXTRACT(YEAR FROM "In_Date") = $2
        AND EXTRACT(MONTH FROM "In_Date") = $3
        GROUP BY "In_Date"
      `;
      expenseQuery = `
        SELECT "Ex_Date"::date AS date, SUM("Ex_Amount") AS total_expense
        FROM "Expenses"
        WHERE "UserID" = $1
        AND EXTRACT(YEAR FROM "Ex_Date") = $2
        AND EXTRACT(MONTH FROM "Ex_Date") = $3
        GROUP BY "Ex_Date"
      `;
    }

    const incomeRes = await pool.query(incomeQuery, incomeParams);
    const expenseRes = await pool.query(expenseQuery, expenseParams);

    const monthlyData = {};

    incomeRes.rows.forEach(row => {
      const day = new Date(row.date).getDate();
      monthlyData[day] = { income: parseFloat(row.total_income), expense: 0 };
    });

    expenseRes.rows.forEach(row => {
      const day = new Date(row.date).getDate();
      if (!monthlyData[day]) monthlyData[day] = { income: 0, expense: 0 };
      monthlyData[day].expense = parseFloat(row.total_expense);
    });

    res.json(monthlyData);
  } catch (err) {
    console.error('Error fetching monthly summary:', err);
    res.status(500).json({ error: 'Failed to fetch monthly summary' });
  }
});

// Yearly Summary
router.get('/yearly', verifyToken, async (req, res) => {
  const { year } = req.query;
  const userId = req.user.id || req.user.UserID;
  const userType = req.user.userType || 'Personal'; 

  try {
    let incomeQuery = '';
    let expenseQuery = '';
    let incomeParams = [userId, year];
    let expenseParams = [userId, year];

    if (userType === 'Business') {
      incomeQuery = `
        SELECT EXTRACT(MONTH FROM "Busi_In_Date") AS month, SUM("Busi_Total_Amount") AS total_income
        FROM "Income_Busi"
        WHERE "UserID" = $1 AND EXTRACT(YEAR FROM "Busi_In_Date") = $2
        GROUP BY month
      `;
      expenseQuery = `
        SELECT EXTRACT(MONTH FROM "Busi_Ex_Date") AS month, SUM("Busi_Ex_Amount") AS total_expense
        FROM "Expenses_Busi"
        WHERE "UserID" = $1 AND EXTRACT(YEAR FROM "Busi_Ex_Date") = $2
        GROUP BY month
      `;
    } else {
      incomeQuery = `
        SELECT EXTRACT(MONTH FROM "In_Date") AS month, SUM("In_Amount") AS total_income
        FROM "Income"
        WHERE "UserID" = $1 AND EXTRACT(YEAR FROM "In_Date") = $2
        GROUP BY month
      `;
      expenseQuery = `
        SELECT EXTRACT(MONTH FROM "Ex_Date") AS month, SUM("Ex_Amount") AS total_expense
        FROM "Expenses"
        WHERE "UserID" = $1 AND EXTRACT(YEAR FROM "Ex_Date") = $2
        GROUP BY month
      `;
    }

    const incomeRes = await pool.query(incomeQuery, incomeParams);
    const expenseRes = await pool.query(expenseQuery, expenseParams);

    const yearlyData = Array.from({ length: 12 }, () => ({ income: 0, expense: 0 }));

    incomeRes.rows.forEach(row => {
      yearlyData[row.month - 1].income = parseFloat(row.total_income);
    });

    expenseRes.rows.forEach(row => {
      yearlyData[row.month - 1].expense = parseFloat(row.total_expense);
    });

    res.json(yearlyData);
  } catch (err) {
    console.error('Error fetching yearly summary:', err);
    res.status(500).json({ error: 'Failed to fetch yearly summary' });
  }
});

export default router;
