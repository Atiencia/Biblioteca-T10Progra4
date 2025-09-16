import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('MONGODB_URI no definido');

declare global {
  // para evitar múltiples conexiones en development 
  var mongoosePromise: Promise<typeof mongoose> | undefined;
}

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!global.mongoosePromise) {
    global.mongoosePromise = mongoose.connect(MONGODB_URI as string, {
    });
  }
  await global.mongoosePromise;
  return mongoose;
}
