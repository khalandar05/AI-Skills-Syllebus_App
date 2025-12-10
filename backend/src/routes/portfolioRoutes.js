const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const aiService = require('../services/aiService');

// Get User Portfolio
router.get('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const portfolio = await prisma.portfolio.findUnique({
            where: { userId }
        });

        res.json({ success: true, portfolio });
    } catch (error) {
        console.error("Get Portfolio Error:", error);
        res.status(500).json({ success: false, error: 'Failed to fetch portfolio' });
    }
});

// Generate Portfolio AI Content
router.post('/generate', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // 1. Gather Context
        const syllabi = await prisma.syllabus.findMany({
            where: { userId },
            include: { units: { include: { topics: true } } }
        });

        const userProjects = await prisma.userProject.findMany({
            where: { userId },
            include: { project: true }
        });

        const projectCount = userProjects.length;
        const syllabusCount = syllabi.length;

        const skillsSet = new Set();
        syllabi.forEach(s => {
            s.units.forEach(u => {
                u.topics.forEach(t => {
                    if (t.skills) {
                        t.skills.split(',').forEach(skill => skillsSet.add(skill.trim()));
                    }
                });
            });
        });

        // Add project stacks
        userProjects.forEach(up => {
            if (up.project.techStack) {
                up.project.techStack.split(',').forEach(tech => skillsSet.add(tech.trim()));
            }
        });

        const skills = Array.from(skillsSet).slice(0, 15); // Top 15 skills

        const userContext = {
            syllabusCount,
            projectCount,
            skills
        };

        // 2. Call AI
        console.log(`[DEBUG] Generating Portfolio for User ${userId}`);
        const aiData = await aiService.generatePortfolioContent(userContext);

        // 3. Save to DB
        const portfolio = await prisma.portfolio.upsert({
            where: { userId },
            update: {
                bio: aiData.bio,
                summary: aiData.summary,
                jobTitle: aiData.jobTitle,
                funFact: aiData.funFact,
                skills: skills.join(', ')
            },
            create: {
                userId,
                bio: aiData.bio,
                summary: aiData.summary,
                jobTitle: aiData.jobTitle,
                funFact: aiData.funFact,
                skills: skills.join(', ')
            }
        });

        res.json({ success: true, portfolio });

    } catch (error) {
        console.error("Generate Portfolio Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
