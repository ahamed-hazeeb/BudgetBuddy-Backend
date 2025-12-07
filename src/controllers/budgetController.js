const BudgetModel = require('../models/budgetModel');

exports.setOverallBudget = (req, res) => {
  const { user_id, amount, start_date, end_date } = req.body;
  BudgetModel.setOverallBudget(user_id, amount, start_date, end_date, (err, budget) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(budget);
  });
};

exports.getOverallBudget = (req, res) => {
  const { user_id } = req.params;
  BudgetModel.getOverallBudget(user_id, (err, budget) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(budget || {});
  });
};

exports.getSpending = (req, res) => {
    const { user_id, start_date, end_date } = req.query;
    if (!user_id || !start_date || !end_date) {
      return res.status(400).json({ error: 'Missing required query parameters: user_id, start_date, end_date' });
    }
  
    BudgetModel.getSpending(user_id, start_date, end_date, (err, spending) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(spending);
    });
  };