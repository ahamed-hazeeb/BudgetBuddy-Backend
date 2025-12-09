# ML Phase 2-4 API Endpoints Documentation

## Overview
This document describes the 11 new AI-powered ML backend endpoints added in Phase 2-4, enabling advanced expense forecasting, financial health scoring, smart budgeting, personalized spending insights, and peer benchmarking.

## Base URL
All endpoints are prefixed with `/api/ml`

## Authentication
All endpoints require JWT authentication via Bearer token:
```
Authorization: Bearer <jwt_token>
```

---

## 📊 Advanced Predictions

### 1. Advanced Expense Forecast
Get advanced expense predictions using Holt-Winters/ARIMA models for seasonal analysis.

**Endpoint:** `POST /api/ml/predictions/expense/advanced`

**Request Body:**
```json
{
  "months": 6
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "month": "2025-01",
        "predicted_expense": 2543.50,
        "confidence_interval": {
          "lower": 2100.00,
          "upper": 3000.00
        }
      }
    ],
    "model": "holt_winters",
    "accuracy": 0.85
  },
  "message": "Advanced expense forecast generated successfully"
}
```

**Notes:**
- Requires at least 6 months of transaction history
- Fetches last 24 months for seasonal analysis
- Returns empty predictions array if insufficient data

---

## 🏥 Financial Health Insights

### 2. Get Health Score
Calculate financial health score (0-100) with A-F grade.

**Endpoint:** `GET /api/ml/insights/health-score`

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 78.5,
    "grade": "B",
    "recommendations": [
      "Increase emergency fund to 6 months",
      "Reduce discretionary spending by 15%"
    ],
    "breakdown": {
      "savings_rate": 85,
      "expense_management": 70,
      "financial_stability": 80
    }
  },
  "message": "Health score calculated successfully"
}
```

**Notes:**
- Score automatically stored in `financial_health_history` table
- Analyzes all user transactions
- Returns default score 0 if no data

### 3. Get Health Trends
View historical health score trends over time.

**Endpoint:** `GET /api/ml/insights/trends/:user_id`

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "score": 78.5,
        "grade": "B",
        "calculated_at": "2025-12-09T08:00:00Z"
      }
    ],
    "trends": {
      "direction": "improving",
      "change_rate": 2.5,
      "volatility": "low"
    }
  },
  "message": "Health trends retrieved successfully"
}
```

**Notes:**
- Returns last 12 historical scores from database
- Includes ML-generated trend analysis
- User can only access their own data

### 4. Get Peer Benchmark
Compare financial metrics against similar demographics.

**Endpoint:** `GET /api/ml/insights/benchmark/:user_id?age_group=25-34&income_bracket=50k-75k`

**Query Parameters:**
- `age_group` (optional): Age range (e.g., "25-34", "35-44")
- `income_bracket` (optional): Income range (e.g., "50k-75k", "75k-100k")

**Response:**
```json
{
  "success": true,
  "data": {
    "user_metrics": {
      "savings_rate": 0.25,
      "expense_ratio": 0.70
    },
    "peer_average": {
      "savings_rate": 0.20,
      "expense_ratio": 0.75
    },
    "percentile": 68,
    "comparison": "above_average"
  },
  "message": "Benchmark data retrieved successfully"
}
```

**Notes:**
- Filters by age group and income bracket if provided
- Returns aggregated anonymous peer data
- User access verification enforced

---

## 💰 Smart Budgeting

### 5. Get Budget Recommendations
Receive AI-generated budget recommendations using 50/30/20 rule.

**Endpoint:** `POST /api/ml/budget/recommend`

**Request Body:**
```json
{
  "total_budget": 5000.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "category": "Food",
        "type": "optimization",
        "current_amount": 800.00,
        "recommended_amount": 600.00,
        "savings_potential": 200.00,
        "priority": "high",
        "reason": "Spending 30% above peer average"
      }
    ],
    "budget_allocation": {
      "needs": 2500.00,
      "wants": 1500.00,
      "savings": 1000.00
    }
  },
  "message": "Budget recommendations generated successfully"
}
```

**Notes:**
- Analyzes last 6 months of transactions
- Recommendations stored in `budget_recommendations` table
- Returns empty array if no transaction data

### 6. Get Budget Alerts
Receive real-time alerts for budget overspending.

**Endpoint:** `POST /api/ml/budget/alerts`

**Response:**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "type": "overspending",
        "category": "Entertainment",
        "current": 450.00,
        "budget": 300.00,
        "percentage": 150,
        "severity": "high"
      }
    ],
    "total_spent": 3200.00,
    "total_budget": 5000.00,
    "budget_utilization": 0.64
  },
  "message": "Budget alerts retrieved successfully"
}
```

**Notes:**
- Analyzes current month transactions
- Compares against active budgets
- Returns alerts for overspending categories

### 7. Optimize Budget
Get optimized budget allocation based on spending patterns.

**Endpoint:** `POST /api/ml/budget/optimize`

**Request Body:**
```json
{
  "current_budget": {
    "Food": 600,
    "Transport": 400,
    "Entertainment": 300
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "optimized_budget": {
      "Food": 550,
      "Transport": 400,
      "Entertainment": 250,
      "Savings": 300
    },
    "improvements": [
      {
        "category": "Food",
        "change": -50,
        "reason": "Reduce eating out frequency"
      }
    ],
    "projected_savings": 300.00
  },
  "message": "Budget optimized successfully"
}
```

**Notes:**
- Analyzes last 3 months of spending
- Suggests reallocation for better outcomes
- Returns current budget if no data

---

## 🎯 Personalized Recommendations

### 8. Get Spending Habits
Analyze spending patterns and habits over time.

**Endpoint:** `GET /api/ml/recommendations/habits/:user_id`

**Response:**
```json
{
  "success": true,
  "data": {
    "habits": [
      {
        "pattern": "weekend_splurge",
        "description": "Spending increases by 40% on weekends",
        "frequency": "weekly",
        "impact": "medium"
      }
    ],
    "peak_spending_days": ["Saturday", "Sunday"],
    "average_daily_spend": 125.50
  },
  "message": "Spending habits analyzed successfully"
}
```

**Notes:**
- Analyzes last 12 months of transactions
- Identifies patterns and trends
- User access verification enforced

### 9. Get Savings Opportunities
Identify opportunities to save money.

**Endpoint:** `GET /api/ml/recommendations/opportunities/:user_id`

**Response:**
```json
{
  "success": true,
  "data": {
    "opportunities": [
      {
        "type": "subscription",
        "description": "Unused gym membership detected",
        "monthly_cost": 50.00,
        "annual_savings": 600.00,
        "confidence": 0.85
      }
    ],
    "total_potential_savings": 1200.00
  },
  "message": "Savings opportunities identified successfully"
}
```

**Notes:**
- Analyzes last 6 months of transactions
- Detects recurring charges and unused services
- Returns empty array if no data

### 10. Get Behavior Nudges
Receive motivational nudges to improve financial behavior.

**Endpoint:** `GET /api/ml/recommendations/nudges/:user_id`

**Response:**
```json
{
  "success": true,
  "data": {
    "nudges": [
      {
        "type": "goal_progress",
        "message": "You're 75% towards your vacation goal! Keep it up!",
        "action": "Save $200 more this month to stay on track",
        "urgency": "medium"
      }
    ]
  },
  "message": "Behavior nudges generated successfully"
}
```

**Notes:**
- Analyzes last 3 months of transactions
- Considers active financial goals
- Provides actionable motivational messages

---

## 🔧 Model Performance

### 11. Get Model Performance
View ML model performance metrics and accuracy.

**Endpoint:** `GET /api/ml/models/performance/:user_id`

**Response:**
```json
{
  "success": true,
  "data": {
    "models": {
      "expense_prediction": {
        "accuracy": 0.87,
        "mae": 125.50,
        "last_trained": "2025-12-01T10:00:00Z"
      },
      "health_scoring": {
        "accuracy": 0.92,
        "last_calculated": "2025-12-09T08:00:00Z"
      }
    },
    "data_quality": {
      "completeness": 0.95,
      "transactions_count": 1247
    }
  },
  "message": "Model performance retrieved successfully"
}
```

**Notes:**
- Shows accuracy metrics for each model
- Indicates when models were last updated
- User access verification enforced

---

## Error Responses

All endpoints follow consistent error response format:

### Insufficient Data
```json
{
  "success": true,
  "data": {
    "has_data": false,
    "message": "Need at least 6 months of transaction data",
    "predictions": []
  }
}
```

### Authentication Error
```json
{
  "success": false,
  "error": "Authentication required",
  "message": "No token provided"
}
```

### Access Denied
```json
{
  "success": false,
  "error": "Access denied"
}
```

### Server Error
```json
{
  "success": false,
  "error": "Failed to get health score",
  "message": "Internal server error"
}
```

### ML Service Unavailable
```json
{
  "success": false,
  "error": "ML service is not available. Please ensure it is running on port 8000.",
  "available": false
}
```

---

## Data Requirements

| Endpoint | Minimum Data Required |
|----------|----------------------|
| Advanced Expense Forecast | 6 months of transactions |
| Health Score | Any transactions |
| Health Trends | Previous health calculations |
| Benchmark | Any transactions |
| Budget Recommendations | Any transactions (6 months preferred) |
| Budget Alerts | Current month transactions |
| Optimize Budget | 3 months of transactions |
| Spending Habits | 12 months of transactions |
| Savings Opportunities | 6 months of transactions |
| Behavior Nudges | 3 months of transactions |
| Model Performance | None (shows metrics) |

---

## Database Tables

### financial_health_history
Stores historical health scores for trend analysis.
```sql
CREATE TABLE financial_health_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    score NUMERIC(5,2) CHECK (score >= 0 AND score <= 100),
    grade VARCHAR(2) CHECK (grade IN ('A', 'B', 'C', 'D', 'F')),
    recommendations JSONB,
    calculated_at TIMESTAMP DEFAULT NOW()
);
```

### budget_recommendations
Tracks AI-generated budget recommendations.
```sql
CREATE TABLE budget_recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    recommendation_type VARCHAR(50),
    category VARCHAR(50),
    current_amount NUMERIC,
    recommended_amount NUMERIC,
    savings_potential NUMERIC,
    priority VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    applied_at TIMESTAMP
);
```

### user_benchmarks
Stores peer comparison data.
```sql
CREATE TABLE user_benchmarks (
    id SERIAL PRIMARY KEY,
    age_group VARCHAR(20),
    income_bracket VARCHAR(20),
    avg_savings_rate NUMERIC,
    avg_expense_ratio NUMERIC,
    top_categories JSONB,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Migration

Run the database migration:
```bash
psql -U postgres -d pfms -f src/migrations/add_ml_phase2_tables.sql
```

Or using Docker:
```bash
docker exec -i postgres_container psql -U postgres -d pfms < src/migrations/add_ml_phase2_tables.sql
```

---

## Testing

Example using curl:

```bash
# Get health score
curl -X GET http://localhost:3000/api/ml/insights/health-score \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get budget recommendations
curl -X POST http://localhost:3000/api/ml/budget/recommend \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"total_budget": 5000}'

# Get spending habits
curl -X GET http://localhost:3000/api/ml/recommendations/habits/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Notes

1. **ML Service Dependency**: All endpoints require the Python ML backend to be running on `http://localhost:8000` (configurable via `ML_SERVICE_URL` environment variable)

2. **Timeouts**: All ML service calls have 5-10 second timeouts to prevent hanging requests

3. **Data Privacy**: Users can only access their own data. Route parameters with `:user_id` verify access

4. **Graceful Degradation**: Endpoints return friendly messages when insufficient data is available instead of errors

5. **Transaction Transformation**: All transactions are automatically transformed to match ML backend schema before being sent

6. **Database Storage**: Health scores and budget recommendations are automatically stored for historical tracking
