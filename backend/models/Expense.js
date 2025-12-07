import pool from '../db.js';

class Expense {
  // Add new expense
  static async addExpense(userId, expenseData) {
    console.log('Inserting expense with data:', { userId, expenseData });
    
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

    console.log('Executing query:', query);
    console.log('With values:', values);

    try {
      const result = await pool.query(query, values);
      console.log('Expense inserted successfully:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Database error in addExpense:', error);
      throw error;
    }
  }

  // Get user's expenses
  static async getUserExpenses(userId, limit = 50) {
    const query = `
      SELECT * FROM "Expenses" 
      WHERE "UserID" = $1 
      ORDER BY "Ex_Date" DESC 
      LIMIT $2;
    `;
    
    try {
      const result = await pool.query(query, [userId, limit]);
      return result.rows;
    } catch (error) {
      console.error('Database error in getUserExpenses:', error);
      throw error;
    }
  }

  // Get high priority expenses
  static async getHighPriorityExpenses(userId) {
    const query = `
      SELECT * FROM "Expenses" 
      WHERE "UserID" = $1 AND "HighPriority" = true
      ORDER BY "Ex_Date" DESC;
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Database error in getHighPriorityExpenses:', error);
      throw error;
    }
  }

  // Update balance summary - FIXED VERSION
  static async updateBalance(userId, date, amount) {
    try {
      console.log('Updating balance for user:', userId, 'date:', date, 'amount:', amount);
      
      // First check if record exists
      const checkQuery = `
        SELECT * FROM "Balance_Summary" 
        WHERE "UserID" = $1 AND "Date" = $2;
      `;
      
      const checkResult = await pool.query(checkQuery, [userId, date]);
      
      if (checkResult.rows.length > 0) {
        // Update existing record
        const updateQuery = `
          UPDATE "Balance_Summary" 
          SET 
            "Total_Expense" = "Total_Expense" + $3,
            "Total_Balance" = "Total_Balance" - $3
          WHERE "UserID" = $1 AND "Date" = $2
          RETURNING *;
        `;
        
        const updateResult = await pool.query(updateQuery, [userId, date, amount]);
        console.log('Balance updated:', updateResult.rows[0]);
        return updateResult.rows[0];
      } else {
        // Insert new record
        const insertQuery = `
          INSERT INTO "Balance_Summary" 
          ("UserID", "Date", "Total_Income", "Total_Expense", "Total_Balance")
          VALUES ($1, $2, 0, $3, -$3)
          RETURNING *;
        `;
        
        const insertResult = await pool.query(insertQuery, [userId, date, amount]);
        console.log('New balance record created:', insertResult.rows[0]);
        return insertResult.rows[0];
      }
    } catch (error) {
      console.error('❌ Error updating balance:', error);
      throw error;
    }
  }
}

export default Expense;