// controllers/reportController.js
const db = require('../config/db');

exports.getFinancialReport = async (req, res) => {
  const { user_id } = req.params;
  const { start_date, end_date, filter } = req.query;

  if (!start_date || !end_date) {
    return res.status(400).json({ error: 'Start and end dates are required' });
  }

  // Adjust date range based on filter if provided (optional)
  let adjustedStartDate = start_date;
  let adjustedEndDate = end_date;
  if (filter && !start_date && !end_date) {
    const now = new Date();
    if (filter === 'Weekly') {
      adjustedStartDate = new Date(now.setDate(now.getDate() - now.getDay())).toISOString().slice(0, 10);
      adjustedEndDate = new Date(now.setDate(now.getDate() + 6)).toISOString().slice(0, 10);
    } else if (filter === 'Yearly') {
      adjustedStartDate = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
      adjustedEndDate = new Date(now.getFullYear(), 11, 31).toISOString().slice(0, 10);
    } else { // Monthly
      adjustedStartDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      adjustedEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    }
  }

  try {
    // Query for transactions summary
    const transactionQuery = `
      SELECT 
        type,
        category,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count
      FROM transactions
      WHERE user_id = $1 AND date BETWEEN $2 AND $3
      GROUP BY type, category
    `;

    // Query for budget
    const budgetQuery = `
      SELECT amount, start_date, end_date
      FROM budgets
      WHERE user_id = $1 
      ORDER BY start_date DESC LIMIT 1
    `;

    // Query for total spending
    const spendingQuery = `
      SELECT COALESCE(SUM(amount), 0) as total_spent
      FROM transactions
      WHERE user_id = $1 AND type = 'expense' AND date BETWEEN $2 AND $3
    `;

    // Execute all queries
    const [transactionResult, budgetResult, spendingResult] = await Promise.all([
      db.query(transactionQuery, [user_id, adjustedStartDate, adjustedEndDate]),
      db.query(budgetQuery, [user_id]),
      db.query(spendingQuery, [user_id, adjustedStartDate, adjustedEndDate])
    ]);

    const transactionRows = transactionResult.rows;
    const budgetRow = budgetResult.rows[0];
    const spendingRow = spendingResult.rows[0];

    const report = {
      period: {
        start_date: adjustedStartDate,
        end_date: adjustedEndDate,
      },
      income: transactionRows.filter(r => r.type === 'income'),
      expenses: transactionRows.filter(r => r.type === 'expense'),
      totalIncome: transactionRows
        .filter(r => r.type === 'income')
        .reduce((sum, r) => sum + parseFloat(r.total_amount), 0),
      totalExpenses: transactionRows
        .filter(r => r.type === 'expense')
        .reduce((sum, r) => sum + parseFloat(r.total_amount), 0),
      budget: budgetRow || { amount: 0, start_date: null, end_date: null },
      currentSpending: parseFloat(spendingRow?.total_spent || 0),
    };

    res.json(report);
  } catch (err) {
    console.error('Report generation error:', err);
    res.status(500).json({ error: err.message });
  }
};
