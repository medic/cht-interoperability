const {format, createLogger, transports} = require('winston');
const isProduction = process.env.NODE_ENV === 'production';

const logger = createLogger({
  level: !isProduction ? 'debug' : 'info',
  format: format.combine(
    format.splat(),
    format.simple()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format(info => {
          info.level = info.level.toUpperCase();
          return info;
        })(),
        format.colorize(),
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.printf(
          info =>
          `${info.timestamp} ${info.level}: ${info.message} ${info.stack ? info.stack : ''}`
          )
      ),
    }),
  ],
});

module.exports = logger;
