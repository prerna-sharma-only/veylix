import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next
) => {
  console.error("API Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

// - ErrorRequestHandler is an Express-provided TypeScript type for error-handling middleware.
// - err contains the error passed to the middleware.
// - _req is the original request.
// - res sends the error response.
// - _next represents the next error handler, which we don't need in this basic handler.
// We return HTTP 500, which means Internal Server Error.