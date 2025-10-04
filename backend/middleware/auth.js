const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: `Missing token ${token}` });
  jwt.verify(token, secret, (err, user) => {
    if (err) return res.status(403).json({ error: `Invalid or expired token ${token}` });
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
