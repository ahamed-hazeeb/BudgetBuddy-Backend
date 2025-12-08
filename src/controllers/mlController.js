const mlService = require('../services/mlService');
const db = require('../config/db');

/**
 * Transform database transaction rows to match ML backend schema
 * @param {Array} transactions - Raw transaction rows from database
 * @returns {Array} - Transformed transactions matching ML schema
 */
const transformTransactionsForML = (transactions) => {
  return transactions.map(txn => ({
    id: txn.id,
    amount: parseFloat(txn.amount),
    category: txn.category || 'Uncategorized',
    type: txn.type,
    date: txn.date,
    note: txn.note || ''
  }));
};

/**
 * Check ML service health
 */
exports.healthCheck = async (req, res) => {
  try {
    const result = await mlService.healthCheck();
    res.status(result.success ? 200 : 503).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check ML service health',
      message: error.message
    });
  }
};

/**
 * Train ML model for authenticated user
 */
exports.trainModel = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.user_id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Fetch user's transactions from database
    const query = `
      SELECT 
        t.id, 
        t.amount, 
        c.name as category,
        t.type, 
        t.date, 
        t.note
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
      ORDER BY t.date DESC
      LIMIT 1000
    `;
    
    const result = await db.query(query, [userId]);
    const transactions = result.rows;

    if (transactions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          has_data: false,
          message: 'No transaction data available yet. Start adding transactions to train the model!',
          transactions: []
        }
      });
    }

    // Transform transactions to match ML backend schema
    const transformedTransactions = transformTransactionsForML(transactions);

    console.log(`Training model with ${transformedTransactions.length} transactions for user ${userId}`);
    
    // Train the model
    const mlResult = await mlService.trainModel(userId, transformedTransactions);
    
    res.status(mlResult.success ? 200 : 500).json(mlResult);
  } catch (error) {
    console.error('Train Model Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to train model',
      message: error.message
    });
  }
};

/**
 * Get predictions for authenticated user
 */
exports.getPredictions = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.user_id;
    const months = parseInt(req.query.months) || 6;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const result = await mlService.getPredictions(userId, months);
    
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error('Get Predictions Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get predictions',
      message: error.message
    });
  }
};

/**
 * Get predictions with auto-training
 */
exports.getOrTrainPredictions = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.user_id;
    const months = parseInt(req.query.months) || 6;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Fetch user's transactions
    const query = `
      SELECT 
        t.id, 
        t.amount, 
        c.name as category,
        t.type, 
        t.date, 
        t.note
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
      ORDER BY t.date DESC
      LIMIT 1000
    `;
    
    const result = await db.query(query, [userId]);
    const transactions = result.rows;

    if (transactions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          has_data: false,
          message: 'No transaction data available yet. Start adding transactions to get predictions!',
          predictions: []
        }
      });
    }

    // Transform transactions to match ML backend schema
    const transformedTransactions = transformTransactionsForML(transactions);

    console.log(`Getting predictions with ${transformedTransactions.length} transactions for user ${userId}`);
    
    const mlResult = await mlService.getOrTrainPredictions(userId, transformedTransactions, months);
    
    res.status(mlResult.success ? 200 : 500).json(mlResult);
  } catch (error) {
    console.error('Get/Train Predictions Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get predictions',
      message: error.message
    });
  }
};

/**
 * Calculate goal timeline
 */
exports.calculateGoalTimeline = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.user_id;
    const { target_amount, current_savings, monthly_savings } = req.body;
    
    if (!userId || !target_amount || current_savings === undefined || !monthly_savings) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: target_amount, current_savings, monthly_savings'
      });
    }

    const result = await mlService.calculateGoalTimeline(
      userId,
      parseFloat(target_amount),
      parseFloat(current_savings),
      parseFloat(monthly_savings)
    );
    
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error('Calculate Goal Timeline Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate goal timeline',
      message: error.message
    });
  }
};

/**
 * Reverse plan a goal
 */
exports.reversePlanGoal = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.user_id;
    const { target_amount, current_savings, target_date } = req.body;
    
    if (!userId || !target_amount || current_savings === undefined || !target_date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: target_amount, current_savings, target_date'
      });
    }

    const result = await mlService.reversePlanGoal(
      userId,
      parseFloat(target_amount),
      parseFloat(current_savings),
      target_date
    );
    
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error('Reverse Plan Goal Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reverse plan goal',
      message: error.message
    });
  }
};

/**
 * Get user insights
 */
exports.getUserInsights = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.user_id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Fetch user's transactions with category names
    const query = `
      SELECT 
        t.id, 
        t.amount, 
        c.name as category,
        t.type, 
        t.date, 
        t.note
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
      ORDER BY t.date DESC
      LIMIT 1000
    `;
    
    const result = await db.query(query, [userId]);
    const transactions = result.rows;

    if (transactions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          has_data: false,
          message: 'No transaction data available yet. Start adding transactions to get AI insights!',
          predictions: [],
          insights: []
        }
      });
    }

    // Transform transactions to match ML backend schema
    const transformedTransactions = transformTransactionsForML(transactions);

    console.log(`Sending ${transformedTransactions.length} transactions to ML service for user ${userId}`);
    
    const mlResult = await mlService.getUserInsights(userId, transformedTransactions);
    
    res.status(mlResult.success ? 200 : 500).json(mlResult);
  } catch (error) {
    console.error('Get User Insights Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user insights',
      message: error.message
    });
  }
};

/**
 * Get insights summary
 */
exports.getInsightsSummary = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.user_id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const result = await mlService.getInsightsSummary(userId);
    
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error('Get Insights Summary Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get insights summary',
      message: error.message
    });
  }
};
