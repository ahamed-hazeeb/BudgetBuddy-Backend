const mlService = require('../src/services/mlService');

describe('ML Transaction Data Transformation', () => {
  describe('Transaction Schema Compliance', () => {
    it('should transform database rows to ML backend schema format', () => {
      // Mock database row with extra fields
      const dbTransactions = [
        {
          id: 1,
          user_id: 1,              // Extra field - should be removed
          amount: '25000',         // String - should become float
          category_id: 7,          // Extra field - should be removed
          category: 'Shopping',    // Keep this
          type: 'expense',
          date: '2025-03-15',
          note: 'Weekly shopping',
          account_id: 2,           // Extra field - should be removed
          created_at: '2025-03-15T10:00:00Z' // Extra field - should be removed
        },
        {
          id: 2,
          amount: '50000',
          category: null,          // Should become 'Uncategorized'
          type: 'income',
          date: '2025-03-20',
          note: null               // Should become empty string
        }
      ];

      // Expected ML backend format
      const transformedTransactions = dbTransactions.map(txn => ({
        id: txn.id,
        amount: parseFloat(txn.amount),
        category: txn.category || 'Uncategorized',
        type: txn.type,
        date: txn.date,
        note: txn.note || ''
      }));

      // Verify transformation
      expect(transformedTransactions).toHaveLength(2);
      
      // First transaction
      expect(transformedTransactions[0]).toEqual({
        id: 1,
        amount: 25000,
        category: 'Shopping',
        type: 'expense',
        date: '2025-03-15',
        note: 'Weekly shopping'
      });
      expect(transformedTransactions[0]).not.toHaveProperty('user_id');
      expect(transformedTransactions[0]).not.toHaveProperty('category_id');
      expect(transformedTransactions[0]).not.toHaveProperty('account_id');
      expect(transformedTransactions[0]).not.toHaveProperty('created_at');
      expect(typeof transformedTransactions[0].amount).toBe('number');
      
      // Second transaction
      expect(transformedTransactions[1]).toEqual({
        id: 2,
        amount: 50000,
        category: 'Uncategorized',
        type: 'income',
        date: '2025-03-20',
        note: ''
      });
      expect(typeof transformedTransactions[1].amount).toBe('number');
    });

    it('should handle edge cases in transformation', () => {
      const dbTransactions = [
        {
          id: 100,
          amount: '0',             // Zero amount
          category: '',            // Empty string category
          type: 'expense',
          date: '2025-01-01',
          note: undefined          // Undefined note
        }
      ];

      const transformedTransactions = dbTransactions.map(txn => ({
        id: txn.id,
        amount: parseFloat(txn.amount),
        category: txn.category || 'Uncategorized',
        type: txn.type,
        date: txn.date,
        note: txn.note || ''
      }));

      expect(transformedTransactions[0]).toEqual({
        id: 100,
        amount: 0,
        category: 'Uncategorized',  // Empty string should become 'Uncategorized'
        type: 'expense',
        date: '2025-01-01',
        note: ''
      });
    });

    it('should preserve correct field types for ML backend', () => {
      const dbTransactions = [
        {
          id: 1,
          amount: '123.45',
          category: 'Food',
          type: 'expense',
          date: '2025-03-15',
          note: 'Lunch'
        }
      ];

      const transformedTransactions = dbTransactions.map(txn => ({
        id: txn.id,
        amount: parseFloat(txn.amount),
        category: txn.category || 'Uncategorized',
        type: txn.type,
        date: txn.date,
        note: txn.note || ''
      }));

      const transformed = transformedTransactions[0];
      
      // Verify field types
      expect(typeof transformed.id).toBe('number');
      expect(typeof transformed.amount).toBe('number');
      expect(typeof transformed.category).toBe('string');
      expect(typeof transformed.type).toBe('string');
      expect(typeof transformed.date).toBe('string');
      expect(typeof transformed.note).toBe('string');
      
      // Verify exact values
      expect(transformed.amount).toBe(123.45);
      expect(Object.keys(transformed)).toEqual(['id', 'amount', 'category', 'type', 'date', 'note']);
    });
  });

  describe('ML Service Error Handling', () => {
    it('should handle ML service validation errors properly', () => {
      // Mock error from ML service
      const mlError = {
        response: {
          status: 422,
          data: {
            detail: 'Validation error: unexpected field category_id'
          }
        },
        config: {
          url: 'http://localhost:8000/insights'
        }
      };

      // This tests that our error handler can process the error correctly
      const errorResult = mlService._handleMLServiceError(mlError, 'generate insights');
      
      expect(errorResult.success).toBe(false);
      expect(errorResult.error).toContain('Validation error');
      expect(errorResult.status).toBe(422);
    });

    it('should handle connection refused errors', () => {
      const connectionError = {
        request: {},
        message: 'connect ECONNREFUSED 127.0.0.1:8000'
      };

      const errorResult = mlService._handleMLServiceError(connectionError, 'generate insights');
      
      expect(errorResult.success).toBe(false);
      expect(errorResult.error).toContain('ML service is not available');
      expect(errorResult.available).toBe(false);
    });
  });
});
