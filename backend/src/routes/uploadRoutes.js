const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let ext = path.extname(file.originalname);
        if (ext === '.jfif') ext = '.jpg';
        cb(null, uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf|jfif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images and PDFs are allowed!'));
    }
});

// POST /api/upload
// POST /api/upload
router.post('/', (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error("Multer Error:", err);
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                return res.status(400).json({ error: `Upload error: ${err.message}` });
            } else if (err) {
                // An unknown error occurred when uploading.
                return res.status(400).json({ error: err.message });
            }
        }

        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            // Construct URL
            const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
            const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

            res.json({
                success: true,
                url: fileUrl,
                filename: req.file.filename
            });
        } catch (error) {
            console.error("Upload Logic Error:", error);
            res.status(500).json({ error: 'Upload processing failed' });
        }
    });
});

module.exports = router;
