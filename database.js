import mongoose from 'mongoose';
import { mongoDBURL } from './config.js';

const connectDatabase = () => {
  mongoose.connect(mongoDBURL)
    .then((con) => {
      console.log(`MongoDB Database connected with HOST: ${con.connection.host}`);
    })
    .catch((err) => console.log('MongoDB connection error:', err));
};

export default connectDatabase;
