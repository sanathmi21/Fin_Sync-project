import express from 'express';
import pool from '../config/database.js';
import verifyToken from '../middleware/Auth.js';


const router = express.Router();

/**
 *  GET /api/dashboard?year=2025&month=1
 *  Returns:
 *  totalIncome, totalExpenses, totalBalance, expenses[]
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const { year, month } = req.query;
    const userId = req.user.id || req.user.UserID;

    if (!year || !month) {
      return res.status(400).json({ error: "Year and month are required" });
    }

    // ----------- 1. Get total income for month --------------
    const incomeQuery = `
      SELECT COALESCE(SUM("In_Amount"), 0) AS total_income
      FROM "Income"
      WHERE "UserID" = $1 
        AND EXTRACT(YEAR FROM "In_Date") = $2
        AND EXTRACT(MONTH FROM "In_Date") = $3
    `;
    const incomeResult = await pool.query(incomeQuery, [userId, year, Number(month)]);

    // ----------- 2. Get total expenses for month --------------
    const expenseQuery = `
      SELECT 
        "Ex_Category" AS name,
        COALESCE(SUM("Ex_Amount"), 0) AS value
      FROM "Expenses"
      WHERE "UserID" = $1 
        AND EXTRACT(YEAR FROM "Ex_Date") = $2
        AND EXTRACT(MONTH FROM "Ex_Date") = $3
      GROUP BY "Ex_Category"
      ORDER BY value DESC;
    `;
    const expenseResult = await pool.query(expenseQuery, [userId, year, Number(month)]);

    const totalIncome = Number(incomeResult.rows[0].total_income);
    const totalExpenses = expenseResult.rows.reduce((sum, e) => sum + Number(e.value), 0);
    const totalBalance = totalIncome - totalExpenses;

    // ----------- 3. Generate pie chart color set --------------
    const COLORS = ['#00441B', '#006D2C', '#238845', '#41AB5D', '#74C476', '#A1D99B'];

    // ----------- 4. Format expenses for frontend --------------
    const expenses = expenseResult.rows.map((row, index) => {
      const value = Number(row.value);
      const percentage = totalExpenses ? ((value / totalExpenses) * 100).toFixed(1) : 0;

      return {
        name: row.name,
        value,
        color: COLORS[index % COLORS.length],
        percentage
      };
    });

    // ----------- 5. Return final dashboard object --------------
    res.json({
      totalIncome,
      totalExpenses,
      totalBalance,
      expenses
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ error: "Server error loading dashboard" });
  }
});

export default router;
