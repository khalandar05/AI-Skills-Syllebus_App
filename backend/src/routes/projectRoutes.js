const express = require('express');
const aiService = require('../services/aiService');
const prisma = require('../lib/prisma');
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
        const { topic, techStack, topicId, syllabusStructure } = req.body;

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

            if (aiResponse && Array.isArray(aiResponse.projects)) {
                projectsData = aiResponse.projects;
            } else {
                 throw new Error("Invalid AI response format");
            }

        } catch (aiError) {
             console.error("AI Service Error:", aiError);
             return res.status(500).json({ success: false, error: 'AI Generation Failed' });
        }

        // Normalize
        // The AI might wrap it in { projects: [...] } or just return [...]
        // Process projects safely
        const processedProjects = projectsData.map(p => ({
            title: p.title || "Untitled Project",
            description: p.description || "No description provided.",
            difficulty: p.difficulty || "BEGINNER",
            techStack: p.techStack || "",
            roadmap: typeof p.roadmap === 'object' ? JSON.stringify(p.roadmap) : p.roadmap || "[]"
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
                                        whyThisMatchesTheSyllabus: "N/A - Generated via Topic",
                                        coreConceptsUsed: [],
                                        projectScope: p.description
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


// Generate Assets (README, LinkedIn, etc.) for a project
router.post('/:id/assets', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { id } = req.params; // Project ID

        // 1. Verify Ownership & Fetch Project Details
        const userProject = await prisma.userProject.findFirst({
            where: { userId, projectId: id },
            include: { project: true }
        });

        if (!userProject) {
            return res.status(404).json({ error: 'Project not found or not owned by user' });
        }

        const { project } = userProject;

        console.log(`[DEBUG] Generating assets for project: ${project.title}`);

        // 2. Call AI Service
        const assets = await aiService.generateProjectAssets(
            project.title,
            project.description,
            project.techStack || ""
        );

        // 3. Save to DB (UserProject table has readme & linkedInPost)
        // We'll also append resume bullets to repoStats if possible, or just return them.
        
        let repoStats = {};
        try {
            repoStats = userProject.repoStats ? JSON.parse(userProject.repoStats) : {};
        } catch (e) {}

        repoStats.resumeBullets = assets.resumeBullets || [];

        await prisma.userProject.update({
            where: { id: userProject.id },
            data: {
                readme: assets.readme,
                linkedInPost: assets.linkedInPost,
                repoStats: JSON.stringify(repoStats)
            }
        });

        res.json({ success: true, assets });

    } catch (error) {
        console.error("Asset Generation Error:", error);
        res.status(500).json({ success: false, error: "Failed to generate assets" });
    }
});

// CREATE Manual Project
router.post('/create', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { 
            title, description, techStack, skills, difficulty,
            projectType, liveDemoLink, keyLearnings, duration, repoLink
        } = req.body;

        console.log(`[DEBUG] Creating manual project for user: ${userId}`);

        // 1. Create Project Definition
        const project = await prisma.project.create({
            data: {
                title,
                description,
                techStack: Array.isArray(techStack) ? techStack.join(', ') : (techStack || ""),
                difficulty: difficulty || "BEGINNER"
            }
        });

        // 2. Link to User
        const userProject = await prisma.userProject.create({
            data: {
                userId,
                projectId: project.id,
                status: 'COMPLETED', // Manual projects are usually completed or in progress
                projectType: projectType || "Personal",
                liveDemoLink,
                keyLearnings,
                duration,
                repoLink
            }
        });

        res.json({ success: true, project: { ...project, ...userProject } });
    } catch (error) {
        console.error("Create Project Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// UPDATE Project
router.put('/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;
        const { 
            title, description, techStack, skills, difficulty,
            projectType, liveDemoLink, keyLearnings, duration, repoLink
        } = req.body;

        // Check ownership
        const userProject = await prisma.userProject.findFirst({
            where: { userId, projectId: id }
        });

        if (!userProject) return res.status(404).json({ error: 'Project not found' });

        // Update Project Details
        await prisma.project.update({
            where: { id: userProject.projectId },
            data: {
                title,
                description,
                techStack: Array.isArray(techStack) ? techStack.join(', ') : (techStack || ""),
                skills: Array.isArray(skills) ? skills.join(', ') : (skills || ""),
                difficulty
            }
        });

        // Update User Project Details
        const updatedUserProject = await prisma.userProject.update({
            where: { id: userProject.id },
            data: {
                projectType,
                liveDemoLink,
                keyLearnings,
                duration,
                repoLink
            },
            include: { project: true }
        });
        
        // Return combined object structure consistent with fetch
        const result = {
            ...updatedUserProject.project,
            ...updatedUserProject
        };

        res.json({ success: true, project: result });
    } catch (error) {
        console.error("Update Project Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE Project
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { id } = req.params; // projectId

        const userProject = await prisma.userProject.findFirst({
            where: { userId, projectId: id }
        });

        if (!userProject) return res.status(404).json({ error: 'Project not found' });

        // Delete UserProject
        await prisma.userProject.delete({
            where: { id: userProject.id }
        });
        
        // Optionally delete Project if likely unique
        try {
             await prisma.project.delete({
                where: { id }
            });
        } catch (e) {
            console.warn("Could not delete Project definition (might be shared):", e.message);
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Delete Project Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
