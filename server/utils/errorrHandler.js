class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const handleSocketError = (socket, error) => {
  console.error('Socket error:', error);
  
  if (error.isOperational) {
    socket.emit('error', {
      type: error.constructor.name,
      message: error.message,
      statusCode: error.statusCode
    });
  } else {
    socket.emit('error', {
      type: 'InternalError',
      message: 'An internal error occurred',
      statusCode: 500
    });
  }
};

const handleAsyncError = (fn) => {
  return (socket, ...args) => {
    fn(socket, ...args).catch((error) => {
      handleSocketError(socket, error);
    });
  };
};

module.exports = {
  AppError,
  handleSocketError,
  handleAsyncError
};