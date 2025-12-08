import pool from '../db.js';

// @desc    Add new income
// @route   POST /api/income
export const addIncome = async (req, res) => {
  console.log('📝 Add Income Request:', req.body);
  
  try {
    const { name, amount, date } = req.body;

    // Validation
    if (!name || !amount || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, amount, date'
      });
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    // Get the first user from database
    const userResult = await pool.query('SELECT "UserID" FROM "Users" ORDER BY "UserID" LIMIT 1');
    
    if (userResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No users found. Please register first.'
      });
    }

    const userId = userResult.rows[0].UserID;
    
    console.log(`💰 Creating income for UserID: ${userId}`);

    // Insert income
    const incomeQuery = `
      INSERT INTO "Income" 
      ("UserID", "In_Name", "In_Date", "In_Amount")
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    
    const values = [
      userId,
      name,
      date,
      parseFloat(amount)
    ];

    console.log('🔍 SQL Query:', incomeQuery);
    console.log('🔍 Values:', values);

    const incomeResult = await pool.query(incomeQuery, values);
    const newIncome = incomeResult.rows[0];

    console.log('✅ Income inserted successfully:', newIncome);

    // Update balance summary
    try {
      const balanceQuery = `
        INSERT INTO "Balance_Summary" 
        ("UserID", "Date", "Total_Income", "Total_Expense", "Total_Balance")
        VALUES ($1, $2, $3, 0, $3)
        ON CONFLICT ("UserID", "Date") DO UPDATE SET
          "Total_Income" = "Balance_Summary"."Total_Income" + EXCLUDED."Total_Income",
          "Total_Balance" = "Balance_Summary"."Total_Balance" + EXCLUDED."Total_Income"
        RETURNING *;
      `;
      
      await pool.query(balanceQuery, [userId, date, parseFloat(amount)]);
      console.log('✅ Balance summary updated');
    } catch (balanceError) {
      console.log('⚠️ Could not update balance summary:', balanceError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Income added successfully!',
      data: newIncome
    });

  } catch (error) {
    console.error('❌ Error adding income:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding income',
      error: error.message
    });
  }
};

// @desc    Get all income for user
// @route   GET /api/income
export const getIncome = async (req, res) => {
  console.log('📋 Get Income Request');
  
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
    
    console.log(`📊 Fetching income for UserID: ${userId}`);

    const query = `
      SELECT 
        "IncomeID",
        "In_Name",
        "In_Date",
        "In_Amount",
        "UserID"
      FROM "Income" 
      WHERE "UserID" = $1 
      ORDER BY "In_Date" DESC 
      LIMIT 50;
    `;
    
    const result = await pool.query(query, [userId]);

    console.log(`📊 Found ${result.rows.length} income records for user ${userId}`);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('❌ Error getting income:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching income',
      error: error.message
    });
  }
};

// @desc    Delete income
// @route   DELETE /api/income/:id
export const deleteIncome = async (req, res) => {
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

    // Check if income exists
    const incomeCheck = await pool.query(
      'SELECT "In_Amount", "In_Date" FROM "Income" WHERE "IncomeID" = $1 AND "UserID" = $2',
      [id, userId]
    );

    if (incomeCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Income not found'
      });
    }

    // Delete income
    await pool.query(
      'DELETE FROM "Income" WHERE "IncomeID" = $1 AND "UserID" = $2',
      [id, userId]
    );

    // Update balance (subtract the amount since income is deleted)
    const amount = parseFloat(incomeCheck.rows[0].In_Amount);
    const date = incomeCheck.rows[0].In_Date;
    
    try {
      const balanceQuery = `
        UPDATE "Balance_Summary" 
        SET 
          "Total_Income" = "Total_Income" - $3,
          "Total_Balance" = "Total_Balance" - $3
        WHERE "UserID" = $1 AND "Date" = $2;
      `;
      
      await pool.query(balanceQuery, [userId, date, amount]);
    } catch (balanceError) {
      console.log('⚠️ Could not update balance on delete:', balanceError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Income deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting income:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting income',
      error: error.message
    });
  }
};

// @desc    Get financial summary
// @route   GET /api/summary
export const getFinancialSummary = async (req, res) => {
  try {
    // Get the first user from database
    const userResult = await pool.query('SELECT "UserID" FROM "Users" ORDER BY "UserID" LIMIT 1');
    
    if (userResult.rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalIncome: 0,
          totalExpenses: 0,
          balance: 0,
          currentMonth: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
        }
      });
    }

    const userId = userResult.rows[0].UserID;
    
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Calculate total income for current month
    const incomeQuery = `
      SELECT COALESCE(SUM("In_Amount"), 0) as total_income
      FROM "Income"
      WHERE "UserID" = $1 
        AND EXTRACT(MONTH FROM "In_Date") = $2
        AND EXTRACT(YEAR FROM "In_Date") = $3
    `;
    
    const incomeResult = await pool.query(incomeQuery, [userId, currentMonth, currentYear]);
    const totalIncome = parseFloat(incomeResult.rows[0].total_income);
    
    // Calculate total expenses for current month
    const expenseQuery = `
      SELECT COALESCE(SUM("Ex_Amount"), 0) as total_expenses
      FROM "Expenses"
      WHERE "UserID" = $1 
        AND EXTRACT(MONTH FROM "Ex_Date") = $2
        AND EXTRACT(YEAR FROM "Ex_Date") = $3
    `;
    
    const expenseResult = await pool.query(expenseQuery, [userId, currentMonth, currentYear]);
    const totalExpenses = parseFloat(expenseResult.rows[0].total_expenses);
    
    // Calculate balance
    const balance = totalIncome - totalExpenses;
    
    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        balance,
        currentMonth: now.toLocaleString('default', { month: 'long', year: 'numeric' })
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting financial summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching financial summary',
      error: error.message
    });
  }
};