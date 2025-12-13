import { pool } from '../db.js';

export const getDashboardData = async (req, res) => {
  try {
    const { year, month, type } = req.query;
    const userId = req.user.id;

    const now = new Date();
    const finalYear = year || now.getFullYear();
    const finalMonth = month || now.getMonth() + 1;

    console.log(`Dashboard request: userId=${userId}, year=${finalYear}, month=${finalMonth}, type=${type}`);

    // ✅ FIXED: Different tables and columns for business vs personal
    const isBusiness = type === "business";
    
    const incomeTable = isBusiness ? '"Income_Busi"' : '"Income"';
    const expenseTable = isBusiness ? '"Expenses_Busi"' : '"Expenses"';
    
    const incomeDateCol = isBusiness ? '"Busi_In_Date"' : '"In_Date"';
    const incomeAmountCol = isBusiness ? '"Busi_Total_Amount"' : '"In_Amount"';
    
    const expenseDateCol = isBusiness ? '"Busi_Ex_Date"' : '"Ex_Date"';
    const expenseAmountCol = isBusiness ? '"Busi_Ex_Amount"' : '"Ex_Amount"';
    const categoryColumn = isBusiness ? '"Busi_Ex_Category"' : '"Category"';

    // 1. TOTAL INCOME
    const incomeQuery = `
      SELECT COALESCE(SUM(${incomeAmountCol}), 0) AS total_income
      FROM ${incomeTable}
      WHERE "UserID" = $1
      AND EXTRACT(YEAR FROM ${incomeDateCol}) = $2
      AND EXTRACT(MONTH FROM ${incomeDateCol}) = $3
    `;
    const incomeResult = await pool.query(incomeQuery, [userId, finalYear, finalMonth]);
    const totalIncome = parseFloat(incomeResult.rows[0].total_income);

    // 2. TOTAL EXPENSES
    const expensesQuery = `
      SELECT COALESCE(SUM(${expenseAmountCol}), 0) AS total_expenses
      FROM ${expenseTable}
      WHERE "UserID" = $1
      AND EXTRACT(YEAR FROM ${expenseDateCol}) = $2
      AND EXTRACT(MONTH FROM ${expenseDateCol}) = $3
    `;
    const expensesResult = await pool.query(expensesQuery, [userId, finalYear, finalMonth]);
    const totalExpenses = parseFloat(expensesResult.rows[0].total_expenses);

    // 3. GROUP EXPENSES BY CATEGORY
    const categoryQuery = `
      SELECT 
        ${categoryColumn} AS category,
        SUM(${expenseAmountCol}) AS total_amount
      FROM ${expenseTable}
      WHERE "UserID" = $1
      AND EXTRACT(YEAR FROM ${expenseDateCol}) = $2
      AND EXTRACT(MONTH FROM ${expenseDateCol}) = $3
      AND ${categoryColumn} IS NOT NULL
      GROUP BY ${categoryColumn}
      ORDER BY total_amount DESC
    `;
    const categoryResult = await pool.query(categoryQuery, [userId, finalYear, finalMonth]);

    // 4. COLORS
    const businessColors = {
      "Factory Rent": "#D30000",
      "Employees Salary": "#00B600",
      "Investment": "#EFB506",
      "Material Procurement": "#125607",
      "Training": "#000000",
      "Maintainence": "#808080"
    };

    const personalColors = {
      "Entertainment": "#FF6B6B",
      "Food": "#4ECDC4",
      "Travel": "#45B7D1",
      "Utilities": "#96CEB4",
      "Shopping": "#A8E6CF",
      "Health": "#FFD93D"
    };

    const colorMap = isBusiness ? businessColors : personalColors;
    const defaultColors = ['#00441B', '#006D2C', '#238845', '#41AB5D', '#74C476', '#A1D99B'];

    // 5. CATEGORY BREAKDOWN (chart)
    const expensesByCategory = categoryResult.rows.map((row, index) => ({
      name: row.category || "Other",
      value: parseFloat(row.total_amount),
      color: colorMap[row.category] || defaultColors[index % defaultColors.length],
      percentage: totalExpenses > 0
        ? Math.round((parseFloat(row.total_amount) / totalExpenses) * 100)
        : 0
    }));

    console.log(`Found ${expensesByCategory.length} categories, total: Rs. ${totalExpenses}`);

    // 6. RESPONSE
    return res.json({
      success: true,
      data: {
        expenses: expensesByCategory,
        incomes: [],
        totals: {
          totalIncome,
          totalExpenses,
          totalBalance: totalIncome - totalExpenses
        },
        categories: expensesByCategory,
        year: finalYear,
        month: finalMonth
      }
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Server Error",
      details: error.message 
    });
  }
};