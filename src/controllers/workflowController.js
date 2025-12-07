// src/controllers/workflowController.js

const { Engine } = require('bpmn-engine');
const fs = require('fs').promises;
const path = require('path'); // Import the path module

const transactionModel = require('../models/transactionModel');
const budgetModel = require('../models/budgetModel');
const billModel = require('../models/billModel');
const goalModel = require('../models/goalModel');
const db = require('../config/db');
// Model removed - ML functionality now available via mlService

// Expense Tracking Workflow
exports.runExpenseTrackingWorkflow = async (req, res) => {
  const userId = req.user_id;
  const { amount, type, date, note, account_id, category_id, useOCR, receiptImage } = req.body;

  try {
    const bpmnXml = await fs.readFile('./workflows/expenseTrackingWorkflow.bpmn', 'utf8');
    const engine = new Engine({ name: 'expense-tracking', source: bpmnXml });

    engine.execute({
      variables: { userId, amount, type, date, note, account_id, category_id, useOCR },
      services: {
        processOCR: (context, next) => {
          // Placeholder: Integrate Firebase ML Kit or Tesseract.js in frontend
          const extractedData = { amount, category_id: 1 }; // Mock OCR result
          next(null, extractedData);
        },
        saveTransactionToDb: (context, next) => {
          const vars = context.variables;
          transactionModel.addTransaction(
            vars.userId, vars.amount, vars.category_id, vars.type, vars.date, vars.note, vars.account_id,
            (err, transaction) => next(err, transaction)
          );
        }
      }
    }, (err, execution) => {
      if (err) return res.status(500).json({ error: err.message });
      execution.once('end', () => {
        res.json({ message: 'Transaction recorded', transaction: execution.environment.output });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Budget Management Workflow
exports.runBudgetManagementWorkflow = async (req, res) => {
  const userId = req.user_id;
  const { budgetType, amount, category_id, start_date, end_date } = req.body;

  try {
    const bpmnXml = await fs.readFile('./workflows/budgetManagementWorkflow.bpmn', 'utf8');
    const engine = new Engine({ name: 'budget-management', source: bpmnXml });

    engine.execute({
      variables: { userId, budgetType, amount, category_id, start_date, end_date },
      services: {
        getBudgetRecommendation: (context, next) => {
          // ML functionality removed - use /api/ml endpoints for predictions
          // For now, use a simple default recommendation
          const recommendedBudget = context.variables.amount || 5000;
          next(null, { recommendedBudget });
        },
        saveBudgetToDb: (context, next) => {
          const vars = context.variables;
          const finalAmount = vars.amount || vars.recommendedBudget;
          budgetModel.setOverallBudget(vars.userId, finalAmount, vars.start_date, vars.end_date,
            (err, budget) => next(err, budget));
        }
      }
    }, (err, execution) => {
      if (err) return res.status(500).json({ error: err.message });
      execution.once('end', () => {
        res.json({ message: 'Budget created', budget: execution.environment.output });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Bill Reminder Workflow
exports.runBillReminderWorkflow = async (req, res) => {
  const userId = req.user_id;
  const { bill_id } = req.body;

  try {
    const bpmnXml = await fs.readFile('./workflows/billReminderWorkflow.bpmn', 'utf8');
    const engine = new Engine({ name: 'bill-reminder', source: bpmnXml });

    engine.execute({
      variables: { userId, bill_id },
      services: {
        checkBillStatus: (context, next) => {
          billModel.getUserBills(userId, (err, bills) => {
            if (err) return next(err);
            const bill = bills.find(b => b.id === bill_id);
            next(null, { isPaid: bill.status === 'paid' });
          });
        },
        markBillAsPaid: (context, next) => {
          const query = 'UPDATE bills SET status = $1 WHERE id = $2';
          db.query(query, ['paid', bill_id], (err) => next(err));
        },
        sendReminderNotification: (context, next) => {
          // Placeholder: Integrate SMS/email (e.g., Twilio)
          console.log(`Reminder sent for bill ${bill_id}`);
          next(null);
        }
      }
    }, (err, execution) => {
      if (err) return res.status(500).json({ error: err.message });
      execution.once('end', () => {
        res.json({ message: execution.environment.output.isPaid ? 'Bill marked paid' : 'Reminder sent' });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Future Planning Workflow
exports.runFuturePlanningWorkflow = async (req, res) => {
  const userId = req.user_id;
  const { goal_name, target_amount, target_date } = req.body;
  const months = Math.ceil((new Date(target_date) - new Date()) / (1000 * 60 * 60 * 24 * 30));

  try {
    console.log('Reading BPMN file...');
    const bpmnXml = await fs.readFile(path.join(__dirname, '../workflows/futurePlanningWorkflow.bpmn'), 'utf8');
    console.log('BPMN file content:', bpmnXml);
console.log('Initializing BPMN engine...');
const engine = new Engine({ name: 'future-planning', source: bpmnXml });

console.log('Executing workflow...');
engine.execute({
  variables: { userId, goal_name, target_amount, months, target_date },
  services: {
    analyzeFinancialPatterns: (context, next) => {
      console.log('Analyzing financial patterns...');
      // ML functionality removed - use /api/ml endpoints for insights
      const isFeasible = true; // Default to feasible
      next(null, { isFeasible });
    },
    calculateMonthlySavings: (context, next) => {
      console.log('Calculating monthly savings...');
      // ML functionality removed - use /api/ml/goals/reverse-plan endpoint
      const vars = context.variables;
      const monthly_savings = vars.target_amount / (vars.months || 12);
      console.log('Monthly savings calculated:', monthly_savings);
      next(null, { monthlySavings: monthly_savings.toFixed(2) });
    },
    saveGoalToDb: (context, next) => {
      console.log('Saving goal to database...');
      const vars = context.variables;
      goalModel.addGoal(vars.userId, vars.goal_name, vars.target_amount, 0, vars.target_date,
        (err, goal) => {
          if (err) {
            console.error('Error saving goal to database:', err);
            return next(err);
          }
          console.log('Goal saved to database:', goal);
          next(null, goal);
        });
    }
  }
}, (err, execution) => {
  if (err) {
    console.error('Workflow execution error:', err);
    return res.status(500).json({ error: err.message });
  }
  execution.once('end', () => {
    console.log('Workflow execution completed successfully');
    const output = execution.environment.output;
    if (!output.isFeasible) {
      console.log('Goal not feasible:', output);
      return res.status(400).json({ error: 'Goal not feasible, adjust inputs' });
    }
    console.log('Workflow output:', output);
    res.json({ message: 'Goal created', goal: output });
  });
});
  } catch (error) {
    console.error('Error in workflow execution:', error);
    res.status(500).json({ error: error.message });
  }
};