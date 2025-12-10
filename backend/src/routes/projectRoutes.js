const express = require('express');
const aiService = require('../services/aiService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// Get all projects for the logged-in user
router.get('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id']; // Provided by authMiddleware
        if (!userId) {
            return res.status(401).json({ success: false, error: 'User ID not found' });
        }

        const userProjects = await prisma.userProject.findMany({
            where: { userId: userId },
            include: { project: true },
            orderBy: { updatedAt: 'desc' }
        });

        // Format the response
        const formattedProjects = userProjects.map(up => ({
            ...up.project,
            status: up.status,
            repoStats: up.repoStats ? JSON.parse(up.repoStats) : null
        }));

        res.json({ success: true, projects: formattedProjects });
    } catch (error) {
        console.error("Fetch Projects Error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch projects" });
    }
});

// Generate projects for a specific topic
router.post('/generate', async (req, res) => {
    try {
        const { topic, techStack, topicId } = req.body;

        if (!topic) {
            return res.status(400).json({ success: false, error: 'Topic is required' });
        }

        // Call AI
        console.log(`[DEBUG] Generating projects for topic: ${topic}`);
        let projectsData = [];
        try {
            // Using default stack if none provided to ensure AI has context
            const stack = (techStack && techStack.length > 0) ? techStack : ['React', 'Node.js', 'PostgreSQL'];
            const aiResponse = await aiService.generateProjectIdeas(topic, stack);

            // AI Service should strictly return an object now, but let's double check
            if (typeof aiResponse === 'string') {
                // Should not happen with new aiService, but fallback just in case
                console.warn("AI returned string instead of object, attempting manual parse...");
                const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                projectsData = JSON.parse(cleanJson);
            } else {
                projectsData = aiResponse;
            }
        } catch (aiError) {
            console.error("AI Service Error:", aiError);
            return res.status(500).json({ success: false, error: 'AI Generation Failed: ' + aiError.message });
        }

        // Normalize
        // The AI might wrap it in { projects: [...] } or just return [...]
        let rawProjects = [];
        if (projectsData && Array.isArray(projectsData.projects)) {
            rawProjects = projectsData.projects;
        } else if (Array.isArray(projectsData)) {
            rawProjects = projectsData;
        } else if (projectsData && typeof projectsData === 'object') {
            // Maybe it returned a single project object? Use values if array-like
            rawProjects = Object.values(projectsData).filter(v => typeof v === 'object' && v.title);
        }

        if (rawProjects.length === 0) {
            console.error("AI Output Validation Failed: No projects array found in", projectsData);
            return res.status(500).json({ success: false, error: 'AI returned 0 projects or invalid format. Please try again.' });
        }

        // Process projects safely
        const processedProjects = rawProjects.map(p => ({
            ...p,
            roadmap: typeof p.roadmap === 'object' ? JSON.stringify(p.roadmap) : p.roadmap,
            // Ensure required fields exist defaults
            title: p.title || "Untitled Project",
            description: p.description || "No description provided.",
            difficulty: p.difficulty || "BEGINNER",
            techStack: Array.isArray(p.techStack) ? p.techStack.join(', ') : (p.techStack || "")
        }));

        // PERSISTENCE: Save to DB
        const userId = req.headers['x-user-id'];
        console.log(`[DEBUG] Saving projects for user: ${userId}`);

        const savedProjects = [];

        // Save sequentially or in parallel - sequential is safer for SQLite/Prisma locks sometimes
        for (const p of processedProjects) {
            try {
                const project = await prisma.project.create({
                    data: {
                        title: p.title,
                        description: p.description,
                        difficulty: p.difficulty,
                        techStack: p.techStack,
                        roadmap: p.roadmap,
                        // topicId: topicId || null 
                    }
                });

                if (userId) {
                    // Check user exists first to be safe
                    const userExists = await prisma.user.findUnique({ where: { id: userId } });
                    if (userExists) {
                        try {
                            await prisma.userProject.create({
                                data: {
                                    userId: userId,
                                    projectId: project.id,
                                    status: 'SUGGESTED',
                                    repoStats: JSON.stringify({
                                        problemStatement: p.problemStatement || "",
                                        realWorldApplication: p.realWorldApplication || "",
                                        stretchGoals: p.stretchGoals || []
                                    })
                                }
                            });
                        } catch (linkError) {
                            console.warn(`Failed to link project ${project.id} to user ${userId}:`, linkError);
                        }
                    }
                }

                savedProjects.push({ ...p, id: project.id });
            } catch (dbError) {
                console.error("Project Save Error (Individual):", dbError);
                // Continue saving others
            }
        }

        res.json({ success: true, projects: savedProjects });

    } catch (fatalError) {
        console.error("CRITICAL ROUTE ERROR (Generate):", fatalError);
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: "Internal Server Error: " + fatalError.message });
        }
    }
});

module.exports = router;
