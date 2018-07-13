// A very basic logger to STDOUT/STDERR

const env = process.env.NODE_ENV || 'development';

/* eslint no-console: ["off"] */

function formatLog(level, args) {
  const date = new Date().toString();
  args.unshift(`[${level} ${date}]`);
  return args.join(' ');
}

const logger = {
  debug(...args) {
    if (env === 'development') {
      console.log(formatLog('DEBUG', args));
    }
  },
  info(...args) {
    console.log(formatLog('INFO', args));
  },
  warn(...args) {
    console.error(formatLog('WARN', args));
  },
  error(...args) {
    console.error(formatLog('ERROR', args));
  },
};

module.exports = logger;
