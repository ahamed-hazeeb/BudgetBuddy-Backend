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

/**
 * Get advanced expense forecast (Holt-Winters/ARIMA)
 */
exports.getAdvancedExpenseForecast = async (req, res) => {
  try {
    const userId = req.user?.id;
    const months = parseInt(req.body.months) || 6;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Fetch 24 months of transactions for seasonal analysis
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
        AND t.date >= NOW() - INTERVAL '24 months'
      ORDER BY t.date DESC
    `;
    
    const result = await db.query(query, [userId]);
    const transactions = transformTransactionsForML(result.rows);

    if (transactions.length < 6) {
      return res.status(200).json({
        success: true,
        data: {
          has_data: false,
          message: 'Need at least 6 months of transaction data for advanced forecasting',
          predictions: []
        }
      });
    }

    const mlResult = await mlService.getAdvancedExpenseForecast(userId, transactions, months);
    res.status(mlResult.success ? 200 : 500).json(mlResult);
  } catch (error) {
    console.error('Get Advanced Expense Forecast Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get advanced expense forecast',
      message: error.message
    });
  }
};

/**
 * Get financial health score (0-100)
 */
exports.getHealthScore = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Fetch all transactions for comprehensive health analysis
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
    `;
    
    const result = await db.query(query, [userId]);
    const transactions = transformTransactionsForML(result.rows);

    if (transactions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          has_data: false,
          message: 'No transaction data available. Add transactions to calculate your health score!',
          score: 0,
          grade: 'N/A'
        }
      });
    }

    const mlResult = await mlService.getHealthScore(userId, transactions);
    
    // Store health score in database
    if (mlResult.success && mlResult.data) {
      try {
        await db.query(
          `INSERT INTO financial_health_history 
           (user_id, score, grade, recommendations, calculated_at) 
           VALUES ($1, $2, $3, $4, NOW())`,
          [
            userId, 
            mlResult.data.score || 0, 
            mlResult.data.grade || 'N/A', 
            JSON.stringify(mlResult.data.recommendations || [])
          ]
        );
      } catch (dbError) {
        console.error('Failed to store health score:', dbError);
        // Continue even if storage fails
      }
    }

    res.status(mlResult.success ? 200 : 500).json(mlResult);
  } catch (error) {
    console.error('Get Health Score Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get health score',
      message: error.message
    });
  }
};

/**
 * Get health score trends
 */
exports.getHealthTrends = async (req, res) => {
  try {
    const userId = req.params.user_id || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Verify user has access to this data
    if (req.user?.id && parseInt(userId) !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get historical health scores from database
    const historyQuery = `
      SELECT score, grade, recommendations, calculated_at
      FROM financial_health_history
      WHERE user_id = $1
      ORDER BY calculated_at DESC
      LIMIT 12
    `;
    
    const historyResult = await db.query(historyQuery, [userId]);
    
    // Also get trends from ML service
    const mlResult = await mlService.getHealthTrends(userId);
    
    res.status(mlResult.success ? 200 : 500).json({
      success: mlResult.success,
      data: {
        history: historyResult.rows,
        trends: mlResult.data
      },
      message: mlResult.message
    });
  } catch (error) {
    console.error('Get Health Trends Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get health trends',
      message: error.message
    });
  }
};

/**
 * Get peer benchmark comparison
 */
exports.getBenchmark = async (req, res) => {
  try {
    const userId = req.params.user_id || req.user?.id;
    const { age_group, income_bracket } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Verify user has access to this data
    if (req.user?.id && parseInt(userId) !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const mlResult = await mlService.getBenchmark(userId, age_group, income_bracket);
    res.status(mlResult.success ? 200 : 500).json(mlResult);
  } catch (error) {
    console.error('Get Benchmark Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get benchmark',
      message: error.message
    });
  }
};

/**
 * Get AI budget recommendations
 */
exports.getBudgetRecommendations = async (req, res) => {
  try {
    const userId = req.user?.id;
    const totalBudget = parseFloat(req.body.total_budget);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    if (!totalBudget || totalBudget <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid total_budget is required'
      });
    }

    // Fetch 6 months of transactions for recommendation analysis
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
        AND t.date >= NOW() - INTERVAL '6 months'
      ORDER BY t.date DESC
    `;
    
    const result = await db.query(query, [userId]);
    const transactions = transformTransactionsForML(result.rows);

    if (transactions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          has_data: false,
          message: 'No transaction data available. Add transactions to get recommendations!',
          recommendations: []
        }
      });
    }

    const mlResult = await mlService.getBudgetRecommendations(userId, transactions, totalBudget);
    
    // Store recommendations in database
    if (mlResult.success && mlResult.data?.recommendations) {
      try {
        for (const rec of mlResult.data.recommendations) {
          await db.query(
            `INSERT INTO budget_recommendations 
             (user_id, recommendation_type, category, current_amount, recommended_amount, savings_potential, priority, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              userId,
              rec.type || 'optimization',
              rec.category || null,
              rec.current_amount || 0,
              rec.recommended_amount || 0,
              rec.savings_potential || 0,
              rec.priority || 'medium',
              'pending'
            ]
          );
        }
      } catch (dbError) {
        console.error('Failed to store budget recommendations:', dbError);
        // Continue even if storage fails
      }
    }

    res.status(mlResult.success ? 200 : 500).json(mlResult);
  } catch (error) {
    console.error('Get Budget Recommendations Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get budget recommendations',
      message: error.message
    });
  }
};

/**
 * Get budget alerts
 */
exports.getBudgetAlerts = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Fetch current month transactions
    const transactionsQuery = `
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
        AND t.date >= date_trunc('month', CURRENT_DATE)
      ORDER BY t.date DESC
    `;
    
    const transactionsResult = await db.query(transactionsQuery, [userId]);
    const transactions = transformTransactionsForML(transactionsResult.rows);

    // Fetch active budgets
    const budgetsQuery = `
      SELECT id, amount, start_date, end_date, status
      FROM budgets
      WHERE user_id = $1 AND status = 'active'
    `;
    
    const budgetsResult = await db.query(budgetsQuery, [userId]);
    const budgets = budgetsResult.rows;

    const mlResult = await mlService.getBudgetAlerts(userId, transactions, budgets);
    res.status(mlResult.success ? 200 : 500).json(mlResult);
  } catch (error) {
    console.error('Get Budget Alerts Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get budget alerts',
      message: error.message
    });
  }
};

/**
 * Optimize budget allocation
 */
exports.optimizeBudget = async (req, res) => {
  try {
    const userId = req.user?.id;
    const currentBudget = req.body.current_budget;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    if (!currentBudget) {
      return res.status(400).json({
        success: false,
        error: 'current_budget is required'
      });
    }

    // Fetch 3 months of transactions for optimization
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
        AND t.date >= NOW() - INTERVAL '3 months'
      ORDER BY t.date DESC
    `;
    
    const result = await db.query(query, [userId]);
    const transactions = transformTransactionsForML(result.rows);

    if (transactions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          has_data: false,
          message: 'No transaction data available for optimization',
          optimized_budget: currentBudget
        }
      });
    }

    const mlResult = await mlService.optimizeBudget(userId, transactions, currentBudget);
    res.status(mlResult.success ? 200 : 500).json(mlResult);
  } catch (error) {
    console.error('Optimize Budget Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to optimize budget',
      message: error.message
    });
  }
};

/**
 * Get spending habits analysis
 */
exports.getSpendingHabits = async (req, res) => {
  try {
    const userId = req.params.user_id || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Verify user has access to this data
    if (req.user?.id && parseInt(userId) !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Fetch 12 months of transactions for habit analysis
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
        AND t.date >= NOW() - INTERVAL '12 months'
      ORDER BY t.date DESC
    `;
    
    const result = await db.query(query, [userId]);
    const transactions = transformTransactionsForML(result.rows);

    if (transactions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          has_data: false,
          message: 'No transaction data available for habit analysis',
          habits: []
        }
      });
    }

    const mlResult = await mlService.getSpendingHabits(userId, transactions);
    res.status(mlResult.success ? 200 : 500).json(mlResult);
  } catch (error) {
    console.error('Get Spending Habits Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get spending habits',
      message: error.message
    });
  }
};

/**
 * Get savings opportunities
 */
exports.getSavingsOpportunities = async (req, res) => {
  try {
    const userId = req.params.user_id || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Verify user has access to this data
    if (req.user?.id && parseInt(userId) !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Fetch 6 months of transactions for opportunities analysis
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
        AND t.date >= NOW() - INTERVAL '6 months'
      ORDER BY t.date DESC
    `;
    
    const result = await db.query(query, [userId]);
    const transactions = transformTransactionsForML(result.rows);

    if (transactions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          has_data: false,
          message: 'No transaction data available for savings analysis',
          opportunities: []
        }
      });
    }

    const mlResult = await mlService.getSavingsOpportunities(userId, transactions);
    res.status(mlResult.success ? 200 : 500).json(mlResult);
  } catch (error) {
    console.error('Get Savings Opportunities Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get savings opportunities',
      message: error.message
    });
  }
};

/**
 * Get behavior nudges
 */
exports.getBehaviorNudges = async (req, res) => {
  try {
    const userId = req.params.user_id || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Verify user has access to this data
    if (req.user?.id && parseInt(userId) !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Fetch 3 months of transactions
    const transactionsQuery = `
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
        AND t.date >= NOW() - INTERVAL '3 months'
      ORDER BY t.date DESC
    `;
    
    const transactionsResult = await db.query(transactionsQuery, [userId]);
    const transactions = transformTransactionsForML(transactionsResult.rows);

    // Fetch active financial goals
    const goalsQuery = `
      SELECT id, goal_name, target_amount, current_savings, target_date
      FROM financial_goals
      WHERE user_id = $1
    `;
    
    const goalsResult = await db.query(goalsQuery, [userId]);
    const goals = goalsResult.rows;

    const mlResult = await mlService.getBehaviorNudges(userId, transactions, goals);
    res.status(mlResult.success ? 200 : 500).json(mlResult);
  } catch (error) {
    console.error('Get Behavior Nudges Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get behavior nudges',
      message: error.message
    });
  }
};

/**
 * Get ML model performance metrics
 */
exports.getModelPerformance = async (req, res) => {
  try {
    const userId = req.params.user_id || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Verify user has access to this data
    if (req.user?.id && parseInt(userId) !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const mlResult = await mlService.getModelPerformance(userId);
    res.status(mlResult.success ? 200 : 500).json(mlResult);
  } catch (error) {
    console.error('Get Model Performance Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get model performance',
      message: error.message
    });
  }
};
