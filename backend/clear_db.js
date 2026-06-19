const mongoose = require('mongoose');
require('dotenv').config();

async function clear() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await mongoose.connection.db.dropDatabase();
    console.log('Database cleared successfully!');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await mongoose.disconnect();
  }
}
clear();
