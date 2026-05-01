const errorHandler = (err, req, res, next) => {
    console.error("🔥 Global Error Handler Caught:", err);
    if (res.headersSent) {
        return next(err);
    }
    
    // Zod validation error handling
    if (err.name === 'ZodError') {
        return res.status(400).json({
            success: false,
            error: "Validation Error",
            details: err.errors
        });
    }

    const errorMessage = err.message || (typeof err === 'string' ? err : "Unknown Internal Server Error");
    const errorDetails = process.env.NODE_ENV === 'development' ? err.stack : undefined;

    res.status(err.status || 500).json({
        success: false,
        error: errorMessage,
        details: errorDetails
    });
};

module.exports = errorHandler;
