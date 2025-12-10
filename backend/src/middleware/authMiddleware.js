const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        // Allow public access for now if needed, or fail.
        // For "Build Projects", we need a user.
        // Check for x-user-id fallback for testing?
        if (req.headers['x-user-id']) return next();
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
        req.user = decoded;
        req.headers['x-user-id'] = decoded.userId; // Polyfill for existing code
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        return res.status(403).json({ error: 'Invalid token' });
    }
};
