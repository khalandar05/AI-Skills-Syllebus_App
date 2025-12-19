const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// Get all certificates
router.get('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const certificates = await prisma.certificate.findMany({
            where: { userId },
            orderBy: { issueDate: 'desc' }
        });
        res.json({ success: true, certificates });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create certificate
router.post('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { title, issuer, issueDate, credentialId, credentialUrl, skills, type } = req.body;
        
        const certificate = await prisma.certificate.create({
            data: {
                userId,
                title,
                issuer,
                issueDate: new Date(issueDate),
                credentialId,
                credentialUrl,
                skills,
                type
            }
        });
        res.json({ success: true, certificate });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update certificate
router.put('/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;
        const data = req.body;
        
        // Convert date string to Date object if present
        if (data.issueDate) {
            data.issueDate = new Date(data.issueDate);
        }

        const certificate = await prisma.certificate.update({
            where: { id, userId }, // Ensure ownership
            data
        });
        res.json({ success: true, certificate });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete certificate
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;

        await prisma.certificate.delete({
            where: { id, userId }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
