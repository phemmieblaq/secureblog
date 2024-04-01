require('dotenv').config();
const { Pool } = require('pg');

// Set up pool using the environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Function to test the database connection and set the schema
const testDBConnection = async (schemaName ) => {
  try {
    const client = await pool.connect(); // Get a client from the connection pool
    await client.query(`SET search_path TO ${schemaName}, public`); // Execute a simple query to set the schema
    console.log(`Connected to the database`);
    client.release(); // Release the client back to the pool
  } catch (err) {
    console.error('Failed to connect to the database', err);
  }
};

// Set schema (adjust the schema name as necessary)


// Export pool and testDBConnection for use elsewhere in the application
module.exports = {
  pool,
  testDBConnection
};


// {
//   "username": "john_111",
//   "email": "phemmieblaq12@example.com",
//   "phone": "1234567890",
//   "password_hash": "hashed_password1231"
// }
