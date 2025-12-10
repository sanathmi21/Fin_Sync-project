import pool from '../db.js';

class Expense {
  // Get all expenses for a user
  static async getAllByUser(userId, limit = 50) {
    const query = `
      SELECT 
        "ExpenseID",
        "Ex_Name",
        "Category",
        "Ex_Amount",
        "Ex_Date",
        "Description",
        "HighPriority"
      FROM "Expenses" 
      WHERE "UserID" = $1 
      ORDER BY "Ex_Date" DESC 
      LIMIT $2;
    `;
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  // Get expense by ID
  static async getById(expenseId, userId) {
    const query = `
      SELECT 
        "ExpenseID",
        "Ex_Name",
        "Category",
        "Ex_Amount",
        "Ex_Date",
        "Description",
        "HighPriority",
        "UserID"
      FROM "Expenses" 
      WHERE "ExpenseID" = $1 AND "UserID" = $2;
    `;
    const result = await pool.query(query, [expenseId, userId]);
    return result.rows[0];
  }

  // Get high priority expenses
  static async getHighPriority(userId) {
    const query = `
      SELECT 
        "ExpenseID",
        "Ex_Name",
        "Category",
        "Ex_Amount",
        "Ex_Date",
        "Description",
        "HighPriority"
      FROM "Expenses" 
      WHERE "UserID" = $1 AND "HighPriority" = true
      ORDER BY "Ex_Date" DESC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Create new expense
  static async create(expenseData) {
    const {
      UserID,
      Ex_Name,
      Category,
      Ex_Amount,
      Ex_Date,
      Description = '',
      HighPriority = false
    } = expenseData;

    // Validate required fields
    if (!UserID || !Ex_Name || !Category || !Ex_Amount || !Ex_Date) {
      throw new Error('Missing required fields: UserID, Ex_Name, Category, Ex_Amount, Ex_Date');
    }

    // Validate amount
    if (isNaN(Ex_Amount) || parseFloat(Ex_Amount) <= 0) {
      throw new Error('Amount must be a positive number');
    }

    const query = `
      INSERT INTO "Expenses" 
      ("UserID", "Ex_Name", "Category", "Ex_Amount", "Ex_Date", "Description", "HighPriority")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        "ExpenseID",
        "Ex_Name",
        "Category",
        "Ex_Amount",
        "Ex_Date",
        "Description",
        "HighPriority",
        "UserID";
    `;
    
    const values = [
      UserID,
      Ex_Name,
      Category,
      parseFloat(Ex_Amount),
      Ex_Date,
      Description,
      HighPriority
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update expense
  static async update(expenseId, userId, updateData) {
    // First check if expense exists
    const existingExpense = await this.getById(expenseId, userId);
    if (!existingExpense) {
      throw new Error('Expense not found');
    }

    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic query based on provided fields
    if (updateData.Ex_Name !== undefined) {
      fields.push(`"Ex_Name" = $${paramCount}`);
      values.push(updateData.Ex_Name);
      paramCount++;
    }
    
    if (updateData.Category !== undefined) {
      fields.push(`"Category" = $${paramCount}`);
      values.push(updateData.Category);
      paramCount++;
    }
    
    if (updateData.Ex_Amount !== undefined) {
      if (isNaN(updateData.Ex_Amount) || parseFloat(updateData.Ex_Amount) <= 0) {
        throw new Error('Amount must be a positive number');
      }
      fields.push(`"Ex_Amount" = $${paramCount}`);
      values.push(parseFloat(updateData.Ex_Amount));
      paramCount++;
    }
    
    if (updateData.Ex_Date !== undefined) {
      fields.push(`"Ex_Date" = $${paramCount}`);
      values.push(updateData.Ex_Date);
      paramCount++;
    }
    
    if (updateData.Description !== undefined) {
      fields.push(`"Description" = $${paramCount}`);
      values.push(updateData.Description);
      paramCount++;
    }
    
    if (updateData.HighPriority !== undefined) {
      fields.push(`"HighPriority" = $${paramCount}`);
      values.push(updateData.HighPriority);
      paramCount++;
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    // Add WHERE clause parameters
    values.push(expenseId, userId);

    const query = `
      UPDATE "Expenses" 
      SET ${fields.join(', ')}
      WHERE "ExpenseID" = $${paramCount} AND "UserID" = $${paramCount + 1}
      RETURNING 
        "ExpenseID",
        "Ex_Name",
        "Category",
        "Ex_Amount",
        "Ex_Date",
        "Description",
        "HighPriority",
        "UserID";
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete expense
  static async delete(expenseId, userId) {
    const query = `
      DELETE FROM "Expenses" 
      WHERE "ExpenseID" = $1 AND "UserID" = $2
      RETURNING *;
    `;

    const result = await pool.query(query, [expenseId, userId]);
    
    if (result.rows.length === 0) {
      throw new Error('Expense not found');
    }
    
    return result.rows[0];
  }

  // Get total expenses for a user in a specific month/year
  static async getTotalByMonth(userId, month, year) {
    const query = `
      SELECT COALESCE(SUM("Ex_Amount"), 0) as total_expenses
      FROM "Expenses" 
      WHERE "UserID" = $1 
        AND EXTRACT(MONTH FROM "Ex_Date") = $2
        AND EXTRACT(YEAR FROM "Ex_Date") = $3;
    `;
    
    const result = await pool.query(query, [userId, month, year]);
    return parseFloat(result.rows[0].total_expenses);
  }

  // Get expenses grouped by category for a month
  static async getByCategoryForMonth(userId, month, year) {
    const query = `
      SELECT 
        "Category",
        COUNT(*) as count,
        SUM("Ex_Amount") as total_amount
      FROM "Expenses" 
      WHERE "UserID" = $1 
        AND EXTRACT(MONTH FROM "Ex_Date") = $2
        AND EXTRACT(YEAR FROM "Ex_Date") = $3
      GROUP BY "Category"
      ORDER BY total_amount DESC;
    `;
    
    const result = await pool.query(query, [userId, month, year]);
    return result.rows;
  }

  // Get recent expenses (last N days)
  static async getRecent(userId, days = 30) {
    const query = `
      SELECT 
        "ExpenseID",
        "Ex_Name",
        "Category",
        "Ex_Amount",
        "Ex_Date",
        "Description",
        "HighPriority"
      FROM "Expenses" 
      WHERE "UserID" = $1 
        AND "Ex_Date" >= CURRENT_DATE - INTERVAL '${days} days'
      ORDER BY "Ex_Date" DESC;
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Search expenses
  static async search(userId, searchTerm) {
    const query = `
      SELECT 
        "ExpenseID",
        "Ex_Name",
        "Category",
        "Ex_Amount",
        "Ex_Date",
        "Description",
        "HighPriority"
      FROM "Expenses" 
      WHERE "UserID" = $1 
        AND (
          "Ex_Name" ILIKE $2 
          OR "Category" ILIKE $2 
          OR "Description" ILIKE $2
        )
      ORDER BY "Ex_Date" DESC
      LIMIT 50;
    `;
    
    const result = await pool.query(query, [userId, `%${searchTerm}%`]);
    return result.rows;
  }
}

export default Expense;