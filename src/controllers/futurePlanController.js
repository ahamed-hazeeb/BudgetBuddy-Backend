
const FuturePlan = require('../models/futurePlanModel');
const Model = require('../models/modelModel');


exports.addFuturePlan = (req, res) => {
    const { user_id, goal_name, target_amount, current_savings, target_date } = req.body;
  
    Model.trainFuturePlanModel(user_id, (err) => {
      if (err) console.log('Training failed:', err); // Log but proceed
  
      Model.predictMonthlySavings(user_id, target_amount, current_savings, target_date, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
  
        FuturePlan.addFuturePlan(
          user_id,
          goal_name,
          target_amount,
          current_savings,
          target_date,
          result.monthly_savings,
          (err, plan) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({
              message: result.message,
              plan,
              feasible: result.feasible
            });
          }
        );
      });
    });
  };


exports.getFuturePlans = (req, res) => {
    const { user_id } = req.params;

    FuturePlan.getFuturePlans(user_id, (err, plans) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(plans);
    });
};

exports.deleteFuturePlan = (req, res) => {
    const planId = req.params.id;
    const userId = req.user_id; // From authMiddleware
  
    FuturePlan.deleteFuturePlan(planId, userId, (err) => { // Pass userId for validation
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json({ message: 'Plan deleted successfully' });
    });
  };