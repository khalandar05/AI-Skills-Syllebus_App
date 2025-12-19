const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// Get all custom sections
router.get('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const sections = await prisma.customSection.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' }
        });

        res.json({ success: true, sections });
    } catch (error) {
        console.error("Get Custom Sections Error:", error);
        res.status(500).json({ success: false, error: 'Failed to fetch sections' });
    }
});

// Create new section
router.post('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { title, content } = req.body;
        if (!title || !content) return res.status(400).json({ error: 'Title and Content are required' });

        const section = await prisma.customSection.create({
            data: {
                userId,
                title,
                content,
                isVisible: true
            }
        });

        res.json({ success: true, section });
    } catch (error) {
        console.error("Create Custom Section Error:", error);
        res.status(500).json({ success: false, error: 'Failed to create section' });
    }
});

// Delete section
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;

        await prisma.customSection.delete({
            where: { id, userId } // Ensure ownership
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Delete Custom Section Error:", error);
        res.status(500).json({ success: false, error: 'Failed to delete section' });
    }
});

module.exports = router;
