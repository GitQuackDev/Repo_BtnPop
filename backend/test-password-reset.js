/**
 * This script tests the password reset functionality
 */
require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('./models/User');

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
    
    // Find the first user (likely an admin)
    const user = await User.findOne();
    
    if (!user) {
      console.error('No users found in the database');
      process.exit(1);
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set reset token and expiry
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
    await user.save();
    
    // Display reset URL (in a real app, this would be sent via email)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reset-password/${resetToken}`;
    
    console.log(`
=============================================
PASSWORD RESET TEST
=============================================
User: ${user.username} (${user.email})
Reset URL: ${resetUrl}
Token expiry: ${new Date(user.resetPasswordExpires).toLocaleString()}
=============================================
Go to this URL to test the password reset functionality.
    `);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB Connection Closed');
  }
}

main();
