const jwt = require('jsonwebtoken');
const db = require('../config/db');

const adminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin_secret_key');
    
    // Check if admin exists in database
    const [rows] = await db.execute('SELECT id, username FROM admin WHERE id = ?', [decoded.id]);
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Token is not valid' });
    }
    
    // Add admin to request object
    req.admin = rows[0];
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = adminAuth;