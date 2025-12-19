const express = require('express');
const { PrismaClient } = require('@prisma/client');
const aiService = require('../services/aiService');
const router = express.Router();
const prisma = require('../lib/prisma');

// Start a new interview session
router.post('/start', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { context } = req.body; // e.g., "React, Node.js"

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Generate questions via AI
        // Generate questions via AI with Fallback
        let questions = [];
        const interviewType = req.body.type || "Technical"; // Use the passed type

        try {
             // Timeout the AI call at 25s to ensure we catch it before proxy/browser timeout (usually 30s)
             const aiPromise = aiService.generateInterviewQuestions(context, "Medium", interviewType);
             const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("AI Timeout")), 25000));
             
             const aiResponse = await Promise.race([aiPromise, timeoutPromise]);
             if (aiResponse && aiResponse.questions) {
                 questions = aiResponse.questions;
             }
        } catch (aiError) {
            console.warn("AI Generation Failed (Using Fallback):", aiError.message);
        }

        // Default Fallback Questions if AI failed or returned empty
        if (!questions || questions.length === 0) {
            switch (interviewType) {
                case "Aptitude":
                    questions = [
                        { id: 1, question: "If A can do a work in 10 days and B in 15 days, how long will they take together?", type: "Aptitude" },
                        { id: 2, question: "What is the probability of getting a sum of 9 when rolling two dice?", type: "Aptitude" },
                        { id: 3, question: "Find the missing number in the series: 2, 6, 12, 20, 30, ?", type: "Aptitude" },
                        { id: 4, question: "A train running at speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?", type: "Aptitude" },
                        { id: 5, question: "Statement: All mangoes are golden in color. No golden-colored things are cheap. Conclusion: All mangoes are cheap. (True/False?)", type: "Aptitude" },
                        { id: 6, question: "Antonym of 'OBSCURE' is?", type: "Aptitude" },
                        { id: 7, question: "A shopkeeper sells an article at a loss of 12.5%. Had he sold it for Rs. 51.80 more, he would have earned a profit of 6%. The cost price of the article is?", type: "Aptitude" },
                        { id: 8, question: "Pointing to a photograph, a man said, 'I have no brother or sister but that man’s father is my father’s son.' Whose photograph was it?", type: "Aptitude" },
                        { id: 9, question: "Arrange the words in a meaningful sequence: 1. Infection, 2. Consultation, 3. Doctor, 4. Treatment, 5. Recovery", type: "Aptitude" },
                        { id: 10, question: "Choose the word which is different from the rest: 1. Curd, 2. Butter, 3. Oil, 4. Cheese", type: "Aptitude" }
                    ];
                    break;
                case "DSA":
                    questions = [
                        { id: 1, question: "Explain the difference between an Array and a Linked List.", type: "DSA" },
                        { id: 2, question: "Implement a Stack using Queues.", type: "DSA" },
                        { id: 3, question: "Find the middle element of a singly linked list in one pass.", type: "DSA" },
                        { id: 4, question: "Check if a binary tree is a valid Binary Search Tree (BST).", type: "DSA" },
                        { id: 5, question: "Explain how a Hash Map works and handle collisions.", type: "DSA" },
                        { id: 6, question: "Write a function to reverse a string using recursion.", type: "DSA" },
                        { id: 7, question: "What is the time complexity of QuickSort in the worst case?", type: "DSA" },
                        { id: 8, question: "Detect a cycle in a directed graph.", type: "DSA" },
                        { id: 9, question: "Given an array of integers, find the maximum sum subarray (Kadane's Algorithm).", type: "DSA" },
                        { id: 10, question: "Explain Dynamic Programming with the Climbing Stairs problem.", type: "DSA" }
                    ];
                    break;
                case "HR":
                    questions = [
                        { id: 1, question: "Tell me about yourself.", type: "HR" },
                        { id: 2, question: "What are your greatest strengths and weaknesses?", type: "HR" },
                        { id: 3, question: "Describe a conflict you had with a colleague and how you resolved it.", type: "HR" },
                        { id: 4, question: "Where do you see yourself in 5 years?", type: "HR" },
                        { id: 5, question: "Why do you want to join our company?", type: "HR" },
                        { id: 6, question: "Describe a time you failed. What did you learn?", type: "HR" },
                        { id: 7, question: "How do you handle tight deadlines and pressure?", type: "HR" },
                        { id: 8, question: "What motivates you?", type: "HR" },
                        { id: 9, question: "How do you prioritize your tasks?", type: "HR" },
                        { id: 10, question: "Do you have any questions for us?", type: "HR" }
                    ];
                    break;
                default: // Technical
                     questions = [
                        { id: 1, question: "Tell me about yourself and your background.", type: "Technical" },
                        { id: 2, question: "Explain a challenging technical problem you solved recently.", type: "Technical" },
                        { id: 3, question: "What is your favorite tech stack and why?", type: "Technical" },
                        { id: 4, question: `How do you stay updated with ${context || "technology"} trends?`, type: "Technical" },
                        { id: 5, question: "Explain the difference between authentication and authorization.", type: "Technical" },
                        { id: 6, question: "How would you optimize a slow API endpoint?", type: "Technical" },
                        { id: 7, question: "Describe a time you failed and what you learned.", type: "Technical" },
                        { id: 8, question: "What are the trade-offs of Microservices vs Monolith?", type: "Technical" },
                        { id: 9, question: "Explain the concept of RESTful APIs.", type: "Technical" },
                        { id: 10, question: "Do you have any questions for us?", type: "Technical" }
                    ];
            }
        }

        // Create session
        const session = await prisma.interviewSession.create({
            data: {
                userId,
                questions: JSON.stringify(questions),
                answers: JSON.stringify([]), // Empty initially,
                score: 0
            }
        });

        res.json({ success: true, session: { ...session, questions } });

    } catch (error) {
        console.error("Start Interview Error:", error);
        res.status(500).json({ success: false, error: "Failed to start interview" });
    }
});

// Submit an answer and get feedback
router.post('/answer', async (req, res) => {
    try {
        const { sessionId, questionIndex, answer } = req.body;

        const session = await prisma.interviewSession.findUnique({ where: { id: sessionId } });
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const questions = JSON.parse(session.questions);
        const questionObj = questions[questionIndex];
        const questionText = (typeof questionObj === 'object' && questionObj.question) ? questionObj.question : questionObj;

        if (!questionText) return res.status(400).json({ error: 'Invalid question format' });

        // Evaluate with AI
        const evaluation = await aiService.evaluateInterviewAnswer(questionText, answer);

        // Update session (store answer and maybe partial feedback if we wanted, but for now just return feedback)
        // We could append answers to the DB
        const currentAnswers = session.answers ? JSON.parse(session.answers) : [];
        currentAnswers[questionIndex] = answer;

        await prisma.interviewSession.update({
            where: { id: sessionId },
            data: { answers: JSON.stringify(currentAnswers) }
        });

        res.json({ success: true, evaluation });

    } catch (error) {
        console.error("Answer Evaluation Error:", error);
        res.status(500).json({ success: false, error: "Failed to evaluate answer" });
    }
});

// Save final results/score (Complete session)
router.post('/complete', async (req, res) => {
    try {
        const { sessionId, score, feedback } = req.body;

        const updated = await prisma.interviewSession.update({
            where: { id: sessionId },
            data: {
                score: parseInt(score), // Overall average score
                feedback: JSON.stringify(feedback) // { strengths: [], improvements: [] }
            }
        });

        res.json({ success: true, session: updated });
    } catch (error) {
        console.error("Complete Interview Error:", error);
        res.status(500).json({ success: false, error: "Failed to save results" });
    }
});

// Explain a question (get hint/answer)
router.post('/explain', async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) return res.status(400).json({ error: 'Question is required' });

        const explanation = await aiService.explainAnswer(question);
        res.json({ success: true, explanation });
    } catch (error) {
        console.error("Explain Error:", error);
        res.status(500).json({ success: false, error: "Failed to generate explanation" });
    }
});

module.exports = router;
