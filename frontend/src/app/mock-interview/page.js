"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NeonButton } from '@/components/ui/neon-button';
import { HolographicCard } from '@/components/ui/holographic-card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DashboardLayout } from '@/components/dash-layout';
import { Loader2, Mic, Play, CheckCircle2, AlertCircle, ChevronRight, Award, BrainCircuit, Lightbulb, Volume2, StopCircle, Code2, Users, Calculator, Activity, Radio, Cpu, Zap, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function MockInterviewPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState(null); 
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState(null); 
    const [completed, setCompleted] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [explanation, setExplanation] = useState(null);
    const [explaining, setExplaining] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [interviewType, setInterviewType] = useState('Technical');
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
                const data = await res.json();
                if (data.success && data.topics && data.topics.length > 0) {
                    setContext(`Syllabus Topics: ${data.topics.join(', ')}`);
                    setHasSyllabus(true);
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ context, type: interviewType })
            });
            const data = await res.json();
            if (data.success) {
                setSession(data.session);
                setCurrentIndex(0);
                setFeedback(null);
                setCompleted(false);
            } else {
                alert(data.error || "Failed to initiate simulation sequence.");
            }
        } catch (e) {
            alert("Connection to simulator core failed.");
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ sessionId: session.id, questionIndex: currentIndex, answer })
            });
            const data = await res.json();
            if (data.success) {
                setFeedback(data.evaluation);
            } else {
                alert(data.error || "Submission rejected by mainframe.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const toggleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Voice module not detected. Chrome browser recommended.");
            return;
        }

        if (isListening) {
             setIsListening(false);
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

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ question })
            });
            const data = await res.json();
            if (data.success) {
                setExplanation(data.explanation);
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
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            setIsSpeaking(true);
            window.speechSynthesis.speak(utterance);
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
            setExplanation(null);
            stopSpeaking();
        } else {
            finishSession();
        }
    };

    const finishSession = async () => {
        setCompleted(true);
        confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#22D3EE', '#6D28D9', '#E879F9']
        });
    };

    const modules = [
        { id: 'Technical', label: 'Technical', icon: BrainCircuit, color: 'text-plasma-cyan', desc: 'Core Systems Knowledge' },
        { id: 'Aptitude', label: 'Aptitude', icon: Calculator, color: 'text-solar-gold', desc: 'Logic & Computation' },
        { id: 'DSA', label: 'Algorithms', icon: Code2, color: 'text-aurora-green', desc: 'Data Structure Optimization' },
        { id: 'HR', label: 'Behavioral', icon: Users, color: 'text-nebula-purple', desc: 'Crew Compatibility' },
    ];

    return (
        <DashboardLayout title="Simulation Chamber">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-1000">
                
                {/* 1. Setup Screen */}
                {!session && !completed && (
                    <div className="max-w-4xl mx-auto space-y-12 py-12">
                        <div className="text-center space-y-4">
                            <div className="inline-flex relative">
                                <div className="absolute inset-0 bg-plasma-cyan/30 blur-xl rounded-full animate-pulse-slow" />
                                <BrainCircuit className="h-20 w-20 text-plasma-cyan relative z-10" />
                            </div>
                            <h1 className="text-5xl font-heading font-black tracking-widest text-white uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">Training Simulator</h1>
                            <p className="text-plasma-cyan font-mono text-sm tracking-widest uppercase">
                                Initialize AI-driven interview scenarios tailored to your career trajectory.
                            </p>
                        </div>

                        {/* Module Selection */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {modules.map((m) => (
                                <div 
                                    key={m.id}
                                    onClick={() => setInterviewType(m.id)}
                                    className={`relative cursor-pointer transition-all duration-300 group ${interviewType === m.id ? 'scale-105' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                                >
                                    <HolographicCard className={`h-full flex flex-col items-center text-center p-6 border-2 ${interviewType === m.id ? 'border-plasma-cyan bg-plasma-cyan/5 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'border-white/10 hover:border-white/30'}`}>
                                        <div className={`p-4 rounded-full bg-white/5 mb-4 ${interviewType === m.id ? 'animate-pulse' : ''}`}>
                                            <m.icon className={`h-8 w-8 ${m.color}`} />
                                        </div>
                                        <div className="font-bold text-lg text-white font-heading uppercase tracking-wide">{m.label}</div>
                                        <div className="text-[10px] text-slate-400 font-mono mt-2">{m.desc}</div>
                                    </HolographicCard>
                                </div>
                            ))}
                        </div>

                        {/* Config Panel */}
                        <HolographicCard className="p-8 border-l-4 border-l-plasma-cyan">
                            <div className="grid md:grid-cols-3 gap-8 items-center">
                                <div className="md:col-span-2 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold tracking-widest uppercase text-plasma-cyan flex items-center gap-2">
                                            <Activity className="h-4 w-4" /> Calibration Parameters
                                        </label>
                                        <Input 
                                            placeholder="e.g. Senior React Developer, System Design, Python Backend" 
                                            value={context}
                                            onChange={(e) => setContext(e.target.value)}
                                            className="h-14 bg-black/40 border-white/10 focus:border-plasma-cyan text-white text-lg font-mono placeholder:text-slate-600 rounded-none border-l-2 border-l-white/20"
                                        />
                                    </div>
                                    {hasSyllabus && (
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-nebula-purple/20 border border-nebula-purple/30 rounded text-xs text-nebula-purple">
                                            <Zap className="h-3 w-3" /> Syllabus Data Synced
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-center">
                                    <NeonButton 
                                        size="xl" 
                                        onClick={startSession} 
                                        disabled={!context || loading}
                                        className="w-full h-20 text-xl font-bold tracking-widest relative overflow-hidden group"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-3">
                                                <Loader2 className="h-6 w-6 animate-spin" /> INITIALIZING...
                                            </div>
                                        ) : (
                                            <>
                                                <span className="relative z-10 flex items-center gap-3">
                                                    <Play className="h-6 w-6 fill-current" /> ENGAGE SYSTEM
                                                </span>
                                            </>
                                        )}
                                    </NeonButton>
                                </div>
                            </div>
                        </HolographicCard>
                    </div>
                )}

                {/* 2. Simulation Interface */}
                {session && !completed && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
                        {/* Main Interface */}
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            <HolographicCard className="p-8 border-t-4 border-t-plasma-cyan relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-20">
                                    <Activity className="h-32 w-32 text-plasma-cyan" />
                                </div>
                                
                                <div className="flex justify-between items-center mb-6 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-plasma-cyan/10 border border-plasma-cyan/30 text-plasma-cyan text-xs font-bold tracking-widest uppercase rounded">
                                            Seq {currentIndex + 1} / {session.questions.length}
                                        </span>
                                        <span className="flex items-center gap-2 text-[10px] text-red-400 font-bold uppercase tracking-widest animate-pulse">
                                            <div className="w-2 h-2 rounded-full bg-red-500" /> Live Feed
                                        </span>
                                    </div>
                                    <Timer className="h-5 w-5 text-slate-500" />
                                </div>
                                
                                <h2 className="text-2xl md:text-3xl font-heading font-medium leading-relaxed text-white relative z-10">
                                    {typeof session.questions[currentIndex] === 'object' ? session.questions[currentIndex].question : session.questions[currentIndex]}
                                </h2>
                            </HolographicCard>

                            <div className="flex-1 relative flex flex-col">
                                <div className="absolute -inset-1 bg-gradient-to-b from-plasma-cyan/20 to-transparent opacity-20 blur-sm rounded-xl pointer-events-none" />
                                <Textarea 
                                    placeholder="Input response data..." 
                                    className="flex-1 text-lg p-6 bg-black/40 border-white/10 focus:border-plasma-cyan/50 text-white placeholder:text-slate-600 font-mono leading-relaxed rounded-xl resize-none min-h-[300px]"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    disabled={loading || !!feedback}
                                />
                                
                                <div className="absolute top-4 right-4">
                                     <button 
                                        className={`h-10 w-10 rounded-full flex items-center justify-center transition-all bg-black/50 border border-white/10 hover:border-plasma-cyan ${isListening ? 'text-red-500 border-red-500 animate-pulse' : 'text-slate-400'}`}
                                        onClick={toggleVoiceInput}
                                        disabled={loading || !!feedback}
                                    >
                                        <Mic className="h-5 w-5" />
                                    </button>
                                </div>

                                {!feedback && (
                                    <div className="absolute bottom-6 right-6 flex gap-4">
                                        {!explanation && (
                                            <NeonButton 
                                                variant="ghost" 
                                                onClick={handleExplain}
                                                disabled={explaining}
                                                size="sm"
                                                className="text-xs"
                                            >
                                                {explaining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                                                Request Intel
                                            </NeonButton>
                                        )}
                                        <NeonButton 
                                            onClick={submitAnswer} 
                                            disabled={!answer.trim() || loading}
                                        >
                                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Transmit Data
                                        </NeonButton>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Analysis Panel */}
                        <div className="lg:col-span-4 flex flex-col h-full">
                            <AnimatePresence mode="wait">
                                {feedback ? (
                                    <motion.div 
                                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                        className="h-full"
                                    >
                                        <HolographicCard className="h-full flex flex-col border-emerald-500/30">
                                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-emerald-500/5">
                                                <h3 className="font-heading font-bold text-white uppercase tracking-wider">Analysis Complete</h3>
                                                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 rounded text-sm">
                                                    {feedback.score}%
                                                </div>
                                            </div>
                                            
                                            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
                                                <div className="space-y-2">
                                                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4" /> Optimizations
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {feedback.strengths?.map((s, i) => (
                                                            <li key={i} className="text-xs text-slate-300 bg-emerald-500/10 p-2 rounded border border-emerald-500/10">{s}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="text-xs font-bold text-solar-gold uppercase tracking-widest flex items-center gap-2">
                                                        <AlertCircle className="h-4 w-4" /> Anomalies Detected
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {feedback.improvements?.map((s, i) => (
                                                            <li key={i} className="text-xs text-slate-300 bg-solar-gold/10 p-2 rounded border border-solar-gold/10">{s}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="p-4 bg-white/5 border border-white/5 rounded italic text-slate-400 text-sm">
                                                    &quot;{feedback.feedback}&quot;
                                                </div>
                                            </div>

                                            <div className="p-6 border-t border-white/5">
                                                <NeonButton className="w-full" onClick={nextQuestion}>
                                                    {currentIndex < session.questions.length - 1 ? "Next Sequence" : "End Simulation"} <ChevronRight className="ml-2 h-4 w-4" />
                                                </NeonButton>
                                            </div>
                                        </HolographicCard>
                                    </motion.div>
                                ) : (
                                    <HolographicCard className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50 border-dashed border-white/10">
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                            <Radio className="h-8 w-8 text-slate-500" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-2">Awaiting Input</h3>
                                        <p className="text-xs text-slate-500 font-mono">Transmission channel open.</p>
                                    </HolographicCard>
                                )}
                            </AnimatePresence>

                            {/* Explanation Overlay */}
                            <AnimatePresence>
                                {explanation && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                                        className="absolute bottom-6 right-6 lg:static lg:mt-6 z-20"
                                    >
                                        <HolographicCard className="border-plasma-cyan/40 shadow-[0_0_30px_rgba(34,211,238,0.1)] bg-black/90 backdrop-blur-xl">
                                            <div className="p-4 flex items-center justify-between border-b border-white/10">
                                                <div className="flex items-center gap-2 text-plasma-cyan font-bold text-xs uppercase tracking-widest">
                                                    <Lightbulb className="h-4 w-4" /> Intel Database
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={isSpeaking ? stopSpeaking : speakExplanation} className="text-plasma-cyan hover:text-white p-1">
                                                        {isSpeaking ? <StopCircle className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                                    </button>
                                                    <button onClick={() => { setExplanation(null); stopSpeaking(); }} className="text-slate-500 hover:text-white p-1">×</button>
                                                </div>
                                            </div>
                                            <div className="p-4 text-sm text-slate-300 max-h-[200px] overflow-y-auto custom-scrollbar space-y-3 font-light">
                                                <p>{explanation.explanation}</p>
                                                <div className="bg-white/5 p-3 rounded border border-white/5">
                                                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Optimal Response Protocol</span>
                                                    <p className="italic text-slate-400">&quot;{explanation.modelAnswer}&quot;</p>
                                                </div>
                                            </div>
                                        </HolographicCard>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* 3. Debriefing Screen */}
                {completed && (
                    <div className="flex justify-center py-20">
                        <HolographicCard className="max-w-xl w-full text-center p-12 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-plasma-cyan/10 to-transparent opacity-50" />
                            <div className="relative z-10">
                                <div className="inline-flex items-center justify-center p-8 bg-plasma-cyan/10 rounded-full text-plasma-cyan mb-8 border border-plasma-cyan/20 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                                    <Award className="h-16 w-16" />
                                </div>
                                <h2 className="text-4xl font-heading font-black text-white uppercase tracking-widest mb-4">Simulation Complete</h2>
                                <p className="text-slate-400 text-lg px-4 mb-8 font-light">
                                    Data sequence successfully archived. Performance metrics have been logged.
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <NeonButton variant="ghost" onClick={() => router.push('/dashboard')}>
                                        Return to Bridge
                                    </NeonButton>
                                    <NeonButton onClick={() => { setSession(null); setCompleted(false); setContext(''); setFeedback(null); }}>
                                        Re-Initialize
                                    </NeonButton>
                                </div>
                            </div>
                        </HolographicCard>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
