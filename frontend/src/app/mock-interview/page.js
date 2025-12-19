"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DashboardLayout } from '@/components/dash-layout';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mic, Play, CheckCircle2, AlertCircle, ChevronRight, Award, BrainCircuit, Lightbulb, User, Volume2, StopCircle, Code2, Users, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function MockInterviewPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState(null); // { id, questions: [], score... }
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState(null); // { score, strengths, improvements }

    const [completed, setCompleted] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [explanation, setExplanation] = useState(null); // { explanation, modelAnswer }
    const [explaining, setExplaining] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [interviewType, setInterviewType] = useState('Technical'); // Technical, Aptitude, DSA, HR

    // Setup state
    const [context, setContext] = useState('');
    const [hasSyllabus, setHasSyllabus] = useState(false);

    useEffect(() => {
        const fetchSyllabusContext = async () => {
            const token = localStorage.getItem('syllabus_auth_token');
            if (!token) return;

            try {
                const res = await fetch('/api/syllabus', {
                     headers: { 'Authorization': `Bearer ${token}` }
                });
                let data;
                try {
                    const text = await res.text();
                    try {
                        data = JSON.parse(text);
                    } catch {
                        throw new Error(text || res.statusText);
                    }
                } catch (e) {
                     console.error("Parse Error:", e);
                     throw new Error("Invalid Server Response");
                }

                if (data.success && data.topics && data.topics.length > 0) {
                    const ctx = `Syllabus Topics: ${data.topics.join(', ')}`;
                    setContext(ctx);
                    setHasSyllabus(true);
                } else {
                    setContext('');
                    setHasSyllabus(false);
                }
            } catch (err) {
                console.error("Failed to load syllabus context:", err);
            }
        };

        fetchSyllabusContext();
    }, []);

    const startSession = async () => {
        if (!context) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('syllabus_auth_token');
            const res = await fetch('/api/interview/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ context, type: interviewType })
            });
            
            let data;
            try {
                const text = await res.text();
                // Check if text starts with < or Internal Server Error to fail early
                if (text.startsWith('<') || text.includes('Internal Server Error')) {
                    throw new Error("Server timeout or error. Please try again.");
                }
                data = JSON.parse(text);
            } catch (e) {
                console.error("Start Session Parse Error:", e);
                alert("Failed to start session: The AI took too long to respond. Please try again.");
                return;
            }

            if (data.success) {
                setSession(data.session);
                setCurrentIndex(0);
                setFeedback(null);
                setCompleted(false);
            } else {
                alert(data.error || "Failed to start session");
            }
        } catch (e) {
            console.error("Failed to start session", e);
        } finally {
            setLoading(false);
        }
    };

    const submitAnswer = async () => {
        if (!answer.trim()) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('syllabus_auth_token');
            const res = await fetch('/api/interview/answer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    sessionId: session.id,
                    questionIndex: currentIndex,
                    answer
                })
            });

            let data;
            try {
                const text = await res.text();
                data = JSON.parse(text);
            } catch (e) {
                console.error("Submit Answer Parse Error:", e);
                alert("Failed to submit answer: Server Error");
                return;
            }

            if (data.success) {
                setFeedback(data.evaluation);
            } else {
                alert(data.error || "Failed to submit answer");
            }
        } catch (e) {
            console.error("Failed to submit answer", e);
        } finally {
            setLoading(false);
        }
    };

    const toggleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Voice input is not supported in this browser. Please use Chrome.");
            return;
        }

        if (isListening) {
             setIsListening(false);
             // Stop logic usually handled by speech recognition event, but we'll force toggle UI
             return;
        }

        setIsListening(true);
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setAnswer(prev => prev + (prev ? ' ' : '') + transcript);
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error("Speech Error:", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const handleExplain = async () => {
        if (!session || !session.questions[currentIndex]) return;
        setExplaining(true);
        try {
            const token = localStorage.getItem('syllabus_auth_token');
            const question = typeof session.questions[currentIndex] === 'object' ? session.questions[currentIndex].question : session.questions[currentIndex];
            
            const res = await fetch('/api/interview/explain', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ question })
            });
            const data = await res.json();
            if (data.success) {
                setExplanation(data.explanation);
            } else {
                alert("Failed to get explanation");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setExplaining(false);
        }
    };

    const speakExplanation = () => {
        if (!explanation) return;
        const textToSpeak = `${explanation.explanation}. Model Answer: ${explanation.modelAnswer}`;
        
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop any previous speech
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            setIsSpeaking(true);
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Text-to-Speech is not supported in this browser.");
        }
    };

    const stopSpeaking = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    const nextQuestion = () => {
        if (currentIndex < session.questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setAnswer('');
            setFeedback(null);
            setExplanation(null); // Reset explanation
            stopSpeaking(); // Stop speech on next question
        } else {
            finishSession();
        }
    };

    const finishSession = async () => {
        setCompleted(true);
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4F46E5', '#9333EA', '#10B981'] // Updated to match primary/accent colors
        });
    };

    const modules = [
        { id: 'Technical', label: 'Technical', icon: BrainCircuit, color: 'text-primary', desc: 'Stack-specific deep dive' },
        { id: 'Aptitude', label: 'Aptitude', icon: Calculator, color: 'text-orange-500', desc: 'Quantitative & Logical' },
        { id: 'DSA', label: 'DSA', icon: Code2, color: 'text-blue-500', desc: 'Data Structures & Algo' },
        { id: 'HR', label: 'HR Round', icon: Users, color: 'text-purple-500', desc: 'Behavioral & Culture' },
    ];

    return (
        <DashboardLayout title="AI Mock Interview">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                
                {/* 1. Setup Screen */}
                {!session && !completed && (
                    <div className="max-w-2xl mx-auto space-y-10 py-12">
                        <div className="text-center space-y-4">
                            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4 animate-pulse">
                                <BrainCircuit className="h-10 w-10 text-primary" />
                            </div>
                            <h1 className="text-4xl font-heading font-bold tracking-tight text-foreground">Technical Interview Sim</h1>
                            <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
                                Practice real-world technical questions tailored to your tech stack. 
                                Receive instant, actionable feedback from an AI Senior Engineer.
                            </p>
                        </div>

                        {/* Module Selection Tabs */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {modules.map((m) => (
                                <Card 
                                    key={m.id}
                                    onClick={() => setInterviewType(m.id)}
                                    className={`cursor-pointer transition-all hover:scale-105 border-2 ${interviewType === m.id ? 'border-primary bg-primary/5 shadow-md' : 'border-border/50 hover:border-primary/50'}`}
                                >
                                    <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                                        <m.icon className={`h-8 w-8 ${m.color}`} />
                                        <div className="space-y-1">
                                            <div className="font-bold text-sm text-foreground">{m.label}</div>
                                            <div className="text-[10px] text-muted-foreground leading-tight">{m.desc}</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Card className="border-border/60 shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-600" />
                            <CardContent className="p-8 space-y-8">
                                <div className="space-y-4">
                                    <label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                                        Target Role or Tech Stack
                                    </label>
                                    <div className="relative">
                                        <Input 
                                            placeholder="e.g. Senior React Developer, Node.js Backend, System Design" 
                                            value={context}
                                            onChange={(e) => setContext(e.target.value)}
                                            className="h-14 pl-4 text-lg bg-background/50 border-border/60 focus:ring-primary/20 transition-all rounded-xl"
                                        />
                                        <div className="absolute right-3 top-3.5">
                                            {hasSyllabus && <Badge variant="secondary" className="bg-primary/10 text-primary text-xs pointer-events-none border-primary/20">Syllabus Sync</Badge>}
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        The AI will generate custom questions based on this context.
                                    </div>
                                </div>
                                <Button 
                                    className="w-full h-14 text-lg font-bold rounded-xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.01] active:scale-[0.99]" 
                                    onClick={startSession} 
                                    disabled={!context || loading}
                                >
                                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5 fill-current" />}
                                    Start Interview Session
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-sm">
                            <Card className="border-t-4 border-t-blue-500 shadow-sm">
                                <CardContent className="p-6">
                                    <span className="block font-bold text-foreground text-lg mb-1">15 Questions</span>
                                    <span className="text-muted-foreground">Curated questions</span>
                                </CardContent>
                            </Card>
                            <Card className="border-t-4 border-t-purple-500 shadow-sm">
                                <CardContent className="p-6">
                                    <span className="block font-bold text-foreground text-lg mb-1">Instant</span>
                                    <span className="text-muted-foreground">Detailed Feedback</span>
                                </CardContent>
                            </Card>
                            <Card className="border-t-4 border-t-emerald-500 shadow-sm">
                                <CardContent className="p-6">
                                    <span className="block font-bold text-foreground text-lg mb-1">Scoring</span>
                                    <span className="text-muted-foreground">Performance metrics</span>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* 2. Interview Interface */}
                {session && !completed && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
                        {/* Main Question Area */}
                        <div className="lg:col-span-8 flex flex-col gap-6 h-full">
                            <Card className="border-l-4 border-l-primary shadow-md bg-card/80 backdrop-blur-sm">
                                <CardContent className="p-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <Badge variant="outline" className="text-xs font-semibold tracking-wider uppercase border-primary/20 text-primary bg-primary/5 px-3 py-1">
                                            Question {currentIndex + 1} of {session.questions.length}
                                        </Badge>
                                        <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Live Session
                                        </span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-heading font-medium leading-relaxed text-foreground">
                                        {typeof session.questions[currentIndex] === 'object' ? session.questions[currentIndex].question : session.questions[currentIndex]}
                                    </h2>
                                </CardContent>
                            </Card>

                            <div className="flex-1 flex flex-col gap-4 relative">
                                <Textarea 
                                    placeholder="Type your detailed answer here... (Markdown supported)" 
                                    className="flex-1 text-lg p-6 resize-none font-normal leading-relaxed rounded-2xl border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all bg-card shadow-inner"
                                    value={answer}

                                    onChange={(e) => setAnswer(e.target.value)}
                                    disabled={loading || !!feedback}
                                />
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className={`absolute top-4 right-4 rounded-full w-10 h-10 transition-all ${isListening ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse border-red-500' : 'bg-background hover:bg-muted text-muted-foreground'}`}
                                    onClick={toggleVoiceInput}
                                    disabled={loading || !!feedback}
                                    title="Voice Input"
                                >
                                    <Mic className={`h-5 w-5 ${isListening ? 'fill-current' : ''}`} />
                                </Button>
                                
                                {!feedback && (
                                    <div className="absolute bottom-6 right-6">
                                        <Button 
                                            onClick={submitAnswer} 
                                            disabled={!answer.trim() || loading}
                                            className="h-12 px-6 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-white font-semibold transition-all hover:scale-105"
                                        >
                                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Submit Answer
                                        </Button>
                                        {!explanation && (
                                            <Button 
                                                variant="ghost" 
                                                onClick={handleExplain}
                                                disabled={explaining}
                                                className="h-12 px-4 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5"
                                            >
                                                {explaining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                                                Explain / I don&apos;t know
                                            </Button>
                                        )}
                                    </div>
                                )}
                                
                                {explanation && (
                                    <div className="absolute bottom-6 right-6 z-10 w-full max-w-lg">
                                        <Card className="bg-primary/5 border-primary/20 shadow-2xl backdrop-blur-md">
                                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                                <div className="flex items-center gap-2 text-primary font-bold">
                                                    <Lightbulb className="h-5 w-5 fill-current" /> AI Explanation
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isSpeaking ? (
                                                        <Button variant="ghost" size="sm" onClick={stopSpeaking} className="text-red-500 hover:text-red-700 hover:bg-red-100">
                                                            <StopCircle className="h-5 w-5" />
                                                        </Button>
                                                    ) : (
                                                        <Button variant="ghost" size="sm" onClick={speakExplanation} className="text-primary hover:text-primary-foreground hover:bg-primary">
                                                            <Volume2 className="h-5 w-5" />
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="sm" onClick={() => { setExplanation(null); stopSpeaking(); }} className="h-6 w-6 p-0 hover:bg-primary/20 rounded-full">×</Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="text-sm space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                                                <p className="font-medium text-foreground">{explanation.explanation}</p>
                                                <div className="bg-background/50 p-3 rounded-lg border border-border/50">
                                                    <strong className="text-xs uppercase tracking-wide text-muted-foreground block mb-1">Model Answer</strong>
                                                    <p className="text-muted-foreground italic">&quot;{explanation.modelAnswer}&quot;</p>
                                                </div>
                                                {explanation.keyPoints && (
                                                     <ul className="list-disc pl-4 space-y-1 text-muted-foreground/80 text-xs">
                                                        {explanation.keyPoints.map((p,i) => <li key={i}>{p}</li>)}
                                                     </ul>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Feedback Panel */}
                        <div className="lg:col-span-4 h-full">
                            {feedback ? (
                                <Card className="h-full border-border/50 shadow-xl overflow-hidden flex flex-col animate-in slide-in-from-right-4 fade-in duration-500 bg-card/95">
                                    <div className="p-6 border-b border-border/50 bg-muted/30">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-lg font-heading">Evaluation</h3>
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-sm ${feedback.score >= 70 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                                <span>{feedback.score}</span>
                                                <span className="text-xs opacity-70">/ 100</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-emerald-600">
                                                <CheckCircle2 className="h-4 w-4" /> Strengths
                                            </h4>
                                            <ul className="text-sm space-y-2 text-muted-foreground/90 ml-1">
                                                {feedback.strengths?.map((s, i) => (
                                                    <li key={i} className="flex gap-2 items-start bg-emerald-50/50 dark:bg-emerald-900/10 p-2.5 rounded-lg">
                                                        <span>{s}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-amber-600">
                                                <AlertCircle className="h-4 w-4" /> Improvements
                                            </h4>
                                            <ul className="text-sm space-y-2 text-muted-foreground/90 ml-1">
                                                {feedback.improvements?.map((s, i) => (
                                                    <li key={i} className="flex gap-2 items-start bg-amber-50/50 dark:bg-amber-900/10 p-2.5 rounded-lg">
                                                        <span>{s}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="p-5 rounded-xl bg-muted/40 text-sm italic text-muted-foreground border-l-2 border-primary/30 leading-relaxed">
                                            &quot;{feedback.feedback}&quot;
                                        </div>
                                    </div>

                                    <div className="p-6 border-t border-border/50 bg-muted/10">
                                        <Button className="w-full h-12 rounded-xl text-base shadow-md" onClick={nextQuestion}>
                                            {currentIndex < session.questions.length - 1 ? "Next Question" : "Complete Interview"} 
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </Card>
                            ) : (
                                <Card className="h-full border-dashed border-2 border-border/40 flex flex-col items-center justify-center text-center p-8 bg-muted/5 shadow-inner">
                                    <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                                        <Mic className="h-10 w-10 text-muted-foreground/30" />
                                    </div>
                                    <h3 className="text-xl font-heading font-medium text-foreground mb-2">Awaiting Answer</h3>
                                    <p className="text-sm text-muted-foreground max-w-[220px] leading-relaxed">
                                        Submit your response to receive detailed AI analysis and scoring.
                                    </p>
                                </Card>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. Completion Screen */}
                {completed && (
                    <div className="flex justify-center py-20">
                        <Card className="max-w-xl w-full text-center p-10 shadow-2xl border-border/60 animate-in zoom-in duration-500">
                            <div className="inline-flex items-center justify-center p-8 bg-emerald-100 dark:bg-emerald-900/20 rounded-full text-emerald-600 dark:text-emerald-400 mb-6 shadow-inner">
                                <Award className="h-16 w-16" />
                            </div>
                            <div className="space-y-4 mb-4">
                                <h2 className="text-4xl font-heading font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Interview Completed!</h2>
                                <p className="text-muted-foreground text-lg px-4 leading-relaxed">
                                    You have successfully completed the technical assessment. Great job practicing your skills!
                                </p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
                                <Button variant="outline" size="lg" className="border-primary/20 text-primary hover:bg-primary/5" onClick={() => router.push('/dashboard')}>
                                    Return to Dashboard
                                </Button>
                                <Button size="lg" className="bg-primary text-white shadow-xl shadow-primary/20" onClick={() => { setSession(null); setCompleted(false); setContext(''); setFeedback(null); }}>
                                    Start New Session
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
