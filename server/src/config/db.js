const mongoose = require("mongoose");

let databaseReady = false;

async function connectDatabase() {
  const uri = process.env.MONGO_URI || process.env.MONGO_URL;

  if (!uri) {
    console.log("MONGO_URI not provided. Running in demo-memory mode.");
    databaseReady = false;
    return;
  }

  try {
    await mongoose.connect(uri, {
      dbName: process.env.MONGO_DB_NAME || "medivision-ai",
    });
    databaseReady = true;
    console.log("MongoDB connected.");
  } catch (error) {
    databaseReady = false;
    console.warn("MongoDB unavailable. Falling back to demo-memory mode.");
    console.warn(error.message);
  }
}

function isDatabaseReady() {
  return databaseReady && mongoose.connection.readyState === 1;
}

module.exports = {
  connectDatabase,
  isDatabaseReady,
};
