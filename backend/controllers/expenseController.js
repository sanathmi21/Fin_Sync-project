import pool from '../db.js';

// @desc    Add new expense
// @route   POST /api/expenses
export const addExpense = async (req, res) => {
  console.log('📝 Add Expense Request:', req.body);
  
  try {
    const { name, category, amount, date, description, highPriority } = req.body;

    // Validation
    if (!name || !category || !amount || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, category, amount, date'
      });
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    // Get the first user from database (for testing)
    const userResult = await pool.query('SELECT "UserID" FROM "Users" ORDER BY "UserID" LIMIT 1');
    
    if (userResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No users found. Please register first.'
      });
    }

    const userId = userResult.rows[0].UserID;
    
    console.log(`💰 Creating expense for UserID: ${userId}`);

    // Insert expense
    const expenseQuery = `
      INSERT INTO "Expenses" 
      ("UserID", "Ex_Name", "Category", "Ex_Amount", "Ex_Date", "Description", "HighPriority")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    
    const values = [
      userId,
      name,
      category,
      parseFloat(amount),
      date,
      description || '',
      highPriority || false
    ];

    console.log('🔍 SQL Query:', expenseQuery);
    console.log('🔍 Values:', values);

    const expenseResult = await pool.query(expenseQuery, values);
    const newExpense = expenseResult.rows[0];

    console.log('✅ Expense inserted successfully:', newExpense);

    // Try to update balance summary (optional)
    try {
      const balanceQuery = `
        INSERT INTO "Balance_Summary" 
        ("UserID", "Date", "Total_Income", "Total_Expense", "Total_Balance")
        VALUES ($1, $2, 0, $3, -$3)
        ON CONFLICT ("UserID", "Date") DO UPDATE SET
          "Total_Expense" = "Balance_Summary"."Total_Expense" + EXCLUDED."Total_Expense",
          "Total_Balance" = "Balance_Summary"."Total_Balance" - EXCLUDED."Total_Expense"
        RETURNING *;
      `;
      
      await pool.query(balanceQuery, [userId, date, parseFloat(amount)]);
      console.log('✅ Balance summary updated');
    } catch (balanceError) {
      console.log('⚠️ Could not update balance summary:', balanceError.message);
      // Continue anyway - balance update is optional
    }

    res.status(201).json({
      success: true,
      message: 'Expense added successfully!',
      data: newExpense
    });

  } catch (error) {
    console.error('❌ Error adding expense:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding expense',
      error: error.message
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the first user from database
    const userResult = await pool.query('SELECT "UserID" FROM "Users" ORDER BY "UserID" LIMIT 1');
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userId = userResult.rows[0].UserID;

    // Check if expense exists
    const expenseCheck = await pool.query(
      'SELECT "Ex_Amount", "Ex_Date" FROM "Expenses" WHERE "ExpenseID" = $1 AND "UserID" = $2',
      [id, userId]
    );

    if (expenseCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Delete expense
    await pool.query(
      'DELETE FROM "Expenses" WHERE "ExpenseID" = $1 AND "UserID" = $2',
      [id, userId]
    );

    // Update balance (add back the amount since expense is deleted)
    const amount = parseFloat(expenseCheck.rows[0].Ex_Amount);
    const date = expenseCheck.rows[0].Ex_Date;
    
    try {
      const balanceQuery = `
        UPDATE "Balance_Summary" 
        SET 
          "Total_Expense" = "Total_Expense" - $3,
          "Total_Balance" = "Total_Balance" + $3
        WHERE "UserID" = $1 AND "Date" = $2;
      `;
      
      await pool.query(balanceQuery, [userId, date, amount]);
    } catch (balanceError) {
      console.log('⚠️ Could not update balance on delete:', balanceError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting expense:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting expense',
      error: error.message
    });
  }
};

// @desc    Get all expenses for user
// @route   GET /api/expenses
export const getExpenses = async (req, res) => {
  console.log('📋 Get Expenses Request');
  
  try {
    // Get the first user from database
    const userResult = await pool.query('SELECT "UserID" FROM "Users" ORDER BY "UserID" LIMIT 1');
    
    if (userResult.rows.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const userId = userResult.rows[0].UserID;
    
    console.log(`📊 Fetching expenses for UserID: ${userId}`);

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
      WHERE "UserID" = $1 
      ORDER BY "Ex_Date" DESC 
      LIMIT 50;
    `;
    
    const result = await pool.query(query, [userId]);

    console.log(`📊 Found ${result.rows.length} expenses for user ${userId}`);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('❌ Error getting expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expenses',
      error: error.message
    });
  }
};

// @desc    Get high priority expenses
// @route   GET /api/expenses/high-priority
export const getHighPriorityExpenses = async (req, res) => {
  try {
    // Get the first user from database
    const userResult = await pool.query('SELECT "UserID" FROM "Users" ORDER BY "UserID" LIMIT 1');
    
    if (userResult.rows.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const userId = userResult.rows[0].UserID;

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

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('❌ Error getting high priority expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching high priority expenses'
    });
  }

};