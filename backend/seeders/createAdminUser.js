require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@smie.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@smie.com',
      password: 'admin123',
      role: 'Super Admin',
      phoneNum: '9876543210',
      location: 'Chennai',
    });

    console.log('Admin user created successfully:');
    console.log('Email: admin@smie.com');
    console.log('Password: admin123');
    console.log('Role: Super Admin');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
