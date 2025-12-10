const express = require('express');
const router = express.Router();
const githubService = require('../services/githubService');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/github/repos
router.get('/repos', async (req, res) => {
    try {
        const userId = req.headers['x-user-id']; // Passed from frontend or middleware
        if (!userId) {
            // For demo, if no user ID, return mock or error
            // return res.status(401).json({ error: "Unauthorized" });
            // FALLBACK FOR DEMO:
            return res.json({ success: true, repos: await githubService.fetchUserRepos("YOUR_GITHUB_TOKEN_HERE_If_Testing_Manually") });
        }

        // Get Token from DB
        const account = await prisma.account.findFirst({
            where: { userId, provider: 'github' }
        });

        if (!account || !account.accessToken) {
            return res.status(400).json({ error: "GitHub account not connected" });
        }

        const repos = await githubService.fetchUserRepos(account.accessToken);
        res.json({ success: true, repos });
    } catch (error) {
        console.error("GitHub Repos Error:", error);
        res.status(500).json({ error: "Failed to fetch repositories" });
    }
});

// POST /api/github/link
router.post('/link', async (req, res) => {
    // TODO: Verify auth
    const { projectId, repoUrl } = req.body;
    // Mock linking
    res.json({ success: true, message: `Linked ${repoUrl} to project ${projectId}` });
});

module.exports = router;
