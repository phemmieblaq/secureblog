const express = require('express');
require('dotenv').config();

const { testDBConnection } = require('./src/database');
const userRoutes = require('./src/routes/userRoutes'); // Ensure this path is correct
const defaultSchema = 'blog';
testDBConnection(defaultSchema);
// Immediately set the schema after establishing the connection pool



const app = express();



// Middleware to parse JSON bodies
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Express Server');
});

// Use '/signin' as the route prefix for user routes
app.use('/user', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
