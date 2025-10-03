import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm-project',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 20, // Increased for bulk operations
  acquireTimeout: 60000, // 60 seconds timeout
  timeout: 60000, // 60 seconds query timeout
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+00:00',
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Additional performance optimizations
  multipleStatements: false, // Security: keep this false
  connectTimeout: 60000, // 60 seconds connection timeout
  decimalNumbers: true, // Better decimal handling
  typeCast: true, // Proper type casting
});

// Test connection with better error handling
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connection successful');
    
    // Test query to verify database is responsive
    return connection.execute('SELECT 1 + 1 AS result')
      .then(() => {
        console.log('✅ Database test query successful');
        connection.release();
      })
      .catch(testError => {
        console.error('❌ Database test query failed:', testError.message);
        connection.release();
      });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.error('Connection details:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
  });

// Enhanced error handling for pool
pool.on('acquire', (connection) => {
  console.log('🔗 Connection %d acquired', connection.threadId);
});

pool.on('release', (connection) => {
  console.log('🔗 Connection %d released', connection.threadId);
});

pool.on('enqueue', () => {
  console.log('⏳ Waiting for available connection slot...');
});

export default pool;