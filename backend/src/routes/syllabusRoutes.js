const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// Get User Syllabus Context (Topics)
router.get('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id']; // Provided by authMiddleware
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Get the most recent syllabus
        const syllabus = await prisma.syllabus.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { 
                units: { 
                    include: { 
                        topics: true 
                    } 
                } 
            }
        });

        if (!syllabus) {
            return res.json({ success: true, topics: [] });
        }

        const topics = [];
        if (syllabus.units) {
            syllabus.units.forEach(unit => {
                if (unit.topics) {
                    unit.topics.forEach(topic => {
                        if (topic.title) topics.push(topic.title);
                    });
                }
            });
        }

        res.json({ success: true, topics });

    } catch (error) {
        console.error("Get Syllabus Context Error:", error);
        res.status(500).json({ success: false, error: 'Failed to fetch syllabus' });
    }
});

module.exports = router;
