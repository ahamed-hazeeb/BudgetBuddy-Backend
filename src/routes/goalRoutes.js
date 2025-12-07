const express = require('express');
const { addGoal, getGoals } = require('../controllers/goalController');

const router = express.Router();

router.post('/goals', addGoal);
router.get('/goals/:user_id', getGoals);

module.exports = router;
