const mongoose = require("mongoose");

let memoryServer;

const connectDb = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;
  if (uri) {
    await mongoose.connect(uri);
    return mongoose.connection;
  }

  if (
    process.env.USE_IN_MEMORY_DB === "true" ||
    process.env.NODE_ENV === "test"
  ) {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();
    await mongoose.connect(memUri);
    return mongoose.connection;
  }

  throw new Error(
    "MONGODB_URI not supplied. Set env var or enable USE_IN_MEMORY_DB=true"
  );
};

const disconnectDb = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = undefined;
  }
};

module.exports = {
  connectDb,
  disconnectDb,
};
