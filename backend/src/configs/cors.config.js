const localOrigins = [
  'http://localhost:3033',
  'http://localhost:3034',
  'http://localhost:3000'
];

const productionOrigins = [process.env.CLIENT_URL, process.env.ADMIN_URL].filter(Boolean);
const allowedOrigins = new Set(
  (process.env.NODE_ENV === 'production' ? productionOrigins : [...localOrigins, ...productionOrigins])
    .map((origin) => origin.replace(/\/$/, ''))
);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin.replace(/\/$/, ''))) {
      return callback(null, true);
    }

    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 204
};

module.exports = corsOptions;