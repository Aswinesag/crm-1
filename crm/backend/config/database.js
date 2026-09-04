const mongoose = require('mongoose');
module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(process.env.MONGODB_URI,"mongodb uri")
    console.log('MongoDB connected');
  } catch (err) {
    console.error(`MongoDB Connection Error : ${err}`);
    process.exit(1);
  }
};
