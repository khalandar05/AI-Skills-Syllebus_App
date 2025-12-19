"use client";
import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/dash-layout";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Loader2, Zap, RotateCw, Shuffle, CheckCircle2, MoreHorizontal, XCircle, BrainCircuit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from "framer-motion";

export default function FlashcardsPage() {
    // State
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [deckData, setDeckData] = useState(null);
    const [error, setError] = useState(null);

    // Deck Logic State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [shuffledCards, setShuffledCards] = useState([]);
    
    // Check for passed deck data (e.g. from Syllabus page)
    useEffect(() => {
        try {
            const tempData = localStorage.getItem('temp_flashcard_deck');
            if (tempData) {
                const parsed = JSON.parse(tempData);
                setDeckData(parsed);
                setShuffledCards(parsed.cards || []);
                setCurrentIndex(0);
                setIsFlipped(false);
                localStorage.removeItem('temp_flashcard_deck');
            }
        } catch (e) {
            console.error("Failed to load temp deck", e);
        }
    }, []);

    // File Handler
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    // Generate Handler
    const handleGenerate = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        setDeckData(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('syllabus_auth_token');
            const res = await fetch('/api/flashcards/generate', {
                method: 'POST',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                body: formData
            });

            const rawText = await res.text();
            let data;
            try {
                data = JSON.parse(rawText);
            } catch (jsonError) {
                console.error("Failed to parse response JSON:", rawText);
                throw new Error(`Server Error: ${rawText.substring(0, 100)}...`);
            }

            if (data.success) {
                setDeckData(data.data);
                setShuffledCards(data.data.cards);
                setCurrentIndex(0);
                setIsFlipped(false);
            } else {
                setError(data.error || "Failed to generate Flashcards");
            }
        } catch (err) {
            console.error(err);
            setError("Network error.");
        } finally {
            setLoading(false);
        }
    };

    // Deck Actions
    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % shuffledCards.length);
        }, 200);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + shuffledCards.length) % shuffledCards.length);
        }, 200);
    };

    const handleShuffle = () => {
        setIsFlipped(false);
        const shuffled = [...shuffledCards].sort(() => Math.random() - 0.5);
        setShuffledCards(shuffled);
        setCurrentIndex(0);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    };

    const markAsKnown = () => {
        confetti({ particleCount: 30, spread: 40, colors: ['#10B981'] });
        handleNext();
    };

    const currentCard = shuffledCards[currentIndex];

    return (
        <DashboardLayout title="Flashcard Studio">
            <div className="flex flex-col h-[calc(100vh-140px)] p-4 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-5 duration-700">
                
                {/* 1. Upload Section (Visible when no deck) */}
                {!deckData && !loading && (
                    <div className="flex flex-col items-center justify-center h-full space-y-12">
                        <div className="text-center space-y-6">
                            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 shadow-lg mb-2 transform hover:scale-110 transition-transform duration-500">
                                <Zap className="h-10 w-10 text-primary" />
                            </div>
                            <h1 className="text-5xl font-heading font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/50">Active Recall</h1>
                            <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">Upload any PDF chapter to instantly create an intelligent study deck powered by AI.</p>
                        </div>

                        <div className="w-full max-w-lg">
                             <div className="group relative flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-3xl p-12 hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer bg-card/30 backdrop-blur-sm">
                                <label className="cursor-pointer flex flex-col items-center gap-6 w-full z-10">
                                    <div className="p-5 bg-background shadow-xl rounded-full group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                                        <FileText className="w-10 h-10 text-primary" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-xl text-foreground">Drop your PDF here</p>
                                        <p className="text-sm text-muted-foreground mt-2">or click to browse</p>
                                    </div>
                                    <input 
                                        type="file" 
                                        accept=".pdf" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                        onChange={handleFileChange} 
                                    />
                                </label>
                            </div>
                            
                            {file && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex items-center justify-between bg-card p-4 rounded-xl border border-primary/20 shadow-sm">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2 bg-primary/10 rounded-lg"><FileText className="w-4 h-4 text-primary" /></div>
                                        <span className="text-sm font-medium truncate">{file.name}</span>
                                    </div>
                                    <Button size="sm" onClick={handleGenerate} className="bg-primary shadow-lg shadow-primary/25 hover:bg-primary/90 text-white rounded-lg">
                                        <Zap className="w-4 h-4 mr-2" /> Generate
                                    </Button>
                                </motion.div>
                            )}
                            
                            {error && (
                                <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive animate-in shake">
                                    <XCircle className="w-5 h-5"/>
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 2. Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center h-full gap-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                            <Loader2 className="w-16 h-16 animate-spin text-primary relative z-10" />
                        </div>
                        <div className="text-center space-y-2">
                             <h3 className="text-2xl font-bold font-heading">Consuming Knowledge</h3>
                             <p className="text-muted-foreground animate-pulse">Deconstructing concepts into flashcards...</p>
                        </div>
                    </div>
                )}

                {/* 3. Deck View */}
                {deckData && currentCard && (
                    <div className="flex flex-col items-center h-full max-w-3xl mx-auto w-full pt-4">
                        {/* Header Controls */}
                        <div className="flex justify-between items-center w-full mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <BrainCircuit className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold leading-none">{deckData.topic || "Generated Deck"}</h2>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <div className="h-1.5 w-32 bg-secondary rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-primary transition-all duration-300" 
                                                style={{ width: `${((currentIndex + 1) / shuffledCards.length) * 100}%` }} 
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground font-mono">{currentIndex + 1} / {shuffledCards.length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={handleShuffle} className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors border-border/50" title="Shuffle Deck">
                                    <Shuffle className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => { setDeckData(null); setFile(null); }} className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                                    <XCircle className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Flashcard Area */}
                        <div className="relative w-full aspect-[1.7/1] perspective-1000 group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                            <motion.div 
                                className="w-full h-full relative preserve-3d transition-all duration-500"
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                {/* FRONT */}
                                <Card className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-12 text-center border-border/50 bg-gradient-to-br from-card via-card to-primary/5 shadow-xl backdrop-blur-sm rounded-3xl overflow-hidden">
                                    <Badge variant="secondary" className="absolute top-8 left-8 bg-secondary/80 backdrop-blur border border-border/50 text-foreground/70 uppercase tracking-widest text-[10px] font-bold px-3 py-1">
                                        {currentCard.category}
                                    </Badge>
                                    <h3 className="text-3xl md:text-4xl font-bold leading-tight select-none tracking-tight text-foreground font-heading">
                                        {currentCard.front}
                                    </h3>
                                    <div className="absolute bottom-8 flex items-center gap-2 text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">
                                        <MoreHorizontal className="w-4 h-4 animate-pulse" /> Click to Flip
                                    </div>
                                </Card>

                                {/* BACK */}
                                <Card 
                                    className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-12 text-center border-border/50 bg-slate-900 shadow-xl rounded-3xl overflow-hidden" 
                                    style={{ transform: "rotateY(180deg)" }}
                                >
                                    <div className="prose prose-invert max-w-none text-xl md:text-2xl leading-relaxed select-none font-medium text-slate-100">
                                        {currentCard.back}
                                    </div>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Footer Controls */}
                        <div className="flex items-center justify-center w-full mt-10 gap-6">
                            <Button variant="outline" size="lg" onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="w-32 h-14 rounded-full border-border/50 hover:bg-secondary/50 text-base">
                                Previous
                            </Button>

                             <Button 
                                className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border-2 border-emerald-500/20 hover:border-emerald-500 transition-all hover:scale-110 shadow-lg"
                                onClick={(e) => { e.stopPropagation(); markAsKnown(); }}
                            >
                                <CheckCircle2 className="w-8 h-8" />
                            </Button>

                            <Button variant="outline" size="lg" onClick={(e) => { e.stopPropagation(); handleNext(); }} className="w-32 h-14 rounded-full border-border/50 hover:bg-secondary/50 text-base">
                                Next
                            </Button>
                        </div>
                        <p className="text-center text-xs text-muted-foreground mt-6 font-medium">Spacebar to flip • Arrows to navigate</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
