const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT, isAdmin } = require('../middleware/auth');
const { validateUserRegistration, validateLogin, validatePasswordReset } = require('../middleware/validation');

// Register new user (admin only)
router.post('/register', authenticateJWT, isAdmin, validateUserRegistration, authController.register);

// Login user
router.post('/login', validateLogin, authController.login);

// Password reset request (forgot password)
router.post('/forgot-password', authController.forgotPassword);

// Password reset (with token)
router.post('/reset-password/:token', validatePasswordReset, authController.resetPassword);

// Get current user
router.get('/me', authenticateJWT, authController.getCurrentUser);

// Get all users (admin only)
router.get('/users', authenticateJWT, isAdmin, authController.getAllUsers);

// Update user (admin only or own account)
router.put('/users/:id', authenticateJWT, (req, res, next) => {
  // Allow users to update their own account or admins to update any account
  if (req.user._id.toString() === req.params.id || req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied' });
  }
}, authController.updateUser);

// Delete user (admin only)
router.delete('/users/:id', authenticateJWT, isAdmin, authController.deleteUser);

module.exports = router;
