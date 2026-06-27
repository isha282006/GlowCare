import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { seedDatabaseInline } from '../seeds/seedData';

let mongod: MongoMemoryServer | null = null;

const connectDB = async (): Promise<void> => {
  try {
    // Try connecting to the user's MONGODB_URI (e.g. Atlas or local)
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(`MongoDB Connected to external DB: ${conn.connection.host}`);
  } catch (error: any) {
    console.warn(`MongoDB Connection to ${process.env.MONGODB_URI} failed: ${error.message}`);
    console.log('Spawning an in-memory MongoDB database fallback for GlowCare...');
    try {
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`Fallback MongoDB Connected to Memory: ${conn.connection.host}`);
      
      // Auto seed database since it starts completely empty!
      console.log('Auto-seeding in-memory database with default GlowCare data...');
      await seedDatabaseInline();
    } catch (fallbackError: any) {
      console.error(`Fallback MongoDB Memory Connection Error: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
