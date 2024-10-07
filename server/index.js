const express = require('express');
require('dotenv').config();
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet'); 
const csurf = require('csurf'); 




const { testDBConnection } = require('./src/database');
const userRoutes = require('./src/routes/appRoutes'); // Ensure this path is correct

testDBConnection();
// Immediately set the schema after establishing the connection pool


const app = express();
const corsOptions = {
  origin: 'http://localhost:8000', // Add other IPs if necessary
  credentials: true, // To allow sessions and cookies to be sent
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization, CSRF-Token'
};

app.use(cors(corsOptions));

app.use(cookieParser());




// Middleware to parse JSON bodies
app.use(express.json());
app.use(helmet());
app.use(csurf({ cookie: true }));



if (!process.env.SECRET_SESSION_KEY) {
  throw new Error('SESSION_SECRET is not set');
}

app.use(session({
  secret: process.env.SECRET_SESSION_KEY, // Secret key to sign the session cookie
  resave: false, // Avoids resaving session if nothing changed
  saveUninitialized: false, // Don't save an uninitialized session
  cookie: {
    httpOnly: true,
    secure: false, // Set to true and add SameSite=None in production if accessed over HTTPS
    maxAge: 1 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict', // This attribute can prevent cookies from being sent in cross-site requests
    domain: 'localhost',
  }
}));

app.use((req, res, next) => {
  req.session.save(() => next());
  // console.log('Session:', req.session);
});
// New route to send CSRF token
app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.get('/protected-route', (req, res) => {
  const token = req.cookies['accessToken']; 
  if (!token) {
    return res.status(403).send('Session has expired. Please log in again.');
  }

  // If the session exists, continue with your route handling
  res.send('You are authenticated!');
});




app.use('', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  //console.log(`Server running on http://localhost:${PORT}`);
});


module.exports = { app };