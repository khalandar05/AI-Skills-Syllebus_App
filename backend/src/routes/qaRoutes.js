const express = require('express');
const multer = require('multer');
const syllabusService = require('../services/syllabusService');
const aiService = require('../services/aiService');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/generate', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const { mimetype, buffer, originalname } = req.file;
        console.log(`[QA] Processing file: ${originalname} (${mimetype})`);

        let textContent = '';

        try {
            if (mimetype === 'application/pdf') {
                textContent = await syllabusService.parsePdf(buffer);
            } else if (mimetype.startsWith('image/')) {
                textContent = await syllabusService.parseImage(buffer);
            } else {
                textContent = buffer.toString('utf-8');
            }
        } catch (parseError) {
            console.error("Content Parsing Failed:", parseError);
            return res.status(400).json({ success: false, error: "Failed to read file content" });
        }

        // Generate Q&A using AI
        console.log("[QA] Generating Questions...");
        const qaData = await aiService.generateChapterQuestions(textContent);

        res.json({
            success: true,
            fileName: originalname,
            data: qaData
        });

    } catch (error) {
        console.error("QA Generation Error:", error);
        res.status(500).json({ success: false, error: "Failed to generate Q&A: " + error.message });
    }
});

module.exports = router;
