// backend/routes/transactions.js
import express from "express";
import {pool} from "../db.js";
import verifyToken from "../middleware/Auth.js";
import verifyBusinessUser from "../middleware/verifyBusinessUser.js";

const router = express.Router();

//GET MONTHLY DATA
router.get("/monthly", verifyToken, async (req, res) => {
  try {
    const { year, month } = req.query;
    const userID = req.user.id;

    const monthNum = Number(month) + 1;

    const incomesQuery = `
      SELECT 
        "IncomeBID" AS id,
        "Busi_In_Date" AS date,
        "Busi_Unit_Amount" AS unit,
        "Quantity" AS qty,
        "Busi_Total_Amount" AS amount
      FROM "Income_Busi"
      WHERE "UserID" = $1
        AND EXTRACT(YEAR FROM "Busi_In_Date") = $2
        AND EXTRACT(MONTH FROM "Busi_In_Date") = $3
      ORDER BY "Busi_In_Date" DESC
    `;

    const expensesQuery = `
      SELECT 
        "ExpenseBID" AS id,
        "Busi_Ex_Date" AS date,
        "Busi_Ex_Category" AS category,
        "Busi_Ex_Name" AS name,
        "Busi_Ex_Amount" AS amount
      FROM "Expenses_Busi"
      WHERE "UserID" = $1
        AND EXTRACT(YEAR FROM "Busi_Ex_Date") = $2
        AND EXTRACT(MONTH FROM "Busi_Ex_Date") = $3
      ORDER BY "Busi_Ex_Date" DESC
    `;


    const incomes = (await pool.query(incomesQuery, [userID, year, monthNum])).rows;
    const expenses = (await pool.query(expensesQuery, [userID, year, monthNum])).rows;

    res.json({ incomes, expenses });


  } catch (err) {
    console.error("MONTHLY DATA ERROR:", err);
    res.status(500).json({ message: "Failed to load monthly data" });
  }
});

//ADD INCOME
router.post("/income", verifyToken, verifyBusinessUser, async (req, res) => {
  try {
    const { date, unitAmount, quantity } = req.body;
    const userID = req.user.id;

    if (!date || unitAmount == null) {
      return res.status(400).json({ message: "Date and unitAmount are required" });
    }

    const qty = Number(quantity) || 1;
    const total = Number(unitAmount) * qty;

    const insertQuery = `
      INSERT INTO "Income_Busi" 
        ("Busi_In_Date", "Busi_Unit_Amount", "Quantity", "Busi_Total_Amount", "UserID")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [date, unitAmount, qty, total, userID]);
    const insertedIncome = result.rows[0];

    res.status(201).json({
      id: insertedIncome.IncomeBID,
      date: insertedIncome.Busi_In_Date,
      unit: insertedIncome.Busi_Unit_Amount,
      qty: insertedIncome.Quantity,
      amount: insertedIncome.Busi_Total_Amount
    });

  } catch (err) {
    console.error("ADD INCOME ERROR:", err);
    res.status(500).json({ message: "Failed to add income" });
  }
});

// ADD EXPENSE
router.post("/expense", verifyToken, verifyBusinessUser, async (req, res) => {
  try {
    const { date, category, name, amount } = req.body;
    const userID = req.user.id;

    if (!date || !name || amount == null) {
      return res.status(400).json({ message: "Date, name, and amount are required" });
    }

    const insertQuery = `
      INSERT INTO "Expenses_Busi"
        ("Busi_Ex_Date", "Busi_Ex_Category", "Busi_Ex_Name", "Busi_Ex_Amount", "UserID")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [date, category || null, name, amount, userID]);
    const insertedExpense = result.rows[0];

    res.status(201).json({
      id: insertedExpense.ExpenseBID,
      date: insertedExpense.Busi_Ex_Date,
      category: insertedExpense.Busi_Ex_Category,
      name: insertedExpense.Busi_Ex_Name,
      amount: insertedExpense.Busi_Ex_Amount
    });

  } catch (err) {
    console.error("ADD EXPENSE ERROR:", err);
    res.status(500).json({ message: "Failed to add expense" });
  }
});

// DELETE INCOME
router.delete("/income/:id", verifyToken, async (req, res) => {
  try {
    const userID = req.user.id;
    const { id } = req.params;

    await pool.query(`DELETE FROM "Income_Busi" WHERE "IncomeBID" = $1 AND "UserID" = $2`, [id, userID]);
    res.json({ message: "Income deleted" });

  } catch (err) {
    console.error("DELETE INCOME ERROR:", err);
    res.status(500).json({ message: "Failed to delete income" });
  }
});

// DELETE EXPENSE 
router.delete("/expense/:id", verifyToken, async (req, res) => {
  try {
    const userID = req.user.id;
    const { id } = req.params;

    await pool.query(`DELETE FROM "Expenses_Busi" WHERE "ExpenseBID" = $1 AND "UserID" = $2`, [id, userID]);
    res.json({ message: "Expense deleted" });

  } catch (err) {
    console.error("DELETE EXPENSE ERROR:", err);
    res.status(500).json({ message: "Failed to delete expense" });
  }
});

//  VIEW TOTALS 
router.get("/totals", verifyToken, async (req, res) => {
  try {
    const userID = req.user.id;
    const { year, month } = req.query;

    if (!year || month === undefined) {
      return res.status(400).json({ message: "Year and month are required" });
    }

    const monthNum = Number(month) + 1;

    const incomeSumQuery = `SELECT SUM("Busi_Total_Amount") AS total FROM "Income_Busi" WHERE "UserID" = $1 AND EXTRACT(YEAR FROM "Busi_In_Date") = $2 AND EXTRACT(MONTH FROM "Busi_In_Date") = $3`;
    const expenseSumQuery = `SELECT SUM("Busi_Ex_Amount") AS total FROM "Expenses_Busi" WHERE "UserID" = $1 AND EXTRACT(YEAR FROM "Busi_Ex_Date") = $2 AND EXTRACT(MONTH FROM "Busi_Ex_Date") = $3`;

    const totalIncome = (await pool.query(incomeSumQuery, [userID, year, monthNum])).rows[0].total || 0;
    const totalExpense = (await pool.query(expenseSumQuery, [userID, year, monthNum])).rows[0].total || 0;

    res.json({ totalIncome, totalExpense });

  } catch (err) {
    console.error("TOTALS FETCH ERROR:", err);
    res.status(500).json({ message: "Failed to fetch totals" });
  }
});

export default router;

