import mongoose from 'mongoose';

// Connects to MONGODB_URI if set (e.g. MongoDB Atlas or a local mongod).
// Without it, spins up an in-memory MongoDB so local dev works out of the box.
export async function connectDB() {
  let uri = process.env.MONGODB_URI;

  if (!uri) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mem = await MongoMemoryServer.create();
    uri = mem.getUri('primavista');
    console.log('MONGODB_URI not set — using in-memory MongoDB (data is not persisted)');
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
