const express = require('express');
const aiService = require('../services/aiService');
const router = express.Router();

router.post('/generate', async (req, res) => {
    try {
        const { context } = req.body; // Syllabus text or topic
        if (!context) return res.status(400).json({ error: "Context required" });

        const assessment = await aiService.generateAssessment(context);
        res.json({ success: true, assessment });
    } catch (error) {
        console.error("Assessment Gen Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/evaluate', async (req, res) => {
    try {
        const { answers, context } = req.body;
        if (!answers) return res.status(400).json({ error: "Answers required" });

        const results = await aiService.evaluateAssessment(answers, context);
        res.json({ success: true, results });
    } catch (error) {
        console.error("Assessment Eval Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
