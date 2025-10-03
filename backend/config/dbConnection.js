const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();
mongoose.set('strictQuery', false);
const connectDB = async () => {
  try {

    const conn = await mongoose.connect((process.env.DB_CONNECT),{ useNewUrlParser: true, useUnifiedTopology: true });
    console.log(`MongoDB Connected: ${conn.connection.name}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); 

  }
};

module.exports = connectDB;