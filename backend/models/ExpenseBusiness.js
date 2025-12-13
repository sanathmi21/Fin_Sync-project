import { pool } from '../db.js';

class ExpenseBusiness {
  // Get all business expenses for a user
  static async getAllByUser(userId) {
    try {
      const query = `
        SELECT * FROM "Expenses_Busi"
        WHERE "UserID" = $1
        ORDER BY "Busi_Ex_Date" DESC
      `;
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error in ExpenseBusiness.getAllByUser:', error);
      throw new Error('Failed to fetch business expenses');
    }
  }

  // Get total business expenses for a specific month
  static async getTotalByMonth(userId, month, year) {
    try {
      const query = `
        SELECT COALESCE(SUM("Busi_Ex_Amount"), 0) as total
        FROM "Expenses_Busi"
        WHERE "UserID" = $1
          AND EXTRACT(MONTH FROM "Busi_Ex_Date") = $2
          AND EXTRACT(YEAR FROM "Busi_Ex_Date") = $3
      `;
      const result = await pool.query(query, [userId, month, year]);
      return parseFloat(result.rows[0].total);
    } catch (error) {
      console.error('Error in ExpenseBusiness.getTotalByMonth:', error);
      throw new Error('Failed to get total business expenses');
    }
  }

  // Get business expenses grouped by category for a month
  static async getByCategoryForMonth(userId, month, year) {
    try {
      const query = `
        SELECT 
          "Busi_Ex_Category" as category,
          COALESCE(SUM("Busi_Ex_Amount"), 0) as total_amount,
          COUNT(*) as count
        FROM "Expenses_Busi"
        WHERE "UserID" = $1
          AND EXTRACT(MONTH FROM "Busi_Ex_Date") = $2
          AND EXTRACT(YEAR FROM "Busi_Ex_Date") = $3
        GROUP BY "Busi_Ex_Category"
        ORDER BY total_amount DESC
      `;
      const result = await pool.query(query, [userId, month, year]);
      return result.rows.map(row => ({
        category: row.category,
        total_amount: parseFloat(row.total_amount),
        count: parseInt(row.count)
      }));
    } catch (error) {
      console.error('Error in ExpenseBusiness.getByCategoryForMonth:', error);
      throw new Error('Failed to get business expenses by category');
    }
  }

  // Get business expenses for a specific month
  static async getByMonth(userId, month, year) {
    try {
      const query = `
        SELECT * FROM "Expenses_Busi"
        WHERE "UserID" = $1
          AND EXTRACT(MONTH FROM "Busi_Ex_Date") = $2
          AND EXTRACT(YEAR FROM "Busi_Ex_Date") = $3
        ORDER BY "Busi_Ex_Date" DESC
      `;
      const result = await pool.query(query, [userId, month, year]);
      return result.rows;
    } catch (error) {
      console.error('Error in ExpenseBusiness.getByMonth:', error);
      throw new Error('Failed to fetch business expenses by month');
    }
  }

  // Create new business expense
  static async create(expenseData) {
    try {
      const query = `
        INSERT INTO "Expenses_Busi" 
        ("UserID", "Busi_Ex_Date", "Busi_Ex_Category", "Busi_Ex_Name", "Busi_Ex_Amount")
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const values = [
        expenseData.UserID,
        expenseData.Busi_Ex_Date,
        expenseData.Busi_Ex_Category,
        expenseData.Busi_Ex_Name,
        expenseData.Busi_Ex_Amount
      ];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error in ExpenseBusiness.create:', error);
      throw new Error('Failed to create business expense');
    }
  }

  // Delete business expense
  static async delete(expenseId, userId) {
    try {
      const query = `
        DELETE FROM "Expenses_Busi"
        WHERE "ExpenseBID" = $1 AND "UserID" = $2
        RETURNING *
      `;
      const result = await pool.query(query, [expenseId, userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Business expense not found or unauthorized');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in ExpenseBusiness.delete:', error);
      throw error;
    }
  }

  // Update business expense
  static async update(expenseId, userId, updateData) {
    try {
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (updateData.Busi_Ex_Name !== undefined) {
        updates.push(`"Busi_Ex_Name" = $${paramCount++}`);
        values.push(updateData.Busi_Ex_Name);
      }
      if (updateData.Busi_Ex_Category !== undefined) {
        updates.push(`"Busi_Ex_Category" = $${paramCount++}`);
        values.push(updateData.Busi_Ex_Category);
      }
      if (updateData.Busi_Ex_Amount !== undefined) {
        updates.push(`"Busi_Ex_Amount" = $${paramCount++}`);
        values.push(updateData.Busi_Ex_Amount);
      }
      if (updateData.Busi_Ex_Date !== undefined) {
        updates.push(`"Busi_Ex_Date" = $${paramCount++}`);
        values.push(updateData.Busi_Ex_Date);
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(expenseId, userId);

      const query = `
        UPDATE "Expenses_Busi"
        SET ${updates.join(', ')}
        WHERE "ExpenseBID" = $${paramCount++} AND "UserID" = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Business expense not found or unauthorized');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in ExpenseBusiness.update:', error);
      throw error;
    }
  }
}

export default ExpenseBusiness;