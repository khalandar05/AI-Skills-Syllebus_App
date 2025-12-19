const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// GET Profile
router.get('/profile', async (req, res) => {
    try {
        const userId = req.headers['x-user-id']; // From authMiddleware
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { portfolio: true }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                // Flatten portfolio fields for easier UI consumption if desired, or keep nested
                bio: user.portfolio?.bio || "",
                skills: user.portfolio?.skills || "", // Comma char
                jobTitle: user.portfolio?.jobTitle || "",
                funFact: user.portfolio?.funFact || "",
                linkedinUrl: user.portfolio?.linkedinUrl || "",
                githubUrl: user.portfolio?.githubUrl || "",
                linkedinAccessToken: user.linkedinAccessToken // Exposed for frontend state check
            }
        });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch profile" });
    }
});

// PUT Profile
router.put('/profile', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { name, bio, skills, jobTitle, funFact, linkedinUrl, githubUrl, image } = req.body; // Added image to allow update if needed

        // Transaction to update both User and Portfolio
        const updatedUser = await prisma.$transaction(async (tx) => {
            // 1. Update User basic info
            const u = await tx.user.update({
                where: { id: userId },
                where: { id: userId },
                data: { name, image } // Allow updating image via profile update if sent
            });

            // 2. Upsert Portfolio
            const p = await tx.portfolio.upsert({
                where: { userId: userId },
                create: {
                    userId,
                    bio,
                    skills,
                    jobTitle,
                    funFact,
                    linkedinUrl,
                    githubUrl
                },
                update: {
                    bio,
                    skills,
                    jobTitle,
                    funFact,
                    linkedinUrl,
                    githubUrl
                }
            });

            return { ...u, portfolio: p };
        });

        res.json({
            success: true,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                bio: updatedUser.portfolio.bio,
                skills: updatedUser.portfolio.skills,
                jobTitle: updatedUser.portfolio.jobTitle,
                funFact: updatedUser.portfolio.funFact,
                linkedinUrl: updatedUser.portfolio.linkedinUrl,
                githubUrl: updatedUser.portfolio.githubUrl
            }
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ success: false, error: "Failed to update profile" });
    }
});

module.exports = router;
