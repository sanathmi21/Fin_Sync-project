import express from 'express';
import { pool } from "../db.js";
import verifyToken from '../middleware/Auth.js';
import cors from "cors";

const corsMiddleware = cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
});

const router = express.Router();

/**
 * GET /api/dashboard?year=2025&month=12&type=personal
 * GET /api/dashboard?year=2025&month=12&type=business
 */
router.get('/', corsMiddleware, verifyToken, async (req, res) => {
  try {
    const { year, month, type } = req.query;
    const userId = req.user.id;

    // ✅ Validation
    if (!year || !month || !type) {
      return res.status(400).json({ 
        success: false,
        error: "year, month, and type are required" 
      });
    }

    console.log(`Dashboard request: userId=${userId}, year=${year}, month=${month}, type=${type}`);

    // ✅ FIXED: Different tables and columns for business vs personal
    const isBusiness = type === "business";
    
    const incomeTable = isBusiness ? '"Income_Busi"' : '"Income"';
    const expenseTable = isBusiness ? '"Expenses_Busi"' : '"Expenses"';
    
    const incomeDateCol = isBusiness ? '"Busi_In_Date"' : '"In_Date"';
    const incomeAmountCol = isBusiness ? '"Busi_Total_Amount"' : '"In_Amount"';
    
    const expenseDateCol = isBusiness ? '"Busi_Ex_Date"' : '"Ex_Date"';
    const expenseAmountCol = isBusiness ? '"Busi_Ex_Amount"' : '"Ex_Amount"';
    const categoryColumn = isBusiness ? '"Busi_Ex_Category"' : '"Category"';

    // ------ 1. Fetch Income ------
    const incomeQuery = `
      SELECT COALESCE(SUM(${incomeAmountCol}), 0) AS total_income
      FROM ${incomeTable}
      WHERE "UserID" = $1
        AND EXTRACT(YEAR FROM ${incomeDateCol}) = $2
        AND EXTRACT(MONTH FROM ${incomeDateCol}) = $3
    `;
    const incomeResult = await pool.query(incomeQuery, [userId, year, month]);

    // ------ 2. Fetch Expenses by Category ------
    const expenseQuery = `
      SELECT 
        ${categoryColumn} AS name,
        COALESCE(SUM(${expenseAmountCol}), 0) AS value
      FROM ${expenseTable}
      WHERE "UserID" = $1
        AND EXTRACT(YEAR FROM ${expenseDateCol}) = $2
        AND EXTRACT(MONTH FROM ${expenseDateCol}) = $3
        AND ${categoryColumn} IS NOT NULL
      GROUP BY ${categoryColumn}
      ORDER BY value DESC
    `;
    const expenseResult = await pool.query(expenseQuery, [userId, year, month]);

    // ------ 3. Calculate Totals ------
    const totalIncome = Number(incomeResult.rows[0].total_income);
    const totalExpenses = expenseResult.rows.reduce((sum, e) => sum + Number(e.value), 0);
    const totalBalance = totalIncome - totalExpenses;

    // ------ 4. Color Maps ------
    const businessColors = {
      "Factory Rent": "#042d16ff",
      "Employees Salary": "#045404ff",
      "Investment": "#0f8424ff",
      "Material Procurement": "#22c609ff",
      "Training": "#13e761ff",
      "Maintainence": "#9dff96ff"
    };

    const personalColors = {
      "Entertainment": "#042d16ff",
      "Food": "#045404ff",
      "Travel": "#0f8424ff",
      "Utilities": "#22c609ff",
      "Shopping": "#13e761ff",
      "Health": "#9dff96ff"
    };

    const colorMap = isBusiness ? businessColors : personalColors;
    const defaultColors = ['#00441B', '#006D2C', '#238845', '#41AB5D', '#74C476', '#A1D99B'];

    // ------ 5. Format Expenses ------
    const expenses = expenseResult.rows.map((row, index) => {
      const value = Number(row.value);
      const percentage = totalExpenses > 0 ? ((value / totalExpenses) * 100).toFixed(1) : 0;

      return {
        name: row.name || "Other",
        value: value,
        color: colorMap[row.name] || defaultColors[index % defaultColors.length],
        percentage: percentage
      };
    });

    console.log(`Found ${expenses.length} expense categories, total: Rs. ${totalExpenses}`);

    // ------ 6. Send Response ------
    res.json({
      success: true,
      data: {
        expenses: expenses,
        incomes: [],
        totals: {
          totalIncome,
          totalExpenses,
          totalBalance
        },
        categories: expenses
      }
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ 
      success: false,
      error: "Server error loading dashboard",
      details: err.message
    });
  }
});

/**
 * Debug endpoint - Check personal expenses
 */
router.get('/debug-expenses', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(`
      SELECT "UserID", "Ex_Amount", "Ex_Date", "Category"
      FROM "Expenses"
      WHERE "UserID" = $1
      ORDER BY "Ex_Date" DESC
      LIMIT 10
    `, [userId]);
    
    res.json({
      success: true,
      count: result.rows.length,
      expenses: result.rows
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Debug endpoint - Check business expenses
 */
router.get('/debug-business-expenses', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(`
      SELECT "UserID", "Busi_Ex_Amount", "Busi_Ex_Date", "Busi_Ex_Category"
      FROM "Expenses_Busi"
      WHERE "UserID" = $1
      ORDER BY "Busi_Ex_Date" DESC
      LIMIT 10
    `, [userId]);
    
    res.json({
      success: true,
      count: result.rows.length,
      expenses: result.rows
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;