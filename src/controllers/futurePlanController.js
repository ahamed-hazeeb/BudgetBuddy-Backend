const FuturePlan = require('../models/futurePlanModel');

exports.addFuturePlan = (req, res) => {
    const { user_id, goal_name, target_amount, current_savings, target_date } = req.body;
  
    // Calculate monthly savings needed
    const today = new Date();
    const target = new Date(target_date);
    const months = Math.max((target - today) / (1000 * 60 * 60 * 24 * 30), 1);
    const remaining_amount = target_amount - current_savings;
    const monthly_savings = remaining_amount / months;
    
    if (target <= today) {
      return res.status(400).json({ 
        error: 'Target date must be in the future' 
      });
    }
    
    if (remaining_amount <= 0) {
      return res.status(200).json({
        message: 'Goal already achieved! No additional savings needed.',
        plan: {
          user_id,
          goal_name,
          target_amount,
          current_savings,
          target_date,
          monthly_savings: 0
        },
        feasible: true
      });
    }

    FuturePlan.addFuturePlan(
      user_id,
      goal_name,
      target_amount,
      current_savings,
      target_date,
      monthly_savings,
      (err, plan) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({
          message: `You need to save approximately Rs ${monthly_savings.toFixed(2)} per month to reach your goal by ${target.toDateString()}.`,
          plan,
          feasible: true
        });
      }
    );
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