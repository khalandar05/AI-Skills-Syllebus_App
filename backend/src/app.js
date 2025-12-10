const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const passport = require('passport');
app.use(passport.initialize());

const syllabusRoutes = require('./routes/syllabusRoutes');
const projectRoutes = require('./routes/projectRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const qaRoutes = require('./routes/qaRoutes');

const authMiddleware = require('./middleware/authMiddleware');

app.use('/api/syllabus', authMiddleware, syllabusRoutes);
app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api/portfolio', authMiddleware, portfolioRoutes);
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/qa', authMiddleware, qaRoutes);
app.use('/api/auth', authRoutes);

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('Syllabus to Skills API Running');
});

// Global Error Handler - LAST Middleware
app.use((err, req, res, next) => {
    console.error("🔥 Glober Error Handler Caught:", err);
    if (res.headersSent) {
        return next(err);
    }
    res.status(err.status || 500).json({
        success: false,
        error: err.message || "Internal Server Error"
    });
});

module.exports = app;
