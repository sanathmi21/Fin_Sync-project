import pool from '../db.js';

class Income {
  // Get all income for a user
  static async getAllByUser(userId, limit = 50) {
    const query = `
      SELECT 
        "IncomeID",
        "In_Name",
        "In_Date",
        "In_Amount"
      FROM "Income" 
      WHERE "UserID" = $1 
      ORDER BY "In_Date" DESC 
      LIMIT $2;
    `;
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  // Get income by ID
  static async getById(incomeId, userId) {
    const query = `
      SELECT 
        "IncomeID",
        "In_Name",
        "In_Date",
        "In_Amount",
        "UserID"
      FROM "Income" 
      WHERE "IncomeID" = $1 AND "UserID" = $2;
    `;
    const result = await pool.query(query, [incomeId, userId]);
    return result.rows[0];
  }

  // Create new income
  static async create(incomeData) {
    const {
      UserID,
      In_Name,
      In_Date,
      In_Amount
    } = incomeData;

    // Validate required fields
    if (!UserID || !In_Name || !In_Date || !In_Amount) {
      throw new Error('Missing required fields: UserID, In_Name, In_Date, In_Amount');
    }

    // Validate amount
    if (isNaN(In_Amount) || parseFloat(In_Amount) <= 0) {
      throw new Error('Amount must be a positive number');
    }

    const query = `
      INSERT INTO "Income" 
      ("UserID", "In_Name", "In_Date", "In_Amount")
      VALUES ($1, $2, $3, $4)
      RETURNING 
        "IncomeID",
        "In_Name",
        "In_Date",
        "In_Amount",
        "UserID";
    `;
    
    const values = [
      UserID,
      In_Name,
      In_Date,
      parseFloat(In_Amount)
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update income
  static async update(incomeId, userId, updateData) {
    // First check if income exists
    const existingIncome = await this.getById(incomeId, userId);
    if (!existingIncome) {
      throw new Error('Income not found');
    }

    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic query based on provided fields
    if (updateData.In_Name !== undefined) {
      fields.push(`"In_Name" = $${paramCount}`);
      values.push(updateData.In_Name);
      paramCount++;
    }
    
    if (updateData.In_Date !== undefined) {
      fields.push(`"In_Date" = $${paramCount}`);
      values.push(updateData.In_Date);
      paramCount++;
    }
    
    if (updateData.In_Amount !== undefined) {
      if (isNaN(updateData.In_Amount) || parseFloat(updateData.In_Amount) <= 0) {
        throw new Error('Amount must be a positive number');
      }
      fields.push(`"In_Amount" = $${paramCount}`);
      values.push(parseFloat(updateData.In_Amount));
      paramCount++;
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    // Add WHERE clause parameters
    values.push(incomeId, userId);

    const query = `
      UPDATE "Income" 
      SET ${fields.join(', ')}
      WHERE "IncomeID" = $${paramCount} AND "UserID" = $${paramCount + 1}
      RETURNING 
        "IncomeID",
        "In_Name",
        "In_Date",
        "In_Amount",
        "UserID";
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete income
  static async delete(incomeId, userId) {
    const query = `
      DELETE FROM "Income" 
      WHERE "IncomeID" = $1 AND "UserID" = $2
      RETURNING *;
    `;

    const result = await pool.query(query, [incomeId, userId]);
    
    if (result.rows.length === 0) {
      throw new Error('Income not found');
    }
    
    return result.rows[0];
  }

  // Get total income for a user in a specific month/year
  static async getTotalByMonth(userId, month, year) {
    const query = `
      SELECT COALESCE(SUM("In_Amount"), 0) as total_income
      FROM "Income" 
      WHERE "UserID" = $1 
        AND EXTRACT(MONTH FROM "In_Date") = $2
        AND EXTRACT(YEAR FROM "In_Date") = $3;
    `;
    
    const result = await pool.query(query, [userId, month, year]);
    return parseFloat(result.rows[0].total_income);
  }

  // Get income statistics
  static async getStatistics(userId, month, year) {
    const query = `
      SELECT 
        COUNT(*) as total_count,
        SUM("In_Amount") as total_amount,
        AVG("In_Amount") as average_amount,
        MAX("In_Amount") as max_amount,
        MIN("In_Amount") as min_amount
      FROM "Income" 
      WHERE "UserID" = $1 
        AND EXTRACT(MONTH FROM "In_Date") = $2
        AND EXTRACT(YEAR FROM "In_Date") = $3;
    `;

    const result = await pool.query(query, [userId, month, year]);
    const stats = result.rows[0] || {
      total_count: 0,
      total_amount: 0,
      average_amount: 0,
      max_amount: 0,
      min_amount: 0
    };
    
    return {
      ...stats,
      total_amount: parseFloat(stats.total_amount),
      average_amount: parseFloat(stats.average_amount),
      max_amount: parseFloat(stats.max_amount),
      min_amount: parseFloat(stats.min_amount)
    };
  }

  // Search income
  static async search(userId, searchTerm) {
    const query = `
      SELECT 
        "IncomeID",
        "In_Name",
        "In_Date",
        "In_Amount"
      FROM "Income" 
      WHERE "UserID" = $1 
        AND "In_Name" ILIKE $2
      ORDER BY "In_Date" DESC
      LIMIT 50;
    `;
    
    const result = await pool.query(query, [userId, `%${searchTerm}%`]);
    return result.rows;
  }
}

export default Income;