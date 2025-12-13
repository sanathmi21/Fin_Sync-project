import { pool } from '../db.js';

class IncomeBusiness {
  // Get all business income for a user
  static async getAllByUser(userId) {
    try {
      const query = `
        SELECT * FROM "Income_Busi"
        WHERE "UserID" = $1
        ORDER BY "Busi_In_Date" DESC
      `;
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error in IncomeBusiness.getAllByUser:', error);
      throw new Error('Failed to fetch business income');
    }
  }

  // Get total business income for a specific month
  static async getTotalByMonth(userId, month, year) {
    try {
      const query = `
        SELECT COALESCE(SUM("Busi_Total_Amount"), 0) as total
        FROM "Income_Busi"
        WHERE "UserID" = $1
          AND EXTRACT(MONTH FROM "Busi_In_Date") = $2
          AND EXTRACT(YEAR FROM "Busi_In_Date") = $3
      `;
      const result = await pool.query(query, [userId, month, year]);
      return parseFloat(result.rows[0].total);
    } catch (error) {
      console.error('Error in IncomeBusiness.getTotalByMonth:', error);
      throw new Error('Failed to get total business income');
    }
  }

  // Get business income for a specific month
  static async getByMonth(userId, month, year) {
    try {
      const query = `
        SELECT * FROM "Income_Busi"
        WHERE "UserID" = $1
          AND EXTRACT(MONTH FROM "Busi_In_Date") = $2
          AND EXTRACT(YEAR FROM "Busi_In_Date") = $3
        ORDER BY "Busi_In_Date" DESC
      `;
      const result = await pool.query(query, [userId, month, year]);
      return result.rows;
    } catch (error) {
      console.error('Error in IncomeBusiness.getByMonth:', error);
      throw new Error('Failed to fetch business income by month');
    }
  }

  // Get business income statistics for a month
  static async getStatistics(userId, month, year) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_entries,
          COALESCE(SUM("Busi_Total_Amount"), 0) as total_amount,
          COALESCE(AVG("Busi_Total_Amount"), 0) as average_amount,
          COALESCE(MAX("Busi_Total_Amount"), 0) as max_amount,
          COALESCE(MIN("Busi_Total_Amount"), 0) as min_amount
        FROM "Income_Busi"
        WHERE "UserID" = $1
          AND EXTRACT(MONTH FROM "Busi_In_Date") = $2
          AND EXTRACT(YEAR FROM "Busi_In_Date") = $3
      `;
      const result = await pool.query(query, [userId, month, year]);
      return {
        total_entries: parseInt(result.rows[0].total_entries),
        total_amount: parseFloat(result.rows[0].total_amount),
        average_amount: parseFloat(result.rows[0].average_amount),
        max_amount: parseFloat(result.rows[0].max_amount),
        min_amount: parseFloat(result.rows[0].min_amount)
      };
    } catch (error) {
      console.error('Error in IncomeBusiness.getStatistics:', error);
      throw new Error('Failed to get business income statistics');
    }
  }

  // Create new business income
  static async create(incomeData) {
    try {
      const query = `
        INSERT INTO "Income_Busi" 
        ("UserID", "Busi_In_Date", "Busi_Unit_Amount", "Quantity", "Busi_Total_Amount")
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const values = [
        incomeData.UserID,
        incomeData.Busi_In_Date,
        incomeData.Busi_Unit_Amount,
        incomeData.Quantity,
        incomeData.Busi_Total_Amount
      ];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error in IncomeBusiness.create:', error);
      throw new Error('Failed to create business income');
    }
  }

  // Delete business income
  static async delete(incomeId, userId) {
    try {
      const query = `
        DELETE FROM "Income_Busi"
        WHERE "IncomeBID" = $1 AND "UserID" = $2
        RETURNING *
      `;
      const result = await pool.query(query, [incomeId, userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Business income not found or unauthorized');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in IncomeBusiness.delete:', error);
      throw error;
    }
  }

  // Update business income
  static async update(incomeId, userId, updateData) {
    try {
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (updateData.Busi_In_Date !== undefined) {
        updates.push(`"Busi_In_Date" = $${paramCount++}`);
        values.push(updateData.Busi_In_Date);
      }
      if (updateData.Busi_Unit_Amount !== undefined) {
        updates.push(`"Busi_Unit_Amount" = $${paramCount++}`);
        values.push(updateData.Busi_Unit_Amount);
      }
      if (updateData.Quantity !== undefined) {
        updates.push(`"Quantity" = $${paramCount++}`);
        values.push(updateData.Quantity);
      }
      if (updateData.Busi_Total_Amount !== undefined) {
        updates.push(`"Busi_Total_Amount" = $${paramCount++}`);
        values.push(updateData.Busi_Total_Amount);
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(incomeId, userId);

      const query = `
        UPDATE "Income_Busi"
        SET ${updates.join(', ')}
        WHERE "IncomeBID" = $${paramCount++} AND "UserID" = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Business income not found or unauthorized');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in IncomeBusiness.update:', error);
      throw error;
    }
  }
}

export default IncomeBusiness;