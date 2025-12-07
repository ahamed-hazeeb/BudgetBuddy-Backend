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
    console.error(`ML ${operation} Error:`, error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return {
        success: false,
        message: 'ML service is not available. Please ensure the Python ML backend is running on port 8000.',
        error: 'Connection refused'
      };
    }
    
    return {
      success: false,
      message: `Failed to ${operation}`,
      error: error.response?.data || error.message
    };
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
          ? 'ML service not running. Please start Python backend on port 8000.'
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
      console.error('Goal Timeline Error:', error.message);
      return {
        success: false,
        message: 'Failed to calculate goal timeline',
        error: error.response?.data || error.message
      };
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
      console.error('Reverse Goal Plan Error:', error.message);
      return {
        success: false,
        message: 'Failed to calculate reverse goal plan',
        error: error.response?.data || error.message
      };
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
      console.error('Insights Summary Error:', error.message);
      return {
        success: false,
        message: 'Failed to get insights summary',
        error: error.response?.data || error.message
      };
    }
  }
}

// Export singleton instance
module.exports = new MLService();
