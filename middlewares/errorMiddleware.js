const ApiError = require("../utils/apiError")

function sendErrorForDev(err, res) {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
}

function sendErrorForProd(err, res) {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
}

const handlerJwtInvalidSignature = () => new ApiError("invalid token, please login again...", 401)
const handlerJwtExpired = () => new ApiError("Expired token, please login again...", 401)



const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorForDev(err, res);
  } else {
    if (err.name === 'JsonWebTokenError') err = handlerJwtInvalidSignature()
    if (err.name === 'TokenExpiredError') err = handlerJwtExpired()

    sendErrorForProd(err, res);
  }
};


module.exports = globalError;
