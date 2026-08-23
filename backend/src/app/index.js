// imports modules & dependencies
const express = require('express');
const favicon = require('serve-favicon');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const appRoot = require('app-root-path');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const fs = require('fs');

// imports application middleware and routes
const morganLogger = require('../middleware/morgan.logger');
const connectDatabase = require('../database/connect.mongo.db');
const defaultController = require('../controllers/default.controller');
const { notFoundRoute, errorHandler } = require('../middleware/error.handler');
const { limiter } = require('../middleware/access.limiter');
const corsOptions = require('../configs/cors.config');
const authRoute = require('../routes/auth.routes');
const userRoute = require('../routes/user.routes');
const appsRoute = require('../routes/apps.routes');
const roomRoute = require('../routes/room.routes');
const bookingRoute = require('../routes/booking.route');
const reviewRoute = require('../routes/review.routes');

// initialize express app
const app = express();

// Render terminates TLS at its proxy. Trust one proxy hop so secure request
// metadata and IP-based rate limiting use the original client request.
app.set('trust proxy', 1);

// Apply security and CORS headers before rate limiting or database work.
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Attach request logging before rate limiting so rejected admin requests are
// visible in the backend terminal too.
app.use(morganLogger());

// limiting middleware to all requests
app.use(limiter);

// Reuse one cached database connection across serverless invocations.
app.use(async (_req, _res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
});
// parse cookies from request
app.use(cookieParser());

// parse body of request
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// sets favicon if exists
const faviconPath = path.join(appRoot.path, 'public', 'favicon.ico');
if (fs.existsSync(faviconPath)) {
  app.use(favicon(faviconPath));
} else {
  // eslint-disable-next-line no-console
  console.warn('⚠️  Favicon not found at /public/favicon.ico, skipping favicon setup');
}

// sets static folder
app.use(express.static(path.join(appRoot.path, 'public')));

// parse requests of content-type ~ application/json
app.use(express.json());

// parse requests of content-type ~ application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// response default and health-check routes
app.get('/', defaultController);
app.get('/health', (_req, res) => res.status(200).json({
  status: 'ok',
  service: 'luxestay-api',
  uptime: Math.floor(process.uptime())
}));

// sets application API's routes
app.use('/api/v1', authRoute); // auth routes
app.use('/api/v1', userRoute); // user routes
app.use('/api/v1', appsRoute); // apps routes
app.use('/api/v1', roomRoute); // room routes
app.use('/api/v1', bookingRoute); // booking routes
app.use('/api/v1', reviewRoute); // review routes

// 404 ~ not found error handler
app.use(notFoundRoute);

// 500 ~ internal server error handler
app.use(errorHandler);

// default export ~ app
module.exports = app;
