// controllers/reportController.js
const db = require('../config/db');

exports.getFinancialReport = (req, res) => {
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

  // Query for transactions summary
  const transactionQuery = `
    SELECT 
      type,
      category,
      SUM(amount) as total_amount,
      COUNT(*) as transaction_count
    FROM transactions
    WHERE user_id = ? AND date BETWEEN ? AND ?
    GROUP BY type, category
  `;

  // Query for budget
  const budgetQuery = `
    SELECT amount, start_date, end_date
    FROM budgets
    WHERE user_id = ? 
    ORDER BY start_date DESC LIMIT 1
  `;

  // Query for total spending (consistent with getSpending)
  const spendingQuery = `
    SELECT SUM(amount) as total_spent
    FROM transactions
    WHERE user_id = ? AND type = 'expense' AND date BETWEEN ? AND ?
  `;

  db.serialize(() => {
    // Get transactions
    db.all(transactionQuery, [user_id, adjustedStartDate, adjustedEndDate], (err, transactionRows) => {
      if (err) return res.status(500).json({ error: err.message });

      // Get budget
      db.get(budgetQuery, [user_id], (err, budgetRow) => {
        if (err) return res.status(500).json({ error: err.message });

        // Get spending
        db.get(spendingQuery, [user_id, adjustedStartDate, adjustedEndDate], (err, spendingRow) => {
          if (err) return res.status(500).json({ error: err.message });

          const report = {
            period: {
              start_date: adjustedStartDate,
              end_date: adjustedEndDate,
            },
            income: transactionRows.filter(r => r.type === 'income'),
            expenses: transactionRows.filter(r => r.type === 'expense'),
            totalIncome: transactionRows
              .filter(r => r.type === 'income')
              .reduce((sum, r) => sum + r.total_amount, 0),
            totalExpenses: transactionRows
              .filter(r => r.type === 'expense')
              .reduce((sum, r) => sum + r.total_amount, 0),
            budget: budgetRow || { amount: 0, start_date: null, end_date: null },
            currentSpending: spendingRow?.total_spent || 0,
          };

          res.json(report);
        });
      });
    });
  });
};