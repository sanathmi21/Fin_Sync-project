import express from 'express';
import pkg from 'pg';
import verifyToken from '../middleware/authMiddleware.js'; 

const { Pool } = pkg;
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

//GET TRANSACTIONS
router.get('/monthly', verifyToken, async (req, res) => {
  const { year, month } = req.query;
  const userId = req.user.id || req.user.UserID;

  try {
    //Fetch Income
    const incomeQuery = `
      SELECT "IncomeID" as id, "In_Date" as date, "In_Name" as name, "In_Amount" as amount, 'income' as type 
      FROM "Income" 
      WHERE "UserID" = $1 AND EXTRACT(YEAR FROM "In_Date") = $2 AND EXTRACT(MONTH FROM "In_Date") = $3
      ORDER BY "In_Date" DESC
    `;
    
    //Fetch Expenses
    const expenseQuery = `
      SELECT "ExpenseID" as id, "Ex_Date" as date, "Ex_Name" as name, "Category" as category, "Ex_Amount" as amount, 'expense' as type 
      FROM "Expenses" 
      WHERE "UserID" = $1 AND EXTRACT(YEAR FROM "Ex_Date") = $2 AND EXTRACT(MONTH FROM "Ex_Date") = $3
      ORDER BY "Ex_Date" DESC
    `;

    const incomeRes = await pool.query(incomeQuery, [userId, year, parseInt(month) + 1]);
    const expenseRes = await pool.query(expenseQuery, [userId, year, parseInt(month) + 1]);

    // Process income names to extract JSON details
    const processedIncomes = incomeRes.rows.map(row => {
      try {
        const details = JSON.parse(row.name);
        return {
          ...row,
          unit: details.unit,
          qty: details.qty
        };
      } catch (e) {
        return row;
      }
    });

    res.json({
      incomes: processedIncomes,
      expenses: expenseRes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// --- ADD INCOME ---
router.post('/income', verifyToken, async (req, res) => {
  const { date, unitAmount, quantity } = req.body;
  const userId = req.user.id || req.user.UserID;

  // Create a JSON payload for the income name
  const namePayload = JSON.stringify({ 
    type: 'Business Sales', 
    unit: unitAmount, 
    qty: quantity 
  });
  
  const totalAmount = Number(unitAmount) * Number(quantity);

  try {
    const query = `
      INSERT INTO "Income" ("UserID", "In_Name", "In_Date", "In_Amount")
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [userId, namePayload, date, totalAmount]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add income' });
  }
});

//ADD EXPENSE
router.post('/expense', verifyToken, async (req, res) => {
  const { date, category, name, amount } = req.body;
  const userId = req.user.id || req.user.UserID;

  try {
    const query = `
      INSERT INTO "Expenses" ("UserID", "Ex_Date", "Category", "Ex_Name", "Ex_Amount")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [userId, date, category, name, amount]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

//DELETE ITEM
router.delete('/:type/:id', verifyToken, async (req, res) => {
  const { type, id } = req.params;
  const userId = req.user.id || req.user.UserID;
  
  try {
    let query = '';
    if (type === 'income') {
      query = 'DELETE FROM "Income" WHERE "IncomeID" = $1 AND "UserID" = $2';
    } else {
      query = 'DELETE FROM "Expenses" WHERE "ExpenseID" = $1 AND "UserID" = $2';
    }

    await pool.query(query, [id, userId]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

export default router;