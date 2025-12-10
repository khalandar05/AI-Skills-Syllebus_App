const express = require('express');
const multer = require('multer');
const syllabusService = require('../services/syllabusService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// Memory storage for simple processing (use diskStorage for large files or persistence)
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const { mimetype, buffer, originalname } = req.file;
        console.log(`[DEBUG] Received Upload: ${originalname} (${mimetype})`);
        let textContent = '';

        try {
            if (mimetype === 'application/pdf') {
                console.log("[DEBUG] Parsing PDF...");
                textContent = await syllabusService.parsePdf(buffer);
            } else if (mimetype.startsWith('image/')) {
                console.log("[DEBUG] Parsing Image...");
                textContent = await syllabusService.parseImage(buffer);
            } else {
                console.log("[DEBUG] Parsing Text...");
                textContent = buffer.toString('utf-8');
            }
        } catch (parseError) {
            console.error("Content Parsing Failed:", parseError);
            return res.status(400).json({ success: false, error: "Failed to read file content: " + parseError.message });
        }

        console.log(`[DEBUG] Text Content Length: ${textContent.length}`);

        // Structure Extraction
        console.log("[DEBUG] Extracting Structure...");
        let structure;
        try {
            structure = await syllabusService.extractStructure(textContent);
        } catch (aiError) {
            console.error("AI Structure Extraction Failed:", aiError);
            return res.status(500).json({ success: false, error: "AI failed to analyze syllabus: " + aiError.message });
        }

        console.log(`[DEBUG] Structure Found: Units=${structure.units?.length || 0}`);

        // Persistence
        const userId = req.headers['x-user-id'];
        if (userId) {
            try {
                const userExists = await prisma.user.findUnique({ where: { id: userId } });
                if (userExists) {
                    await prisma.syllabus.create({
                        data: {
                            userId,
                            content: textContent,
                            fileName: originalname || 'Text Input',
                            fileType: mimetype || 'text/plain',
                            units: {
                                create: (structure.units || []).map(u => ({
                                    title: u.title || "Untitled Unit",
                                    number: u.number || "1",
                                    topics: {
                                        create: (u.topics || []).map(t => ({
                                            name: typeof t === 'string' ? t : t.name,
                                            skills: t.skills ? t.skills.join(',') : (t.keywords ? t.keywords.join(',') : '')
                                        }))
                                    }
                                }))
                            }
                        }
                    });
                }
            } catch (dbError) {
                console.error("DB Save Warning (Non-fatal):", dbError);
                // Do NOT fail the request for DB save errors on syllabus, just warn
            }
        }

        // Guaranteed Success Response
        res.json({
            success: true,
            fileName: originalname,
            extractedTextPreview: textContent.substring(0, 200) + '...',
            structure
        });

    } catch (fatalError) {
        console.error('CRITICAL ROUTE ERROR:', fatalError);
        // This catch block handles anything unexpected that bubbled up
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Internal System Error: ' + fatalError.message });
        }
    }
});

module.exports = router;
