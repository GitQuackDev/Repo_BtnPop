require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Admin user credentials
const adminUser = {
  username: 'admin',
  email: 'admin@btnpop.com',
  password: 'adminPassword123', // Change this in production!
  role: 'admin'
};

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('MongoDB Connected');
    
    try {
      // Check if any user exists
      const userCount = await User.countDocuments();
      
      if (userCount === 0) {
        // Create admin user if no users exist
        const user = new User(adminUser);
        await user.save();
        console.log('Admin user created successfully');
      } else {
        console.log('Users already exist, no need to create admin');
      }
      
      process.exit(0);
    } catch (error) {
      console.error('Error initializing admin user:', error);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });
