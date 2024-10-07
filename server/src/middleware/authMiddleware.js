const jwt = require('jsonwebtoken');


const authMiddleware = (req, res, next) => {
  const token = req.cookies['accessToken']; 
    console.log(req.cookies)                   // Access the token from HTTP-only cookies
  if (!token) {
    return res.sendStatus(401); // Unauthorized if no token
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log(err);
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' }); // Send specific message when token is expired
      }
      return res.sendStatus(403); // Forbidden if token is invalid
    }
    req.user = user;
    console.log(req.user);
    next();
  });
};

module.exports = authMiddleware;

  