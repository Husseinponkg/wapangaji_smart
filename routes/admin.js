const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const {
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
} = require('../controllers/adminController');

// Admin login route
router.post('/login', adminLogin);

// Protected routes (require admin authentication)
router.use(adminAuth);

// Get dashboard statistics
router.get('/dashboard/stats', getDashboardStats);

// Get all users
router.get('/users', getAllUsers);

// Get user by ID
router.get('/users/:id', getUserById);

// Update user information
router.put('/users/:id', updateUser);

// Change user role
router.put('/users/:id/role', changeUserRole);

// Suspend user
router.put('/users/:id/suspend', suspendUser);

// Delete user
router.delete('/users/:id', deleteUser);

// Create new admin
router.post('/admins', createAdmin);

// Get all admins
router.get('/admins', getAllAdmins);

// Delete admin
router.delete('/admins/:id', deleteAdmin);

module.exports = router;