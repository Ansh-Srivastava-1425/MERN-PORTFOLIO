require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createAdmin = async () => {
  const args = process.argv.slice(2);
  const name = args[0] || 'Admin';
  const email = args[1] || 'admin@example.com';
  const password = args[2] || 'password123';

  if (!process.env.MONGO_URI) {
    console.error('Error: MONGO_URI is not defined in backend/.env file');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // Check if any admin already exists
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.error('Error: An admin account already exists in the database. Cannot create another.');
      process.exit(1);
    }

    console.log(`Creating admin account:`);
    console.log(`- Name: ${name}`);
    console.log(`- Email: ${email}`);
    console.log(`- Password: ${password}`);

    const admin = await User.create({
      name,
      email,
      password,
    });

    console.log('\nSUCCESS: Admin account created successfully!');
    console.log('You can now log in at http://localhost:5173/admin/login');
  } catch (error) {
    console.error('Error creating admin account:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

createAdmin();
