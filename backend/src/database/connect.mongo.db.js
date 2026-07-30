const mongoose = require('mongoose');
const logger = require('../middleware/winston.logger');
const ensureDefaultAdmin = require('./ensure.default.admin');

mongoose.set('strictQuery', false);

let connectionPromise;

const connectDatabase = () => {
  if (mongoose.connection.readyState === 1) {
    return ensureDefaultAdmin().then(() => mongoose.connection);
  }

  if (!process.env.MONGODB_URI) {
    return Promise.reject(new Error('MONGODB_URI is not configured'));
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 8000),
      connectTimeoutMS: Number(process.env.MONGODB_CONNECT_TIMEOUT_MS || 8000)
    })
      .then(async () => {
        logger.info('Connected to MongoDB');
        await ensureDefaultAdmin();
        return mongoose.connection;
      })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  return connectionPromise;
};

module.exports = connectDatabase;