const OpenAI = require("openai");

class AiService {
    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY;
        this.baseURL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
        this.model = process.env.AI_MODEL_NAME || "meta-llama/llama-3-70b-instruct";

        if (!this.apiKey) {
            console.error("❌ CRITICAL: OPENROUTER_API_KEY is missing!");
        } else {
            this.openai = new OpenAI({
                apiKey: this.apiKey,
                baseURL: this.baseURL,
                defaultHeaders: {
                    "HTTP-Referer": "https://antigravity-app.com", // Optional, for OpenRouter rankings
                    "X-Title": "AntiGravity Portfolio"
                }
            });
            console.log(`✅ AI Service Initialized with Model: ${this.model}`);
        }
    }

    async generateJson(prompt, systemInstruction) {
        if (!this.openai) throw new Error("AI Service not initialized");

        try {
            const completion = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    { role: "system", content: systemInstruction + " RETURN JSON ONLY." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0].message.content;
            console.log("[DEBUG] AI Raw Content (truncated):", content.substring(0, 200));
            return JSON.parse(content);
        } catch (error) {
            console.error("AI Generation Error:", error);
            // Fallback for simple JSON parsing if the model is chatty
            try {
                const text = error.response?.data?.error?.message || error.message; 
                 // Naive fallback if we had access to the raw text, but mostly we just throw
                throw new Error("Failed to generate JSON from AI.");
            } catch (e) {
                throw error;
            }
        }
    }

    async generateResumeBullets(projectTitle, description, techStack) {
        const prompt = `Generate 4 high-impact, ATS-friendly resume bullet points for a project titled "${projectTitle}".
        
        Context:
        - Description: ${description}
        - Tech Stack: ${Array.isArray(techStack) ? techStack.join(', ') : techStack}
        
        Requirements:
        - Use action verbs (Architected, Developed, Optimized).
        - Include metrics if plausible (e.g., "Reduced latency by 20%").
        - Focus on technical complexity.
        
        Output JSON: { "bullets": ["...", "...", "...", "..."] }`;

        try {
            const res = await this.generateJson(prompt, "You are an expert Resume Writer for Software Engineers.");
            return res.bullets;
        } catch (e) {
            console.warn("AI Resume Gen failed, returning fallback.");
            return [
                `Developed ${projectTitle} using ${techStack}, focusing on scalable architecture.`,
                `Implemented core features to solve key user problems efficiently.`,
                `Optimized application performance and ensured code maintainability.`,
                `Collaborated on full-stack development using best practices.`
            ];
        }
    }

    async generateInterviewQuestions(topic, difficulty = "Medium", type = "Technical") {
        let promptBatch1, promptBatch2;

        if (type === "Aptitude") {
            promptBatch1 = `Generate 12 mostly asked Aptitude questions (Quantitative & Logical) for a software engineering candidate.
            Focus on: Time & Work, Probability, Data Interpretation, Logical Puzzles.
            Difficulty: ${difficulty}
            Output JSON: { "questions": ["Question 1 text", ...] }`;

            promptBatch2 = `Generate 12 mostly asked Aptitude questions (Verbal Ability & Reasoning).
            Focus on: Reading Comprehension, Sentence Correction, Critical Reasoning.
            Difficulty: ${difficulty}
            Output JSON: { "questions": ["Question 1 text", ...] }`;
        } else if (type === "DSA") {
            promptBatch1 = `Generate 12 mostly asked Data Structures & Algorithms problem statements.
            Topics: Arrays, Strings, Linked Lists, Stacks, Queues.
            Difficulty: ${difficulty}
            Output JSON: { "questions": ["Question 1 text", ...] }`;

            promptBatch2 = `Generate 12 mostly asked Data Structures & Algorithms problem statements.
            Topics: Trees, Graphs, Recursion, DP.
            Difficulty: ${difficulty}
            Output JSON: { "questions": ["Question 1 text", ...] }`;
        } else if (type === "HR") {
            promptBatch1 = `Generate 12 mostly asked HR Interview questions.
            Focus on: Self-intro, Strengths/Weaknesses, Career Goals.
            Difficulty: ${difficulty}
            Output JSON: { "questions": ["Question 1 text", ...] }`;

            promptBatch2 = `Generate 12 mostly asked Behavioral Interview questions.
            Focus on: Conflict resolution, Teamwork, Leadership, Situational.
            Difficulty: ${difficulty}
            Output JSON: { "questions": ["Question 1 text", ...] }`;
        } else {
            // Default Technical
            promptBatch1 = `Generate 12 mostly asked structured interview questions for a Software Engineering candidate focused on "${topic}". Batch 1/2.
            Difficulty: ${difficulty}
            Output JSON: { "questions": ["Question 1 text", ...] }`;
    
            promptBatch2 = `Generate 12 mostly asked structured interview questions for a Software Engineering candidate focused on "${topic}". Batch 2/2 (Ensure unique questions).
            Difficulty: ${difficulty}
            Output JSON: { "questions": ["Question 1 text", ...] }`;
        }

        try {
            const results = await Promise.allSettled([
                this.generateJson(promptBatch1, "You are a Senior Interviewer (Aptitude/Technical/HR)."),
                new Promise(resolve => setTimeout(resolve, 1000)).then(() => 
                    this.generateJson(promptBatch2, "You are a Senior Interviewer (Aptitude/Technical/HR).")
                )
            ]);

            const questions1 = results[0].status === 'fulfilled' ? results[0].value.questions || [] : [];
            const questions2 = results[1].status === 'fulfilled' ? results[1].value.questions || [] : [];
            
            if (results[0].status === 'rejected') console.error("Batch 1 Failed:", results[0].reason);
            if (results[1].status === 'rejected') console.error("Batch 2 Failed:", results[1].reason);

            // Merge and re-index with robust mapping
            let allQuestions = [...questions1, ...questions2].map((q, i) => {
                let qText;
                if (typeof q === 'string') {
                    qText = q;
                } else if (typeof q === 'object') {
                    qText = q.question || q.text || q.content || q.statement || JSON.stringify(q);
                } else {
                    qText = "Question data unavailable";
                }
                return { id: i + 1, question: qText, type: type };
            });

            // If we have at least 20 questions, return them. 
            // If we have less, trigger fallback to get 25.
            if (allQuestions.length < 20) throw new Error("Partial generation insufficient");
            
            return { questions: allQuestions };
            
        } catch (e) {
            console.error("Parallel Generation Error:", e);
            // Try single batch fallback of 25 if parallel fails
            const fallbackPrompt = `Generate 25 mostly asked ${type} interview questions. Topic: "${topic}". Difficulty: ${difficulty}. Output JSON: { "questions": [...] }`;
            const fallbackRes = await this.generateJson(fallbackPrompt, "You are a Senior Interviewer.");
             // Ensure consistent format
             const fallbackQuestions = (fallbackRes.questions || []).map((q, i) => ({
                id: i + 1,
                question: typeof q === 'object' ? q.question : q,
                type: type
            }));
            return { questions: fallbackQuestions };
        }
    }

    async evaluateInterviewAnswer(question, answer) {
        const prompt = `Evaluate this answer.
        Question: "${question}"
        Candidate Answer: "${answer}"
        
        Output JSON:
        {
            "score": 0-10 (Integer),
            "feedback": "Constructive feedback...",
            "improvements": ["Tip 1", "Tip 2"]
        }`;

        return await this.generateJson(prompt, "You are a Fair Tech Interviewer.");
    }

    async explainAnswer(question) {
        const prompt = `Provide a clear, educational explanation for this interview question and a model answer.
        Question: "${question}"
        
        Output JSON:
        Output JSON:
        {
            "explanation": "Brief explanation of the concept...",
            "modelAnswer": "A strong, professional example answer...",
            "codeSnippet": "Optional: valid code example (Python/JS) if the question is technical/algorithmic, else null...",
            "keyPoints": ["Key point 1", "Key point 2"]
        }`;

        return await this.generateJson(prompt, "You are a Helpful Technical Mentor.");
    }

    async enhanceBio(currentBio, skills) {
        const prompt = `Rewrite this professional bio to be more compelling for LinkedIn/Portfolio.
        Current: "${currentBio}"
        Skills: ${skills}
        
        Output JSON: { "enhancedBio": "..." }`;
        
        try {
             const res = await this.generateJson(prompt, "Personal Branding Expert.");
             return res.enhancedBio;
        } catch (e) {
            return currentBio;
        }
    }


    async generateProjectIdeas(topic, techStack = []) {
        const prompt = `Generate 3 professional software engineering project ideas based on the topic: "${topic}".
        
        Tech Stack: ${techStack.join(', ') || "Modern Web Stack"}
        
        Requirements:
        - Real-world problem solving.
        - Not a generic "ToDo App".
        
        Output JSON:
        {
            "projects": [
                {
                    "title": "Project Title",
                    "description": "Short description...",
                    "difficulty": "Intermediate",
                    "techStack": "React, Node.js",
                    "roadmap": [
                         { "task": "Setup Repo", "status": "TODO" },
                         { "task": "Implement Auth", "status": "TODO" }
                    ]
                }
            ]
        }`;

        return await this.generateJson(prompt, "You are a Tech Lead.");
    }

    async generateProjectAssets(projectTitle, description, techStack) {
         const prompt = `Act as a Senior Developer Advocate and Career Coach. 
         Generate high-impact portfolio assets for the project: "${projectTitle}".
         
         Context:
         - Description: ${description}
         - Tech Stack: ${techStack}
         
         Requirements:
         1. **Resume Bullet Points**: Generate 4-5 dense, metric-heavy bullet points (25-40 words each). Focus on specific technical achievements, optimizations (e.g. "Reduced latency by 40%"), and architectural decisions. Use strong action verbs (Architected, Deployed, Engineered).
         2. **LinkedIn Post**: Write a professional, engaging post (100-150 words) using a storytelling hook ("I used to struggle with...", "Here is how I solved..."). explain the problem and the solution. End with a Call To Action and 5-8 relevant, trending tech hashtags.
         3. **README**: A brief but professional README introduction.

         Output JSON:
         {
             "readme": "# ${projectTitle}\\n...",
             "linkedInPost": "🚀 Just shipped ${projectTitle}! ... #Tag1 #Tag2",
             "resumeBullets": ["Architected a scalable...", "Optimized database queries..."]
         }`;
         
         return await this.generateJson(prompt, "You are a Tech Career Expert.");
    }
    async generatePortfolioContent(userContext) {
        const prompt = `Generate professional portfolio content for a software engineer.
        
        Context:
        - Total Projects: ${userContext.projectCount}
        - Top Skills: ${userContext.skills.join(', ')}
        - Recent Project Titles: ${userContext.projectTitles.join(', ')}
        - Certifications: ${userContext.certificateTitles ? userContext.certificateTitles.join(', ') : "None"}
        
        Requirements:
        1. Bio: A compelling 1st-person professional bio (max 80 words).
        2. Summary: A strong 3rd-person professional summary for a resume (max 50 words).
        3. Job Title: A modern, specific job title based on the skills (e.g., "Full Stack React Developer").
        4. Fun Fact: A short, professional fun fact relating to coding or tech.
        
        Output JSON:
        {
            "bio": "...",
            "summary": "...",
            "jobTitle": "...",
            "funFact": "..."
        }`;

        return await this.generateJson(prompt, "You are a sort-after Tech Recruiter and Resume Expert.");
    }
    async generateResearchRoadmap(idea) {
        const prompt = `Act as a Senior Principal Engineer and Research Architect.
        
        The user has a Project Idea / Problem Statement: "${idea}".
        
        Your Goal: Perform a "Deep Research" simulation to generate a comprehensive, professional implementation roadmap. This must be practical, industry-standard, and 'Portfolio-Ready'.

        Analyze:
        1. **Core Problem**: What is the real-world pain point?
        2. **Technical Feasibility**: What is the best, modern tech stack? (e.g. Next.js 14, Supabase, Stripe, LangChain).
        3. **Step-by-Step Execution**: Granular tasks from setup to deployment.

        Output strictly valid JSON with this structure:
        {
            "title": "A Professional, Catchy Project Title",
            "description": "A refined, technical description (2-3 sentences) selling the project's value.",
            "difficulty": "Intermediate",
            "techStack": ["Next.js", "Tailwind", "Supabase", "etc..."],
            "roadmap": [
                {
                    "stepNumber": 1,
                    "title": "Phase 1: Foundation & Setup",
                    "description": "Initialize repo, setup shadcn/ui, configure database schema...",
                    "resources": ["Official Next.js Docs", "Supabase Auth Helpers Guide"],
                    "estimatedTime": "2 Days"
                },
                // ... Generate 6-10 detailed phases
            ],
            "repoStats": {
                "problemStatement": "Clear definition of the problem being solved...",
                "realWorldApplication": "Who would use this? (e.g. 'Small businesses needing inventory mgmt')",
                "coreConceptsUsed": ["Authentication", "RBAC", "Server Actions", "Webhooks"],
                "risksChallenges": "Potential scale issues, API rate limits, etc...",
                "architectureOverview": "Brief explanation of the system design (e.g. 'Event-driven architecture using AWS Lambda...').",
                "syllabus_topics_used": ["Modern Web Development", "System Design", "Cloud Engineering"] 
            }
        }`;

        return await this.generateJson(prompt, "You are a Senior Principal Engineer.");
    }
}

module.exports = new AiService();

