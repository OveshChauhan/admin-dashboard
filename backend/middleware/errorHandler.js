// Provides centralized 404 handling and consistent Express error responses.
function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map(function (item) {
      return item.message;
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      details
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A resource with the same unique value already exists."
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid resource identifier."
    });
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.statusCode ? err.message : "Internal server error"
  });
}

module.exports = {
  notFound,
  errorHandler
};
