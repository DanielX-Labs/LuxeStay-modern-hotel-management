const morgan = require('morgan');
const logger = require('./winston.logger');

const colors = {
  green: '\u001b[32m',
  cyan: '\u001b[36m',
  yellow: '\u001b[33m',
  red: '\u001b[31m',
  reset: '\u001b[0m'
};

const colorStatus = (status) => {
  const code = Number(status);
  if (process.env.NO_COLOR) return String(status);
  if (code >= 500) return `${colors.red}${status}${colors.reset}`;
  if (code >= 400) return `${colors.yellow}${status}${colors.reset}`;
  if (code >= 300) return `${colors.cyan}${status}${colors.reset}`;
  return `${colors.green}${status}${colors.reset}`;
};

function morganLogger() {
  return morgan((tokens, req, res) => {
    const status = colorStatus(tokens.status(req, res));
    const responseTime = tokens['response-time'](req, res);
    return `${tokens.method(req, res)} ${tokens.url(req, res)} ${status} ${responseTime} ms`;
  }, {
    stream: {
      write(message) {
        logger.info(message.trim());
      }
    }
  });
}

module.exports = morganLogger;