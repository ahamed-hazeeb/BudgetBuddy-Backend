require('dotenv').config();

const config = {
    PORT: process.env.PORT || 3000,
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: process.env.DB_PORT || 5432,
    DB_NAME: process.env.DB_NAME || 'pfms',
    DB_USER: process.env.DB_USER || 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:8000',
    ML_SERVICE_TIMEOUT: parseInt(process.env.ML_SERVICE_TIMEOUT) || 30000,
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    NODE_ENV: process.env.NODE_ENV || 'development'
};

module.exports = config;
