require('dotenv').config();

const app = require('./index');
const mongoose = require('mongoose');
const connectDatabase = require('./src/database/connect.mongo.db');
const logger = require('./src/middleware/winston.logger');

const port = Number(process.env.PORT) || 3035;

const requiredProductionVariables = [
  'MONGODB_URI',
  'CLIENT_URL',
  'ADMIN_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const validateProductionEnvironment = () => {
  if (process.env.NODE_ENV !== 'production') return;

  const missing = requiredProductionVariables.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }
};

const startServer = async () => {
  validateProductionEnvironment();
  await connectDatabase();

  const server = app.listen(port, '0.0.0.0', () => {
    logger.info(`LuxeStay API listening on port ${port}`);
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received; shutting down gracefully`);
    server.close(async () => {
      await mongoose.connection.close().catch((error) => logger.error(error));
      process.exit(0);
    });

    setTimeout(() => process.exit(1), 25000).unref();
  };

  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch((error) => {
  logger.error(error);
  process.exit(1);
});
