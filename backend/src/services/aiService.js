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
            Output JSON: { "questions": [...] }`;

            promptBatch2 = `Generate 12 mostly asked Aptitude questions (Verbal Ability & Reasoning).
            Focus on: Reading Comprehension, Sentence Correction, Critical Reasoning.
            Difficulty: ${difficulty}
            Output JSON: { "questions": [...] }`;
        } else if (type === "DSA") {
            promptBatch1 = `Generate 12 mostly asked Data Structures & Algorithms problem statements.
            Topics: Arrays, Strings, Linked Lists, Stacks, Queues.
            Difficulty: ${difficulty}
            Output JSON: { "questions": [...] }`;

            promptBatch2 = `Generate 12 mostly asked Data Structures & Algorithms problem statements.
            Topics: Trees, Graphs, Recursion, DP.
            Difficulty: ${difficulty}
            Output JSON: { "questions": [...] }`;
        } else if (type === "HR") {
            promptBatch1 = `Generate 12 mostly asked HR Interview questions.
            Focus on: Self-intro, Strengths/Weaknesses, Career Goals.
            Difficulty: ${difficulty}
            Output JSON: { "questions": [...] }`;

            promptBatch2 = `Generate 12 mostly asked Behavioral Interview questions.
            Focus on: Conflict resolution, Teamwork, Leadership, Situational.
            Difficulty: ${difficulty}
            Output JSON: { "questions": [...] }`;
        } else {
            // Default Technical
            promptBatch1 = `Generate 12 mostly asked structured interview questions for a Software Engineering candidate focused on "${topic}". Batch 1/2.
            Difficulty: ${difficulty}
            Output JSON: { "questions": [...] }`;
    
            promptBatch2 = `Generate 12 mostly asked structured interview questions for a Software Engineering candidate focused on "${topic}". Batch 2/2 (Ensure unique questions).
            Difficulty: ${difficulty}
            Output JSON: { "questions": [...] }`;
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

            // Merge and re-index
            let allQuestions = [...questions1, ...questions2].map((q, i) => {
                const qText = typeof q === 'object' ? q.question : q;
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
        {
            "explanation": "Brief explanation of the concept...",
            "modelAnswer": "A strong, professional example answer...",
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
         const prompt = `Generate asset content for project "${projectTitle}".
         Description: ${description}
         Stack: ${techStack}
         
         Output JSON:
         {
             "readme": "# ${projectTitle}\\n...",
             "linkedInPost": "Check out my new project...",
             "resumeBullets": ["Built X using Y", "Optimized Z"]
         }`;
         
         return await this.generateJson(prompt, "Project Manager.");
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
}

module.exports = new AiService();

