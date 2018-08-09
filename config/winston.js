const { createLogger, format, transports } = require('winston');
const process = require('process');

const isProduction = (process.env.NODE_ENV === 'production');

let logFormat;

if (isProduction) {
  logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss ZZ' }),
    format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`),
  );
} else {
  logFormat = format.combine(
    format.colorize(),
    format.printf(info => `${info.level}: ${info.message}`),
  );
}

const logger = createLogger({
  level: isProduction ? 'info' : 'debug',
  handleExceptions: true,
  format: logFormat,
  transports: [
    new transports.Console({
      stderrLevels: ['error', 'warn'],
    }),
  ],
  exitOnError: false,
});

module.exports = logger;
