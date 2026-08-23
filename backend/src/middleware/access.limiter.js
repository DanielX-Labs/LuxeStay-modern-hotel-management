const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../configs/app.response');
const logger = require('./winston.logger');

const createHandler = (message) => (req, res, _next, options) => {
  logger.warn(`Rate limit exceeded: ${req.method} ${req.originalUrl}`);
  return res.status(options.statusCode).json(errorResponse(29, 'TOO MANY REQUESTS', message));
};

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createHandler('Too many requests. Please try again later.')
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createHandler('Too many login attempts. Please try again in one minute.')
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createHandler('Too many verification requests. Please try again later.')
});

module.exports = { limiter, apiLimiter, otpLimiter };
