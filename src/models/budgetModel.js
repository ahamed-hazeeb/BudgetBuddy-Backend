const db = require('../config/db');

class BudgetModel {
  // Add or update the overall monthly budget
  static setOverallBudget(user_id, amount, start_date, end_date, callback) {
    const query = `
      INSERT INTO budgets (user_id, amount, start_date, end_date, status) 
      VALUES ($1, $2, $3, $4, 'active')
      ON CONFLICT (user_id) 
      DO UPDATE SET amount = $2, start_date = $3, end_date = $4, status = 'active'
      RETURNING id
    `;
    
    db.query(query, [user_id, amount, start_date, end_date], (err, result) => {
      if (err) return callback(err);
      callback(null, { 
        id: result.rows[0]?.id, 
        user_id, 
        amount, 
        start_date, 
        end_date, 
        status: 'active' 
      });
    });
  }

  // Get the current overall budget
  static getOverallBudget(user_id, callback) {
    const query = 'SELECT * FROM budgets WHERE user_id = $1 ORDER BY start_date DESC LIMIT 1';
    
    db.query(query, [user_id], (err, result) => {
      if (err) return callback(err);
      callback(null, result.rows[0]);
    });
  }

  // Get spending for a date range
  static getSpending(user_id, start_date, end_date, callback) {
    const query = `
      SELECT COALESCE(SUM(amount), 0) as total_spent 
      FROM transactions 
      WHERE user_id = $1 AND type = 'expense' AND date BETWEEN $2 AND $3
    `;
    
    db.query(query, [user_id, start_date, end_date], (err, result) => {
      if (err) return callback(err);
      callback(null, [{ total_spent: result.rows[0].total_spent || 0 }]);
    });
  }
}

module.exports = BudgetModel;
