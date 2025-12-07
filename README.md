# BudgetBuddy Backend

A comprehensive Personal Finance Management System backend with clean ML integration for intelligent financial insights and predictions.

## 🚀 Features

### Core Financial Management
- **User Management**: Secure authentication with JWT tokens
- **Transaction Tracking**: Complete CRUD operations for income and expenses
- **Budget Management**: Set and track overall monthly budgets with spending analysis
- **Bill Tracking**: Manage recurring bills with due date reminders
- **Financial Goals**: Set and monitor progress toward financial objectives
- **Account Management**: Track multiple accounts (cash, card, savings)
- **Category Management**: Organize transactions with custom categories
- **Receipt Processing**: OCR-powered receipt scanning with Tesseract.js

### Advanced Features
- **Financial Reports**: Comprehensive spending and income analysis
- **Workflow Automation**: BPMN-powered workflow engine for automated financial processes
- **Future Planning**: Long-term financial goal planning with timeline calculations

### ML Integration (Python Backend)
- **Savings Predictions**: AI-powered predictions for future savings
- **Goal Timeline Calculator**: Intelligent goal achievement timeline estimation
- **Reverse Goal Planning**: Calculate required monthly savings for targets
- **User Insights**: Personalized spending pattern analysis
- **Auto-Training**: Automatic model training with fallback mechanisms

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **ML Integration**: Axios (Python ML service client)
- **Workflow Engine**: BPMN Engine
- **OCR**: Tesseract.js
- **File Upload**: Multer
- **Validation**: Express Validator
- **Logging**: Winston

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Python ML Service (for ML features)

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/ahamed-hazeeb/BudgetBuddy-Backend.git
cd BudgetBuddy-Backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pfms
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_TIMEOUT=30000
CORS_ORIGIN=http://localhost:3001
LOG_LEVEL=info
NODE_ENV=development
```

4. **Set up PostgreSQL database**
```sql
CREATE DATABASE pfms;

-- Create tables (run these in psql or your PostgreSQL client)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_type VARCHAR(50) NOT NULL CHECK(account_type IN ('cash', 'card', 'savings', 'other')),
    balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
    amount DECIMAL(15,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    type VARCHAR(10) CHECK(type IN ('income', 'expense')) NOT NULL,
    date DATE NOT NULL,
    note TEXT DEFAULT ''
);

CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) CHECK(status IN ('active', 'expired')) DEFAULT 'active',
    UNIQUE(user_id)
);

CREATE TABLE bills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bill_name VARCHAR(255) NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) CHECK(status IN ('paid', 'unpaid')) DEFAULT 'unpaid',
    reminder_sent BOOLEAN DEFAULT false
);

CREATE TABLE financial_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_savings DECIMAL(15,2) DEFAULT 0,
    target_date DATE NOT NULL
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense'))
);

CREATE TABLE future_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_savings DECIMAL(15,2) NOT NULL,
    target_date DATE NOT NULL,
    monthly_savings DECIMAL(15,2) NOT NULL
);
```

5. **Start the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Login User
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Transaction Endpoints

#### Add Transaction
```http
POST /api/transactions
Content-Type: application/json

{
  "user_id": 1,
  "account_id": 1,
  "amount": 1500.00,
  "category": "Salary",
  "type": "income",
  "date": "2024-01-15",
  "note": "Monthly salary"
}
```

#### Get User Transactions
```http
GET /api/transactions/:user_id
```

#### Update Transaction
```http
PUT /api/transactions/:id
Content-Type: application/json

{
  "user_id": 1,
  "amount": 1600.00,
  "category": "Salary",
  "type": "income",
  "date": "2024-01-15",
  "note": "Updated salary"
}
```

#### Delete Transaction
```http
DELETE /api/transactions/:id
Content-Type: application/json

{
  "user_id": 1
}
```

### Budget Endpoints

#### Set Overall Budget
```http
POST /api/budgets
Content-Type: application/json

{
  "user_id": 1,
  "amount": 5000.00,
  "start_date": "2024-01-01",
  "end_date": "2024-01-31"
}
```

#### Get Overall Budget
```http
GET /api/budgets/:user_id
```

#### Get Spending
```http
GET /api/budgets/spending?user_id=1&start_date=2024-01-01&end_date=2024-01-31
```

### ML Endpoints

#### Health Check
```http
GET /api/ml/health
```

#### Train Model
```http
POST /api/ml/train
Content-Type: application/json

{
  "user_id": 1
}
```

#### Get Predictions
```http
GET /api/ml/predictions?user_id=1&months=6
```

#### Get Predictions with Auto-Training
```http
GET /api/ml/predictions/auto?user_id=1&months=6
```

#### Calculate Goal Timeline
```http
POST /api/ml/goals/timeline
Content-Type: application/json

{
  "user_id": 1,
  "target_amount": 10000,
  "current_savings": 2000,
  "monthly_savings": 500
}
```

#### Reverse Plan Goal
```http
POST /api/ml/goals/reverse-plan
Content-Type: application/json

{
  "user_id": 1,
  "target_amount": 10000,
  "current_savings": 2000,
  "target_date": "2024-12-31"
}
```

#### Get User Insights
```http
GET /api/ml/insights?user_id=1
```

#### Get Insights Summary
```http
GET /api/ml/insights/summary?user_id=1
```

### Bill Endpoints

#### Add Bill
```http
POST /api/bills
Content-Type: application/json

{
  "user_id": 1,
  "bill_name": "Electricity",
  "due_date": "2024-01-25",
  "amount": 150.00
}
```

#### Get User Bills
```http
GET /api/bills/:user_id
```

### Goal Endpoints

#### Add Goal
```http
POST /api/goals
Content-Type: application/json

{
  "user_id": 1,
  "goal_name": "Emergency Fund",
  "target_amount": 10000,
  "current_savings": 2000,
  "target_date": "2024-12-31"
}
```

#### Get User Goals
```http
GET /api/goals/:user_id
```

### Account Endpoints

#### Create Account
```http
POST /api/accounts
Content-Type: application/json

{
  "user_id": 1,
  "account_type": "savings",
  "balance": 5000.00
}
```

#### Get User Accounts
```http
GET /api/accounts/:user_id
```

### Category Endpoints

#### Create Category
```http
POST /api/categories
Content-Type: application/json

{
  "user_id": 1,
  "name": "Groceries",
  "type": "expense"
}
```

#### Get Categories
```http
GET /api/categories/:user_id
```

### Receipt Processing

#### Process Receipt
```http
POST /api/process-receipt
Content-Type: multipart/form-data

receipt: [image file]
user_id: 1
account_id: 1
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
docker-compose up -d
```

### Manual Docker Build

```bash
# Build image
docker build -t budgetbuddy-backend .

# Run container
docker run -p 3000:3000 --env-file .env budgetbuddy-backend
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📁 Project Structure

```
BudgetBuddy-Backend/
├── src/
│   ├── config/
│   │   ├── db.js              # PostgreSQL connection pool
│   │   └── dotenv.js          # Environment configuration
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── transactionController.js
│   │   ├── budgetController.js
│   │   ├── billController.js
│   │   ├── goalController.js
│   │   ├── accountController.js
│   │   ├── categoryController.js
│   │   ├── reportController.js
│   │   ├── workflowController.js
│   │   ├── processReceiptController.js
│   │   ├── futurePlanController.js
│   │   └── mlController.js    # NEW: ML integration
│   ├── models/
│   │   ├── userModel.js
│   │   ├── transactionModel.js
│   │   ├── budgetModel.js
│   │   ├── billModel.js
│   │   ├── goalModel.js
│   │   ├── accounts.js
│   │   ├── categoryModel.js
│   │   └── futurePlanModel.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── budgetRoutes.js
│   │   ├── billRoutes.js
│   │   ├── goalRoutes.js
│   │   ├── accountRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── workflowRoutes.js
│   │   ├── processReceiptRoutes.js
│   │   ├── futurePlanRoutes.js
│   │   └── mlRoutes.js        # NEW: ML routes
│   ├── services/
│   │   └── mlService.js       # NEW: Python ML integration
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── workflows/
│   │   ├── expenseTrackingWorkflow.bpmn
│   │   ├── budgetManagementWorkflow.bpmn
│   │   ├── billReminderWorkflow.bpmn
│   │   └── futurePlanningWorkflow.bpmn
│   ├── uploads/               # Receipt uploads
│   ├── app.js                 # Express app configuration
│   └── server.js              # Server entry point
├── .env.example               # Environment template
├── .gitignore
├── package.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🔒 Security

- JWT authentication for secure API access
- Password hashing with bcryptjs
- Environment variables for sensitive data
- SQL injection prevention with parameterized queries
- CORS configuration for cross-origin requests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Author

**Ahamed Hazeeb**
- GitHub: [@ahamed-hazeeb](https://github.com/ahamed-hazeeb)

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- PostgreSQL for robust database management
- BPMN Engine for workflow automation
- Tesseract.js for OCR capabilities
- All contributors and supporters

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

**Note**: This backend requires a Python ML service to be running for ML features. The ML service should be accessible at the URL specified in `ML_SERVICE_URL` environment variable.
