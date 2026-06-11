import winston from 'winston';

var logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'orders' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    new winston.transports.File({
      filename: 'logs/orders-error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/orders-combined.log'
    })
  ]
});

export default logger;