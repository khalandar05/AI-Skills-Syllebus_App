const { PrismaClient } = require('@prisma/client');
const aiService = require('../services/aiService');
const prisma = require('../lib/prisma');

const startInterview = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        const { context } = req.body; 

        if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

        let questions = [];
        const interviewType = req.body.type || "Technical"; 

        try {
             const aiPromise = aiService.generateInterviewQuestions(context, "Medium", interviewType);
             const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("AI Timeout")), 25000));
             
             const aiResponse = await Promise.race([aiPromise, timeoutPromise]);
             if (aiResponse && aiResponse.questions) {
                 questions = aiResponse.questions;
             }
        } catch (aiError) {
            console.warn("AI Generation Failed (Using Fallback):", aiError.message);
        }

        if (!questions || questions.length === 0) {
            questions = [{ id: 1, question: "Tell me about yourself.", type: interviewType }];
        }

        const session = await prisma.interviewSession.create({
            data: {
                userId,
                questions: JSON.stringify(questions),
                answers: JSON.stringify([]), 
                score: 0
            }
        });

        res.json({ success: true, session: { ...session, questions } });
    } catch (error) {
        next(error);
    }
};

const submitAnswer = async (req, res, next) => {
    try {
        const { sessionId, questionIndex, answer } = req.body;

        const session = await prisma.interviewSession.findUnique({ where: { id: sessionId } });
        if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

        const questions = JSON.parse(session.questions);
        const questionObj = questions[questionIndex];
        const questionText = (typeof questionObj === 'object' && questionObj.question) ? questionObj.question : questionObj;

        if (!questionText) return res.status(400).json({ success: false, error: 'Invalid question format' });

        const evaluation = await aiService.evaluateInterviewAnswer(questionText, answer);

        const currentAnswers = session.answers ? JSON.parse(session.answers) : [];
        currentAnswers[questionIndex] = answer;

        await prisma.interviewSession.update({
            where: { id: sessionId },
            data: { answers: JSON.stringify(currentAnswers) }
        });

        res.json({ success: true, evaluation });
    } catch (error) {
        next(error);
    }
};

const completeInterview = async (req, res, next) => {
    try {
        const { sessionId, score, feedback } = req.body;

        const updated = await prisma.interviewSession.update({
            where: { id: sessionId },
            data: {
                score: parseInt(score) || 0,
                feedback: JSON.stringify(feedback)
            }
        });

        res.json({ success: true, session: updated });
    } catch (error) {
        next(error);
    }
};

const explainQuestion = async (req, res, next) => {
    try {
        const { question } = req.body;
        if (!question) return res.status(400).json({ success: false, error: 'Question is required' });

        const explanation = await aiService.explainAnswer(question);
        res.json({ success: true, explanation });
    } catch (error) {
        next(error);
    }
};

module.exports = { startInterview, submitAnswer, completeInterview, explainQuestion };
