import express from 'express';
import verifyToken from '../middleware/Auth.js';
import { pool } from '../db.js';

const router = express.Router();

// Monthly Summary
router.get('/monthly', verifyToken, async (req, res) => {
  const { year, month } = req.query;
  const userId = req.user.id || req.user.UserID;
  const userType = (req.user.type || req.user.userType || 'personal').toLowerCase(); 


  // ADD THESE DEBUG LOGS--------------------------------------------------------------------------------------------
  console.log('=== MONTHLY SUMMARY DEBUG ===');
  console.log('User ID:', userId);
  console.log('User Type:', userType);
  console.log('Year:', year, 'Month:', month);

  // Validate month
  const monthNumber = parseInt(month);
  if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    return res.status(400).json({ error: 'Invalid month value' });
  }

  try {
    let incomeQuery, expenseQuery;
    let params = [userId, year, monthNumber];

    if (userType === 'business') {
      incomeQuery = `
        SELECT DATE("Busi_In_Date") AS date, SUM("Busi_Total_Amount") AS total_income
        FROM "Income_Busi"
        WHERE "UserID" = $1
        AND EXTRACT(YEAR FROM "Busi_In_Date") = $2
        AND EXTRACT(MONTH FROM "Busi_In_Date") = $3
        GROUP BY DATE ("Busi_In_Date")
        ORDER BY DATE ("Busi_In_Date")
      `;
      expenseQuery = `
        SELECT DATE("Busi_Ex_Date") AS date, SUM("Busi_Ex_Amount") AS total_expense
        FROM "Expenses_Busi"
        WHERE "UserID" = $1
        AND EXTRACT(YEAR FROM "Busi_Ex_Date") = $2
        AND EXTRACT(MONTH FROM "Busi_Ex_Date") = $3
        GROUP BY DATE("Busi_Ex_Date")
        ORDER BY DATE("Busi_Ex_Date")
      `;
    } else {
      incomeQuery = `
        SELECT DATE("In_Date") AS date, SUM("In_Amount") AS total_income
        FROM "Income"
        WHERE "UserID" = $1
        AND EXTRACT(YEAR FROM "In_Date") = $2
        AND EXTRACT(MONTH FROM "In_Date") = $3
        GROUP BY DATE("In_Date")
        ORDER BY DATE("In_Date")
      `;
      expenseQuery = `
        SELECT DATE("Ex_Date") AS date, SUM("Ex_Amount") AS total_expense
        FROM "Expenses"
        WHERE "UserID" = $1
        AND EXTRACT(YEAR FROM "Ex_Date") = $2
        AND EXTRACT(MONTH FROM "Ex_Date") = $3
        GROUP BY DATE("Ex_Date")
        ORDER BY DATE("Ex_Date")
      `;
    }

    const [incomeRes, expenseRes] = await Promise.all([
      pool.query(incomeQuery, params),
      pool.query(expenseQuery, params)
    ]);

    // ADD THESE DEBUG LOGS--------------------------------------------------------------------------------------------
    console.log('Income rows:', incomeRes.rows);
    console.log('Expense rows:', expenseRes.rows);

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

    console.log('Final monthlyData:', monthlyData);

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
  const userType = (req.user.type || req.user.userType || 'personal').toLowerCase();

  try {
    let incomeQuery, expenseQuery;
    let params = [userId, year];

    if (userType === 'business') {
      incomeQuery = `
        SELECT EXTRACT (MONTH FROM "Busi_In_Date")::int AS month, SUM("Busi_Total_Amount") AS total_income
        FROM "Income_Busi"
        WHERE "UserID" = $1 AND EXTRACT(YEAR FROM "Busi_In_Date") = $2
        GROUP BY month
        ORDER BY month
      `;
      expenseQuery = `
        SELECT EXTRACT(MONTH FROM "Busi_Ex_Date")::int AS month, SUM("Busi_Ex_Amount") AS total_expense
        FROM "Expenses_Busi"
        WHERE "UserID" = $1 AND EXTRACT(YEAR FROM "Busi_Ex_Date") = $2
        GROUP BY month
        ORDER BY month
      `;
    } else {
      incomeQuery = `
        SELECT EXTRACT(MONTH FROM "In_Date")::int AS month, SUM("In_Amount") AS total_income
        FROM "Income"
        WHERE "UserID" = $1 AND EXTRACT(YEAR FROM "In_Date") = $2
        GROUP BY month
        ORDER BY month
      `;
      expenseQuery = `
        SELECT EXTRACT(MONTH FROM "Ex_Date")::int AS month, SUM("Ex_Amount") AS total_expense
        FROM "Expenses"
        WHERE "UserID" = $1 AND EXTRACT(YEAR FROM "Ex_Date") = $2
        GROUP BY month
        ORDER BY month
      `;
    }

    const [incomeRes, expenseRes] = await Promise.all([
      pool.query(incomeQuery, params),
      pool.query(expenseQuery, params)
    ]);

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
