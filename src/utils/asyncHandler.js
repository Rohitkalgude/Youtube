// this asyncHandler is a middleware helper — basically a wrapper function to handle errors for async
// route handlers in Express without writing repetitive try...catch blocks everywhere.

const asyncHandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => {
      next(error);
    });
  };
};

export { asyncHandler };
