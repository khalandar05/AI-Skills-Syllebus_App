const { GoogleGenerativeAI } = require("@google/generative-ai");

class AiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        if (!this.apiKey) {
            console.error("❌ CRITICAL: GEMINI_API_KEY is missing from .env!");
        } else {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
        }
    }

    /**
     * Generic wrapper to call Gemini and return text.
     */
    async generateContent(prompt, systemInstruction = "") {
        if (!this.apiKey) {
            throw new Error("Gemini API Key is missing. Cannot generate content.");
        }
        try {
            // FORCE gemini-flash-latest (valid handle found in v1beta list)
            const model = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });

            // Construct the prompt carefully
            const fullPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;

            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("AI Generation Error:", error);

            // Handle Rate Limits gracefully
            if (error.message.includes('429') || error.message.includes('Quota') || error.message.includes('Too Many Requests')) {
                throw new Error("AI Usage Limit Reached. Please wait a minute before trying again (Google Free Tier Quota).");
            }

            // Enhance error message for debugging
            throw new Error(`AI Service Failed: ${error.message}`);
        }
    }

    /**
     * Robust Helper to clean and parse JSON from AI output.
     * Retries automatically on failure.
     */
    async getValidatedJson(prompt, systemInstruction, retryCount = 1) {
        for (let attempt = 0; attempt <= retryCount; attempt++) {
            try {
                const rawText = await this.generateContent(prompt, systemInstruction);

                // Aggressive Cleaning Strategy
                // 1. Remove Markdown code blocks (```json ... ``` or just ``` ... ```)
                let cleanText = rawText.replace(/```\w*\n?/g, '').replace(/```/g, '');

                // 2. Find the first '{' and the last '}' 
                const firstBrace = cleanText.indexOf('{');
                const lastBrace = cleanText.lastIndexOf('}');

                if (firstBrace === -1 || lastBrace === -1) {
                    throw new Error("No JSON object found in response (missing braces).");
                }

                // Extract just the JSON part
                cleanText = cleanText.substring(firstBrace, lastBrace + 1);

                // 3. Fix common JSON errors from AI (Trailing commas)
                cleanText = cleanText.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

                // 4. Fix bad escapes (backslashes that aren't part of valid escapes)
                // This regex finds \ not followed by ", \, /, b, f, n, r, t, or u
                cleanText = cleanText.replace(/\\(?!["\\/bfnrtu])/g, "\\\\");

                // 5. Trim whitespace
                cleanText = cleanText.trim();

                try {
                    return JSON.parse(cleanText);
                } catch (parseError) {
                    console.warn(`[AiService] JSON Parse Error on text:`, cleanText);
                    throw parseError;
                }

            } catch (e) {
                console.warn(`[AiService] Attempt ${attempt + 1} failed:`, e.message);
                if (attempt === retryCount) throw e; // Fail after all retries
            }
        }
    }

    async generateProjectIdeas(topic, techStack = []) {
        const prompt = `You are an expert tech career mentor. 
        Your goal is to suggest 3 REAL-WORLD, PRACTICAL project ideas based on the topic: "${topic}".
        
        Constraints:
        1. NO CODE generation. Do not write any code.
        2. Ideas must be suitable for a student portfolio to get hired.
        3. Roadmap must be a 4-week high-level plan (Week 1 to Week 4).
        4. Tech stack preference: ${techStack.join(', ')}.

        Output strictly valid JSON with this structure:
        {
          "projects": [
            {
              "title": "Project Title",
              "problemStatement": "What real problem does this solve?",
              "realWorldApplication": "Why is this relevant to the industry?",
              "description": "Simple, clear description of what to build.",
              "difficulty": "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
              "techStack": "List of technologies (e.g. React, Node, etc.)",
              "roadmap": [
                 { "task": "Week 1: Setup & Core Structure", "status": "TODO" },
                 { "task": "Week 2: Core Feature Implementation", "status": "TODO" },
                 { "task": "Week 3: Improvements & UI Polish", "status": "TODO" },
                 { "task": "Week 4: Real-world Polish & Deployment", "status": "TODO" }
              ],
              "stretchGoals": ["Feature X", "Feature Y"]
            }
          ]
        }`;

        return this.getValidatedJson(prompt, "You are a senior developer mentor. Output strictly valid JSON. NO MARKDOWN.");
    }



    async generatePortfolioContent(userContext) {
        const prompt = `Generate a professional portfolio summary and bio based on the following user context:
        sdyllabuses uploaded: ${userContext.syllabusCount}
        skills detected: ${userContext.skills.join(', ')}
        projects generated: ${userContext.projectCount}

        Output a JSON object with this EXACT structure:
        {
            "bio": "A 2-3 sentence professional bio suitable for LinkedIn.",
            "summary": "A persistent, motivating summary of their learning journey.",
            "jobTitle": "Suggested Job Title (e.g. Junior Full Stack Developer)",
            "funFact": "A creative tech-related fun fact based on their stack."
        }`;

        return this.getValidatedJson(prompt, "You are a career coach. Output strictly valid JSON.");
    }

    async generateChapterQuestions(text) {
        // Truncate text if too long
        const safeText = text.substring(0, 15000);

        // Fix bad JSON escapes (single backslashes) before passing to prompt context if possible, 
        // but here we are sending text TO AI. The Issue is AI OUTPUT.

        const prompt = `Analyze the following chapter content and generate a comprehensive Q&A set.
        
        Content: "${safeText}..."

        Requirements:
        1. Generate 10-15 Important Questions.
        2. Include a mix of: 
           - Short Answer (Conceptual)
           - Long Answer (Deep Explanation)
           - Real-World Application (Scenario based)
           - Exam-Focused (High probability)
        3. PROVIDE DETAILED ANSWERS for each question.
        4. Output strictly valid JSON. Avoid using unescaped backslashes.
        
        Output Strictly Valid JSON:
        {
            "title": "Chapter Title",
            "focusTopics": ["Topic 1", "Topic 2"],
            "questions": [
                {
                    "id": 1,
                    "question": "The question text?",
                    "answer": "The detailed answer.",
                    "type": "Short Answer" | "Long Answer" | "Real-World" | "Exam-Focused",
                    "difficulty": "Easy" | "Medium" | "Hard"
                }
            ]
        }`;

        return this.getValidatedJson(prompt, "You are an expert examiner. Output strictly valid JSON. Escape all backslashes.");
    }
}

module.exports = new AiService();
