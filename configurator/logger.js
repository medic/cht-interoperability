const {format, createLogger, transports} = require('winston');
const isProduction = process.env.NODE_ENV === 'production';

const logger = createLogger({
  level: !isProduction ? 'debug' : 'info',
  format: format.combine(
    format.errors({stack: true}),
    format.splat(),
    format.simple(),
  ),
  transports: [
    new transports.Console({
      // change level if in dev environment versus production
      format: format.combine(
        // https://github.com/winstonjs/winston/issues/1345
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
