const jwt = require('jsonwebtoken');


const authMiddleware = (req, res, next) => {
  const token = req.cookies['accessToken']; // Access the token from HTTP-only cookies
  if (!token) {
    return res.sendStatus(401); // Unauthorized if no token
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log(err);
      return res.sendStatus(403); // Forbidden if token is invalid
    }
    req.user = user;
    next();
  });
};

module.exports = authMiddleware;

  