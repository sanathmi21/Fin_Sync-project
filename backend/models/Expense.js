const pool = require('../config/db');

class Expense {
  // Add new expense
  static async addExpense(userId, expenseData) {
    const query = `
      INSERT INTO "Expenses" 
      ("UserID", "Ex_Name", "Category", "Ex_Amount", "Ex_Date", "Description", "HighPriority")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    
    const values = [
      userId,
      expenseData.name,
      expenseData.category,
      parseFloat(expenseData.amount),
      expenseData.date,
      expenseData.description || '',
      expenseData.highPriority || false
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get user's expenses
  static async getUserExpenses(userId, limit = 50) {
    const query = `
      SELECT * FROM "Expenses" 
      WHERE "UserID" = $1 
      ORDER BY "Ex_Date" DESC 
      LIMIT $2;
    `;
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  // Get high priority expenses
  static async getHighPriorityExpenses(userId) {
    const query = `
      SELECT * FROM "Expenses" 
      WHERE "UserID" = $1 AND "HighPriority" = true
      ORDER BY "Ex_Date" DESC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Update balance summary
  static async updateBalance(userId, date, amount) {
    try {
      // First, try to update existing record
      const updateQuery = `
        UPDATE "Balance_Summary" 
        SET 
          "Total_Expense" = "Total_Expense" + $3,
          "Total_Balance" = "Total_Balance" - $3
        WHERE "UserID" = $1 AND "Date" = $2
        RETURNING *;
      `;
      
      const updateResult = await pool.query(updateQuery, [userId, date, amount]);
      
      // If no rows updated, insert new record
      if (updateResult.rows.length === 0) {
        const insertQuery = `
          INSERT INTO "Balance_Summary" 
          ("UserID", "Date", "Total_Income", "Total_Expense", "Total_Balance")
          VALUES ($1, $2, 0, $3, -$3)
          RETURNING *;
        `;
        const insertResult = await pool.query(insertQuery, [userId, date, amount]);
        return insertResult.rows[0];
      }
      
      return updateResult.rows[0];
    } catch (error) {
      console.error('Error updating balance:', error);
      throw error;
    }
  }
}

module.exports = Expense;