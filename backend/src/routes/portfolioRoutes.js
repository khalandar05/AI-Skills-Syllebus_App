const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
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

        // [Fix] Check if user actually exists (Handle stale tokens after DB migration)
        const userExists = await prisma.user.findUnique({ where: { id: userId } });
        if (!userExists) {
            return res.status(401).json({ error: 'User record not found. Please logout and login again.' });
        }

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
            if (up.project && up.project.techStack) {
                up.project.techStack.split(',').forEach(tech => skillsSet.add(tech.trim()));
            }
        });

        // [NEW] Include Manual Profile Skills
        const existingPortfolio = await prisma.portfolio.findUnique({ where: { userId } });
        if (existingPortfolio && existingPortfolio.skills) {
            existingPortfolio.skills.split(',').forEach(s => skillsSet.add(s.trim()));
            console.log(`[DEBUG] Included manual skills: ${existingPortfolio.skills}`);
        }

        const skills = Array.from(skillsSet).slice(0, 15); // Top 15 skills
        const projectTitles = userProjects.map(p => p.project ? p.project.title : "Untitled").slice(0, 5);

        const userContext = {
            syllabusCount,
            projectCount,
            skills,
            projectTitles
        };

        // 2. Call AI with Fallback
        console.log(`[DEBUG] Generating Portfolio for User ${userId}`);
        let aiData = {};
        
        try {
            aiData = await aiService.generatePortfolioContent(userContext);
        } catch (aiError) {
            console.error("AI Portfolio Gen Failed, using fallback:", aiError.message);
            // Fallback Generation
            const topSkills = skills.slice(0, 5).join(', ');
            const topProject = projectTitles[0] || "Software Engineering";
            
            aiData = {
                bio: `Passionate Software Engineer skilled in ${topSkills}. Recently built projects including ${topProject}.`,
                summary: `Motivated developer with experience in ${topSkills}. Proven track record of building full-stack applications like ${topProject}.`,
                jobTitle: "Software Developer",
                funFact: "I enjoy solving complex technical problems."
            };
        }

        // 3. Save to DB
        const portfolio = await prisma.portfolio.upsert({
            where: { userId },
            update: {
                bio: aiData.bio || "Professional Developer",
                summary: aiData.summary || "Ready to ship code.",
                jobTitle: aiData.jobTitle || "Software Engineer",
                funFact: aiData.funFact || "Code is poetry.",
                skills: skills.join(', ')
            },
            create: {
                userId,
                bio: aiData.bio || "Professional Developer",
                summary: aiData.summary || "Ready to ship code.",
                jobTitle: aiData.jobTitle || "Software Engineer",
                funFact: aiData.funFact || "Code is poetry.",
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
