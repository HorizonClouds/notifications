import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

const connectDB = async () => {
  console.log('Connecting to MongoDB...');
  let mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/microservice';
  let mongod;

  if (process.env.NODE_ENV === 'test') {
    mongod = await MongoMemoryServer.create();
    mongoURI = mongod.getUri();
  }

  try {
    //timeout 3 seconds
    await mongoose.connect(mongoURI, { connectTimeoutMS: 40000, serverSelectionTimeoutMS: 45000 });
    console.log(`Connected to MongoDB in ${process.env.NODE_ENV === 'test' ? 'test (in-memory)' : 'default'} mode`);
  } catch (error) {
    console.error('Initial connection failed, retrying with in-memory MongoDB.', error.message);
    if (!mongod) {
      mongod = await MongoMemoryServer.create();
      mongoURI = mongod.getUri();
    }
    try {
      await mongoose.connect(mongoURI);
      console.log('Connected to in-memory MongoDB after initial failure');
    } catch (err) {
      console.error('Failed to connect to in-memory MongoDB', err);
    }
  }
};

export default connectDB;
