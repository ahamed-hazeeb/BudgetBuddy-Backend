const axios = require('axios');
const config = require('../config/dotenv');

class MLService {
  constructor() {
    this.baseURL = config.ML_SERVICE_URL;
    this.timeout = config.ML_SERVICE_TIMEOUT;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Helper method to handle ML service errors consistently
   * @param {Error} error - The error object from axios
   * @param {string} operation - Description of the operation that failed
   */
  _handleMLServiceError(error, operation) {
    if (error.response) {
      // ML service responded with error
      console.error(`ML Service Error (${operation}):`, {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url
      });
      
      return {
        success: false,
        message: `Failed to ${operation}`,
        error: `ML service error: ${error.response.data.detail || error.message}`,
        status: error.response.status
      };
    } else if (error.request) {
      // No response from ML service
      console.error(`ML Service Not Responding (${operation}):`, error.message);
      return {
        success: false,
        message: `Failed to ${operation}`,
        error: 'ML service is not available. Please ensure it is running on port 8000.',
        available: false
      };
    } else {
      // Request setup error
      console.error(`ML Service Request Error (${operation}):`, error.message);
      return {
        success: false,
        message: `Failed to ${operation}`,
        error: error.message
      };
    }
  }

  /**
   * Check if ML service is healthy and accessible
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return {
        success: true,
        available: true,
        status: response.data,
        message: 'ML service is healthy'
      };
    } catch (error) {
      return {
        success: false,
        available: false,
        message: error.code === 'ECONNREFUSED' 
          ? 'ML service is unavailable. Please start Python backend on port 8000.'
          : 'ML service is unavailable',
        error: error.message
      };
    }
  }

  /**
   * Train ML model for a specific user
   * @param {number} userId - User ID
   * @param {Array} transactions - Array of transaction data
   */
  async trainModel(userId, transactions) {
    try {
      const response = await this.client.post('/train', {
        user_id: userId,
        transactions: transactions
      });
      return {
        success: true,
        data: response.data,
        message: 'Model trained successfully'
      };
    } catch (error) {
      return this._handleMLServiceError(error, 'train model');
    }
  }

  /**
   * Get savings predictions for a user
   * @param {number} userId - User ID
   * @param {number} months - Number of months to predict (default: 6)
   */
  async getPredictions(userId, months = 6) {
    try {
      const response = await this.client.get(`/predict/${userId}`, {
        params: { months }
      });
      return {
        success: true,
        data: response.data,
        message: 'Predictions retrieved successfully'
      };
    } catch (error) {
      return this._handleMLServiceError(error, 'get predictions');
    }
  }

  /**
   * Get predictions with auto-training fallback
   * Trains the model if not already trained
   * @param {number} userId - User ID
   * @param {Array} transactions - Transaction data for training
   * @param {number} months - Number of months to predict
   */
  async getOrTrainPredictions(userId, transactions, months = 6) {
    // Try to get predictions first
    let result = await this.getPredictions(userId, months);
    
    // If predictions fail, train model and try again
    if (!result.success) {
      console.log(`Training model for user ${userId} before prediction...`);
      const trainResult = await this.trainModel(userId, transactions);
      
      if (trainResult.success) {
        result = await this.getPredictions(userId, months);
      } else {
        return trainResult;
      }
    }
    
    return result;
  }

  /**
   * Calculate timeline to achieve a financial goal
   * @param {number} userId - User ID
   * @param {number} targetAmount - Goal amount
   * @param {number} currentSavings - Current savings amount
   * @param {number} monthlySavings - Monthly savings capacity
   */
  async calculateGoalTimeline(userId, targetAmount, currentSavings, monthlySavings) {
    try {
      const response = await this.client.post('/goals/timeline', {
        user_id: userId,
        target_amount: targetAmount,
        current_savings: currentSavings,
        monthly_savings: monthlySavings
      });
      return {
        success: true,
        data: response.data,
        message: 'Goal timeline calculated successfully'
      };
    } catch (error) {
      return this._handleMLServiceError(error, 'calculate goal timeline');
    }
  }

  /**
   * Reverse plan a goal - calculate monthly savings needed
   * @param {number} userId - User ID
   * @param {number} targetAmount - Goal amount
   * @param {number} currentSavings - Current savings amount
   * @param {string} targetDate - Target date (YYYY-MM-DD)
   */
  async reversePlanGoal(userId, targetAmount, currentSavings, targetDate) {
    try {
      const response = await this.client.post('/goals/reverse-plan', {
        user_id: userId,
        target_amount: targetAmount,
        current_savings: currentSavings,
        target_date: targetDate
      });
      return {
        success: true,
        data: response.data,
        message: 'Reverse goal plan calculated successfully'
      };
    } catch (error) {
      return this._handleMLServiceError(error, 'calculate reverse goal plan');
    }
  }

  /**
   * Get personalized insights for a user
   * @param {number} userId - User ID
   * @param {Array} transactions - Transaction data
   */
  async getUserInsights(userId, transactions) {
    try {
      const response = await this.client.post('/insights', {
        user_id: userId,
        transactions: transactions
      });
      return {
        success: true,
        data: response.data,
        message: 'Insights generated successfully'
      };
    } catch (error) {
      return this._handleMLServiceError(error, 'generate insights');
    }
  }

  /**
   * Get summary of all insights
   * @param {number} userId - User ID
   */
  async getInsightsSummary(userId) {
    try {
      const response = await this.client.get(`/insights/summary/${userId}`);
      return {
        success: true,
        data: response.data,
        message: 'Insights summary retrieved successfully'
      };
    } catch (error) {
      return this._handleMLServiceError(error, 'get insights summary');
    }
  }

  /**
   * Get advanced expense forecast using Holt-Winters/ARIMA
   * @param {number} userId - User ID
   * @param {Array} transactions - Transaction data
   * @param {number} months - Number of months to forecast
   */
  async getAdvancedExpenseForecast(userId, transactions, months = 6) {
    try {
      const response = await this.client.post('/api/v1/predictions/expense/advanced', {
        user_id: userId,
        transactions: transactions,
        months: months
      }, { timeout: 10000 });
      return {
        success: true,
        data: response.data,
        message: 'Advanced expense forecast generated successfully'
      };
    } catch (error) {
      return this._handleMLServiceError(error, 'get advanced expense forecast');
    }
  }

  /**
   * Get financial health score (0-100) with grade
   * @param {number} userId - User ID
   * @param {Array} transactions - Transaction data
   */
  async getHealthScore(userId, transactions) {
    try {
      const response = await this.client.post('/api/v1/insights/health-score', {
        user_id: userId,
        transactions: transactions
      }, { timeout: 5000 });
      return {
        success: true,
        data: response.data,
        message: 'Health score calculated successfully'
      };
    } catch (error) {
      return this._handleMLServiceError(error, 'get health score');
    }
  }

  /**
   * Get health score trends over time
   * @param {number} userId - User ID
   */
  async getHealthTrends(userId) {
    try {
      const response = await this.client.get(`/api/v1/insights/trends/${userId}`, {
        timeout: 5000
      });
      return {
        success: true,
        data: response.data,
        message: 'Health trends retrieved successfully'
      };
    } catch (error) {
      return this._handleMLServiceError(error, 'get health trends');
    }
  }

  /**
   * Get peer benchmark comparison
   * @param {number} userId - User ID
   * @param {string} ageGroup - Age group (e.g., '25-34')
   * @param {string} incomeBracket - Income bracket (e.g., '50k-75k')
   */
  async getBenchmark(userId, ageGroup, incomeBracket) {
    try {
      const params = {};
      if (ageGroup) params.age_group = ageGroup;
      if (incomeBracket) params.income_bracket = incomeBracket;
      
      const response = await this.client.get(`/api/v1/insights/benchmark/${userId}`, {
        params: params,
        timeout: 5000
      });
      return {
        success: true,
        data: response.data,
        message: 'Benchmark data retrieved successfully'
      };
    } catch (error) {
      return this._handleMLServiceError(error, 'get benchmark');
    }
  }

  /**
   * Get AI budget recommendations (50/30/20 rule)
   * @param {number} userId - User ID
   * @param {Array} transactions - Transaction data
   * @param {number} totalBudget - Total monthly budget
   */
  async getBudgetRecommendations(userId, transactions, totalBudget) {
    try {
      const response = await this.client.post('/api/v1/budget/recommend', {
        user_id: userId,
        transactions: transactions,
        total_budget: totalBudget
      }, { timeout: 5000 });
      return {
        success: true,
        data: response.data,
        message: 'Budget recommendations generated successfully'
      };
    } catch (error) {
      return this._handleMLServiceError(error, 'get budget recommendations');
    }
  }

  /**
   * Get budget alerts for overspending
   * @param {number} userId - User ID
   * @param {Array} transactions - Transaction data
   * @param {Array} budgets - Current budget data
   */
  async getBudgetAlerts(userId, transactions, budgets) {
    try {
      const response = await this.client.post('/api/v1/budget/alerts', {
        user_id: userId,
        transactions: transactions,
        budgets: budgets
      }, { timeout: 5000 });
      return {
        success: true,
        data: response.data,
        message: 'Budget alerts retrieved successfully'
      };
    } catch (error) {
      return this._handleMLServiceError(error, 'get budget alerts');
    }
  }

  /**
   * Optimize budget allocation
   * @param {number} userId - User ID
   * @param {Array} transactions - Transaction data
   * @param {Object} currentBudget - Current budget allocation
   */
  async optimizeBudget(userId, transactions, currentBudget) {
    try {
      const response = await this.client.post('/api/v1/budget/optimize', {
        user_id: userId,
        transactions: transactions,
        current_budget: currentBudget
      }, { timeout: 5000 });
      return {
        success: true,
        data: response.data,
        message: 'Budget optimized successfully'
      };
    } catch (error) {
      return this._handleMLServiceError(error, 'optimize budget');
    }
  }

  /**
   * Get spending habits analysis
   * @param {number} userId - User ID
   * @param {Array} transactions - Transaction data
   */
  async getSpendingHabits(userId, transactions) {
    try {
      const response = await this.client.post(`/api/v1/recommendations/habits/${userId}`, {
        transactions: transactions
      }, { timeout: 5000 });
      return {
        success: true,
        data: response.data,
        message: 'Spending habits analyzed successfully'
      };
    } catch (error) {
      return this._handleMLServiceError(error, 'get spending habits');
    }
  }

  /**
   * Get savings opportunities
   * @param {number} userId - User ID
   * @param {Array} transactions - Transaction data
   */
  async getSavingsOpportunities(userId, transactions) {
    try {
      const response = await this.client.post(`/api/v1/recommendations/opportunities/${userId}`, {
        transactions: transactions
      }, { timeout: 5000 });
      return {
        success: true,
        data: response.data,
        message: 'Savings opportunities identified successfully'
      };
    } catch (error) {
      return this._handleMLServiceError(error, 'get savings opportunities');
    }
  }

  /**
   * Get behavior nudges for motivation
   * @param {number} userId - User ID
   * @param {Array} transactions - Transaction data
   * @param {Array} goals - User financial goals
   */
  async getBehaviorNudges(userId, transactions, goals) {
    try {
      const response = await this.client.post(`/api/v1/recommendations/nudges/${userId}`, {
        transactions: transactions,
        goals: goals
      }, { timeout: 5000 });
      return {
        success: true,
        data: response.data,
        message: 'Behavior nudges generated successfully'
      };
    } catch (error) {
      return this._handleMLServiceError(error, 'get behavior nudges');
    }
  }

  /**
   * Get ML model performance metrics
   * @param {number} userId - User ID
   */
  async getModelPerformance(userId) {
    try {
      const response = await this.client.get(`/api/v1/models/performance/${userId}`, {
        timeout: 5000
      });
      return {
        success: true,
        data: response.data,
        message: 'Model performance retrieved successfully'
      };
    } catch (error) {
      return this._handleMLServiceError(error, 'get model performance');
    }
  }
}

// Export singleton instance
module.exports = new MLService();
