require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Make sure to include bcrypt for password comparison
const { pool } = require('./database'); // Assuming you have a pool exported from your database setup
const queries = require('./queries'); // Assuming you have a file for SQL queries

const app = express();
app.use(express.json());

let refreshTokens = [];

// Generate Access Token
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' }); // Adjusted expiresIn to 1h for demonstration
}

// POST: Token Refresh Endpoint
app.post('/token', (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});

// DELETE: Logout Endpoint
app.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter(token => token !== req.body.token);
  res.sendStatus(204); // No content to send back
});

// POST: Login Endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query(queries.getUserByEmail, [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = jwt.sign({ userId: user.id, email: user.email }, process.env.REFRESH_TOKEN_SECRET);
    refreshTokens.push(refreshToken);
    res.json({ accessToken: accessToken, refreshToken: refreshToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred during the login process" });
  }
});


