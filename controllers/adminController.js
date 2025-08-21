const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Salt rounds for bcrypt hashing
const SALT_ROUNDS = 10;

// Admin login function
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required'
      });
    }
    
    // Find admin in database
    const sql = `SELECT id, username, password FROM admin WHERE username = ?`;
    const [rows] = await db.execute(sql, [username]);
    
    // Check if admin exists
    if (rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }
    
    const admin = rows[0];
    
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET || 'admin_secret_key',
      { expiresIn: '24h' }
    );
    
    // Return token
    res.status(200).json({
      token,
      message: 'Login successful'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const sql = `SELECT id, f_name, l_name, email, role, suspended, created_at FROM users ORDER BY id DESC`;
    const [rows] = await db.execute(sql);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `SELECT id, f_name, l_name, email, role, suspended, created_at FROM users WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const [userRows] = await db.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete user from database
    const sql = `DELETE FROM users WHERE id = ?`;
    await db.execute(sql, [id]);
    
    // Return success response
    res.status(200).json({ message: 'User successfully deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get total users count
    const [usersCount] = await db.execute('SELECT COUNT(*) as count FROM users');
    
    // Get users by role
    const [usersByRole] = await db.execute(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `);
    
    res.status(200).json({
      totalUsers: usersCount[0].count,
      usersByRole: usersByRole
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new admin
const createAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required'
      });
    }
    
    // Check if admin already exists
    const [existingAdmin] = await db.execute('SELECT id FROM admin WHERE username = ?', [username]);
    if (existingAdmin.length > 0) {
      return res.status(400).json({
        error: 'Admin with this username already exists'
      });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Insert new admin into database
    const sql = `INSERT INTO admin (username, password) VALUES (?, ?)`;
    const [result] = await db.execute(sql, [username, hashedPassword]);
    
    // Return success response
    res.status(201).json({
      id: result.insertId,
      message: 'Admin successfully created'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all admins
const getAllAdmins = async (req, res) => {
  try {
    const sql = `SELECT id, username FROM admin ORDER BY id DESC`;
    const [rows] = await db.execute(sql);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete admin
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if admin exists
    const [adminRows] = await db.execute('SELECT id FROM admin WHERE id = ?', [id]);
    if (adminRows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    
    // Delete admin from database
    const sql = `DELETE FROM admin WHERE id = ?`;
    await db.execute(sql, [id]);
    
    // Return success response
    res.status(200).json({ message: 'Admin successfully deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user information
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { f_name, l_name, email, role } = req.body;
    
    // Check if user exists
    const [userRows] = await db.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user information
    const sql = `UPDATE users SET f_name = ?, l_name = ?, email = ?, role = ? WHERE id = ?`;
    await db.execute(sql, [f_name, l_name, email, role, id]);
    
    // Return success response
    res.status(200).json({ message: 'User successfully updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Change user role
const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Check if user exists
    const [userRows] = await db.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user role
    const sql = `UPDATE users SET role = ? WHERE id = ?`;
    await db.execute(sql, [role, id]);
    
    // Return success response
    res.status(200).json({ message: 'User role successfully updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Suspend user
const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { suspended } = req.body;
    
    // Check if user exists
    const [userRows] = await db.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user suspension status
    const sql = `UPDATE users SET suspended = ? WHERE id = ?`;
    await db.execute(sql, [suspended, id]);
    
    // Return success response
    const action = suspended ? 'suspended' : 'unsuspended';
    res.status(200).json({ message: `User successfully ${action}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  adminLogin,
  getAllUsers,
  getUserById,
  deleteUser,
  getDashboardStats,
  createAdmin,
  getAllAdmins,
  deleteAdmin,
  updateUser,
  changeUserRole,
  suspendUser
};