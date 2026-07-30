const winston = require('winston');

const { combine, timestamp, printf, errors } = winston.format;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
    errors({ stack: true }),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.stack || info.message}`)
  ),
  transports: [new winston.transports.Console()]
});

module.exports = logger;