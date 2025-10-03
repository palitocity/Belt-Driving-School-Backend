const jwt = require('jsonwebtoken');

function adminOnly(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    req.admin = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Token is not valid' });
  }
}

module.exports = adminOnly;
