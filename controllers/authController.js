const bcrypt = require('bcrypt');
const db = require('../config/db');

// Salt rounds for bcrypt hashing
const SALT_ROUNDS = 10;

// Valid payment methods
//const VALID_PAYMENT_METHODS = ['airtel_money', 'mpesa', 'halopesa', 'mixx_by_yas'];

// Register function with validation and security
const register = async (req, res) => {
  try {
    // Extract data from request body
    const { f_name, l_name, email, password, role} = req.body;
    
    // Validate required fields
    if (!f_name || !l_name || !email || !password || !role ) {
      return res.status(400).json({
        error: 'All fields are required: first name, last name, email, password, and role'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }
    
    // Validate password strength (at least 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }
    
    // Validate role
    const validRoles = ['mpangaji', 'dalali', 'mwenyenyumba'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: 'Invalid role. Must be one of: mpangaji, dalali, mwenyenyumba'
      });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Insert user into database
    const sql = `INSERT INTO users (f_name, l_name, email, password, role) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [f_name, l_name, email, hashedPassword, role]);
    
    // Return success response
    res.status(201).json({
      id: result.insertId,
      message: 'User successfully registered'
    });
  } catch (err) {
    // Handle duplicate email error
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        error: 'Email already exists'
      });
    }
    
    // Handle other errors
    console.error(err);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Login function
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }
    
    // Find user in database
    const sql = `SELECT id, f_name, l_name, email, password, role FROM users WHERE email = ?`;
    const [rows] = await db.execute(sql, [email]);
    
    // Check if user exists
    if (rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }
    
    const user = rows[0];
    
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }
    
    // Return user data (excluding password)
    const { password: _, ...userData } = user;
    res.status(200).json({
      user: userData,
      message: 'Login successful'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

module.exports = {
  register,
  login
};