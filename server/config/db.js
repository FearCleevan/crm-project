// server/config/db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm-project',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection immediately
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connection successful');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
    process.exit(1); // Exit if DB connection fails
  });

export default pool;