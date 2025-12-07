// src/routes/workflowRoutes.js

const express = require('express');
const { runExpenseTrackingWorkflow, runBudgetManagementWorkflow, runBillReminderWorkflow, runFuturePlanningWorkflow } = require('../controllers/workflowController');
const { authMiddleware } = require('../controllers/userController');

const router = express.Router();

// Ensure the function is imported and used correctly
router.post('/workflows/expense-tracking', authMiddleware, runExpenseTrackingWorkflow);
router.post('/workflows/budget-management', authMiddleware, runBudgetManagementWorkflow);
router.post('/workflows/bill-reminder', authMiddleware, runBillReminderWorkflow);
router.post('/workflows/future-planning', authMiddleware, runFuturePlanningWorkflow);

module.exports = router;