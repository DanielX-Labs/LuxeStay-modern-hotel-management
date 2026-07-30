require('dotenv').config();

const app = require('./index');
const logger = require('./src/middleware/winston.logger');

const port = Number(process.env.PORT) || 3035;

app.listen(port, () => {
  logger.info(`API listening on http://localhost:${port}`);
});