require('dotenv').config();
const app = require('./app');
const config = require('./config/dotenv');
const db = require('./config/db');

// Test database connection
db.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Please check your database configuration in .env file');
  } else {
    console.log('✅ Database connected successfully');
    console.log(`Database time: ${result.rows[0].now}`);
  }
});

const PORT = config.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${config.NODE_ENV}`);
  console.log(`ML Service URL: ${config.ML_SERVICE_URL}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  db.end(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  db.end(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});
