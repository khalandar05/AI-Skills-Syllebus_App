"use client"

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, FileText, Download, BookOpen, ChevronLeft, ChevronRight, Filter, Eye, EyeOff, BrainCircuit, GraduationCap } from 'lucide-react';
import { DashboardLayout } from '@/components/dash-layout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from 'framer-motion';

export default function QAPage() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [qaData, setQaData] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleGenerate = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setQaData(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('syllabus_auth_token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const res = await fetch('/api/qa/generate', {
                method: 'POST',
                headers: headers,
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                setQaData(data.data);
            } else {
                setError(data.error || "Failed to generate Q&A");
            }
        } catch (err) {
            console.error(err);
            setError("Network error or server failed to respond.");
        } finally {
            setLoading(false);
        }
    };

    const downloadJson = () => {
        if (!qaData) return;
        const blob = new Blob([JSON.stringify(qaData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qa-${(qaData.title || 'generated').toLowerCase().replace(/\s+/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <DashboardLayout title="Deep Q&A Engine">
            <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-5 duration-700 h-[calc(100vh-140px)]">
                <div className="flex flex-col lg:flex-row gap-8 items-start h-full">
                    {/* Input Section */}
                    <div className="w-full lg:w-1/3 min-w-[300px] space-y-6">
                        <Card className="rounded-2xl border-border/50 shadow-lg">
                            <CardContent className="p-6 md:p-8 space-y-6">
                                <div className="space-y-2">
                                    <h2 className="text-xl font-bold flex items-center gap-2 font-heading">
                                        <Upload className="h-5 w-5 text-primary" />
                                        Knowledge Source
                                    </h2>
                                    <p className="text-sm text-muted-foreground">Upload any syllabus chapter or reading material PDF to generate 50+ rigorous assessment questions.</p>
                                </div>

                                <div className="group relative flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-xl p-8 hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer bg-card/50">
                                    <label htmlFor="pdf" className="cursor-pointer flex flex-col items-center gap-4 w-full z-10">
                                        <div className="p-3 bg-background shadow-md rounded-lg group-hover:scale-110 transition-transform duration-300">
                                            <FileText className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="text-center">
                                            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Select PDF Document</span>
                                        </div>
                                        <Input id="pdf" type="file" accept=".pdf,image/*" onChange={handleFileChange} className="hidden" />
                                    </label>
                                    {file && (
                                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-x-4 bottom-4 bg-background border border-border/50 shadow-lg rounded-lg p-2 flex items-center justify-center">
                                            <span className="text-xs font-mono truncate max-w-[200px]">{file.name}</span>
                                        </motion.div>
                                    )}
                                </div>

                                <Button onClick={handleGenerate} disabled={!file || loading} className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-xl">
                                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <span className="flex items-center gap-2"><BrainCircuit className="w-4 h-4" /> Generate Questions</span>}
                                </Button>

                                {error && (
                                    <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg font-medium text-center">
                                        {error}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        
                        {/* Summary / Stats (Placeholder for when data is present) */}
                        {qaData && (
                             <Card className="rounded-2xl border-border/50 shadow-sm animate-in fade-in slide-in-from-bottom-2 delay-200">
                                <CardContent className="p-6 space-y-4">
                                    <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Generated Set</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-muted/30 rounded-lg text-center">
                                            <span className="block text-2xl font-bold text-foreground">{qaData.questions?.length || 0}</span>
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Total</span>
                                        </div>
                                        <div className="p-3 bg-muted/30 rounded-lg text-center">
                                            <span className="block text-2xl font-bold text-primary">{qaData.focusTopics?.length || 0}</span>
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Topics</span>
                                        </div>
                                    </div>
                                </CardContent>
                             </Card>
                        )}
                    </div>

                    {/* Results Section */}
                    <div className="w-full lg:w-2/3 h-full flex flex-col">
                        {!qaData && !loading && (
                            <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-border/50 rounded-2xl bg-muted/5 text-muted-foreground p-12 text-center">
                                <div className="p-6 bg-muted/20 rounded-full mb-6">
                                    <GraduationCap className="h-10 w-10 opacity-30" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">Assessment Engine Idle</h3>
                                <p className="max-w-xs">Upload source material to generate conceptual, application, and interview-style questions.</p>
                            </div>
                        )}

                        {loading && (
                            <div className="flex flex-col items-center justify-center h-full space-y-6">
                                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                                <div className="space-y-2 text-center">
                                    <div className="h-4 w-48 bg-muted animate-pulse rounded mx-auto" />
                                    <div className="h-3 w-32 bg-muted animate-pulse rounded mx-auto" />
                                </div>
                            </div>
                        )}

                        {qaData && (
                           <QAInteractionViewer qaData={qaData} downloadJson={downloadJson} />
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function QAInteractionViewer({ qaData, downloadJson }) {
    // Flatten logic
    const allQuestions = useMemo(() => {
        if (qaData.questions) return qaData.questions;
        let combined = [];
        ['short_questions', 'long_questions', 'conceptual_questions', 'application_questions', 'interview_questions'].forEach(cat => {
            if (qaData[cat]) combined = [...combined, ...qaData[cat].map(q => ({ ...q, category: cat.replace('_', ' '), difficulty: 'Medium' }))];
        });
        return combined;
    }, [qaData]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [filterCategory, setFilterCategory] = useState("All");
    const [filterDifficulty, setFilterDifficulty] = useState("All");
    const [showAnswer, setShowAnswer] = useState(false);

    // Filter Logic
    const filteredQuestions = useMemo(() => {
        return allQuestions.filter(q => {
            if (filterCategory !== "All" && q.category !== filterCategory) return false;
            if (filterDifficulty !== "All" && q.difficulty !== filterDifficulty) return false;
            return true;
        });
    }, [allQuestions, filterCategory, filterDifficulty]);

    const currentQuestion = filteredQuestions[currentIndex];

    // Navigation
    const nextQ = () => {
        if (currentIndex < filteredQuestions.length - 1) {
            setShowAnswer(false);
            setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
        }
    };
    const prevQ = () => {
        if (currentIndex > 0) {
            setShowAnswer(false);
            setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
        }
    };
    const jumpTo = (i) => { setShowAnswer(false); setCurrentIndex(i); };

    // Derived Lists
    const categories = Array.from(new Set(["All", ...allQuestions.map(q => q.category || "General")]));
    const difficulties = ["All", "Easy", "Medium", "Hard"];

    if (filteredQuestions.length === 0) return <div className="text-center py-20">No matching questions.</div>;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
             <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div className="flex gap-3">
                    <Select value={filterCategory} onValueChange={(v) => { setFilterCategory(v); setCurrentIndex(0); setShowAnswer(false); }}>
                        <SelectTrigger className="w-[140px] h-9 text-xs rounded-lg bg-background/50 border-border/50"><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={filterDifficulty} onValueChange={(v) => { setFilterDifficulty(v); setCurrentIndex(0); setShowAnswer(false); }}>
                        <SelectTrigger className="w-[110px] h-9 text-xs rounded-lg bg-background/50 border-border/50"><SelectValue placeholder="Difficulty" /></SelectTrigger>
                        <SelectContent>{difficulties.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <Button variant="outline" size="sm" onClick={downloadJson} className="h-9 rounded-lg border-border/50 hover:bg-muted">
                    <Download className="h-4 w-4 mr-2" /> Export JSON
                </Button>
            </div>

            {/* Main Question Card */}
            <Card className="flex-1 border-border/50 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
                {/* Header */}
                <CardHeader className="px-8 py-6 border-b border-border/50 bg-muted/10 flex flex-row justify-between items-center space-y-0">
                    <Badge variant="outline" className="text-xs font-bold border-primary/30 text-primary bg-primary/5 uppercase tracking-wider px-3 py-1">
                        {currentQuestion.category || "General"}
                    </Badge>
                    <div className="text-xs font-mono text-muted-foreground">{currentIndex + 1} / {filteredQuestions.length}</div>
                </CardHeader>

                {/* Content */}
                <CardContent className="flex-1 overflow-y-auto p-8 md:p-12 space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-2xl md:text-3xl font-medium leading-relaxed text-foreground/90 font-heading">
                            {currentQuestion.question}
                        </h3>
                    </div>

                    <div className="relative">
                        <AnimatePresence mode="wait">
                            {showAnswer ? (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: 'auto' }} 
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-emerald-50/50 dark:bg-emerald-900/10 border-l-4 border-emerald-500 rounded-r-xl p-6 md:p-8"
                                >
                                    <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <BrainCircuit className="w-4 h-4" /> Correct Answer
                                    </h4>
                                    <p className="text-lg leading-relaxed text-foreground/80 whitespace-pre-wrap">
                                        {currentQuestion.answer}
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.button 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }}
                                    onClick={() => setShowAnswer(true)}
                                    className="w-full h-32 rounded-xl border-2 border-dashed border-primary/20 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-primary/5 hover:border-primary/40 transition-all group"
                                >
                                    <div className="p-3 bg-background rounded-full group-hover:scale-110 transition-transform shadow-sm">
                                        <Eye className="w-5 h-5 text-primary" />
                                    </div>
                                    <span className="text-sm font-semibold">Reveal Answer</span>
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </CardContent>

                {/* Footer Controls */}
                <div className="p-6 border-t border-border/50 bg-muted/5 flex justify-between items-center z-10">
                     <Button variant="ghost" onClick={prevQ} disabled={currentIndex === 0} className="rounded-full hover:bg-muted w-24">
                        <ChevronLeft className="mr-2 h-4 w-4" /> Prev
                    </Button>
                    
                    <div className="flex items-center gap-2">
                         <div className="flex gap-1 justify-center">
                            {filteredQuestions.map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-primary w-4' : 'bg-muted-foreground/30'}`}
                                />
                            )).slice(Math.max(0, currentIndex - 3), Math.min(filteredQuestions.length, currentIndex + 4))}
                        </div>
                    </div>

                    <Button variant="default" onClick={nextQ} disabled={currentIndex === filteredQuestions.length - 1} className="rounded-full bg-primary text-white shadow-lg w-24">
                        Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </Card>
        </div>
    );
}
