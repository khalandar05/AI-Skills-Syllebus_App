require('express-async-errors'); // Async error safety (no crashes)
const express = require('express'); // Restart trigger
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const passport = require('passport');
app.use(passport.initialize());

const projectRoutes = require('./routes/projectRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const linkedinRoutes = require('./routes/linkedinRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const path = require('path');

const authMiddleware = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorHandler');

app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api/portfolio', authMiddleware, portfolioRoutes);
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/interview', authMiddleware, interviewRoutes);
app.use('/api/auth/linkedin', linkedinRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/assessment', authMiddleware, assessmentRoutes);
app.use('/api/certificates', authMiddleware, certificateRoutes);
app.use('/api/syllabus', authMiddleware, require('./routes/syllabusRoutes'));
app.use('/api/custom-sections', authMiddleware, require('./routes/customSectionRoutes'));
app.use('/api/upload', uploadRoutes); // No auth for now or add if needed (upload internal)
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('CareerForge API Running');
});

// Global Error Handler - LAST Middleware
app.use(errorHandler);

module.exports = app;
