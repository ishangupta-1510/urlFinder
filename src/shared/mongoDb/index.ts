import mongoose from "mongoose";
import appConstants from "../../services/appConstants";

const MONGO_URI = appConstants.MONGO_DB_URL;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected!');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
