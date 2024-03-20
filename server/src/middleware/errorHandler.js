const logger = require("../config/logger");

const ErrorHandler = (err, req, res, next) => {
  const errStatus = err?.statusCode || 500;

  const errMessage = errStatus === 500 ? "Error occured" : err?.message;

  logger.error({
    message: `${errMessage} with error ${err} occurred when ${req.method} ${req.originalUrl} was called`,
  });

  res.status(errStatus).json({
    error: errMessage,
  });
};

module.exports = ErrorHandler;
