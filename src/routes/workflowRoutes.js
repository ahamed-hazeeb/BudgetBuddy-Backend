// src/routes/workflowRoutes.js

const express = require('express');
const { runExpenseTrackingWorkflow, runBudgetManagementWorkflow, runBillReminderWorkflow, runFuturePlanningWorkflow } = require('../controllers/workflowController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Ensure the function is imported and used correctly
router.post('/workflows/expense-tracking', authenticateToken, runExpenseTrackingWorkflow);
router.post('/workflows/budget-management', authenticateToken, runBudgetManagementWorkflow);
router.post('/workflows/bill-reminder', authenticateToken, runBillReminderWorkflow);
router.post('/workflows/future-planning', authenticateToken, runFuturePlanningWorkflow);

module.exports = router;