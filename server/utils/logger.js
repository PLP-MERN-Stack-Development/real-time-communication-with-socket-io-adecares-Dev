const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

const socketLogger = (io) => {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);
    
    socket.onAny((event, ...args) => {
      logger.info(`Socket event: ${event}`, {
        socketId: socket.id,
        data: args
      });
    });
    
    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id}`, { reason });
    });
  });
};

module.exports = {
  logger,
  socketLogger
};