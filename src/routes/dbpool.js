const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool instance using configuration from environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false // Note: For development only; adjust for production
  },
  connectionTimeoutMillis: 10000, // Optional: Adjust based on your needs
  idleTimeoutMillis: 10000, // Optional: Adjust based on your needs
  query_timeout: 60000, // Optional: Adjust based on your needs
  max: 20, // Optional: Adjust based on your needs
  min: 2   // Optional: Adjust based on your needs
});

module.exports = pool;
