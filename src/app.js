const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

// Import all routes
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const billRoutes = require('./routes/billRoutes');
const goalRoutes = require('./routes/goalRoutes');
const accountRoutes = require('./routes/accountRoutes');
const futurePlanRoutes = require('./routes/futurePlanRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const reportRoutes = require('./routes/reportRoutes');
const processReceiptRoutes = require('./routes/processReceiptRoutes');
const mlRoutes = require('./routes/mlRoutes'); // NEW

const app = express();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'BudgetBuddy Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api', transactionRoutes);
app.use('/api', futurePlanRoutes);
app.use('/api', budgetRoutes);
app.use('/api', billRoutes);
app.use('/api', goalRoutes);
app.use('/api', accountRoutes);
app.use('/api', workflowRoutes);
app.use('/api', categoryRoutes);
app.use('/api', reportRoutes);
app.use('/api/process-receipt', processReceiptRoutes);
app.use('/api/ml', mlRoutes); // NEW ML routes

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;
