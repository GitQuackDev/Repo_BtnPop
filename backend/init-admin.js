require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');


const adminUser = {
  username: 'admin',
  email: 'admin@btnpop.com',
  password: 'adminPassword123', 
  role: 'admin'
};


mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('MongoDB Connected');
    
    try {
      
      const userCount = await User.countDocuments();
      
      if (userCount === 0) {
        
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
