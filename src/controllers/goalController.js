const goalModel = require('../models/goalModel');

exports.addGoal = (req, res) => {
    const { user_id, goal_name, target_amount, current_savings, target_date } = req.body;

    goalModel.addGoal(user_id, goal_name, target_amount, current_savings, target_date, (err, goal) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json(goal);
    });
};

exports.getGoals = (req, res) => {
    const { user_id } = req.params;

    goalModel.getUserGoals(user_id, (err, goals) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(goals);
    });
};
