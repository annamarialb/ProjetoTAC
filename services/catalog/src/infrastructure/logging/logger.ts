import winston from 'winston';

var logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'catalog' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    new winston.transports.File({
      filename: 'catalog/orders-error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/catalog-combined.log'
    })
  ]
});

export default logger;