"use client";
import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/dash-layout";
import { NeonButton } from '@/components/ui/neon-button';
import { HolographicCard } from '@/components/ui/holographic-card';
import { Upload, FileText, Loader2, Zap, RotateCw, Shuffle, CheckCircle2, MoreHorizontal, XCircle, BrainCircuit, ScanLine, Download, ArrowLeft, ArrowRight, Dna } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from "framer-motion";

export default function FlashcardsPage() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [deckData, setDeckData] = useState(null);
    const [error, setError] = useState(null);

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
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: ['#22D3EE', '#F472B6'] });
    };

    const markAsKnown = () => {
        confetti({ particleCount: 30, spread: 40, colors: ['#2DD4BF'] });
        handleNext();
    };

    const currentCard = shuffledCards[currentIndex];

    return (
        <DashboardLayout title="Neural Uplink">
            <div className="flex flex-col h-[calc(100vh-140px)] p-4 max-w-6xl mx-auto w-full animate-in fade-in duration-1000">
                
                {/* 1. Upload Section (Visible when no deck) */}
                {!deckData && !loading && (
                    <div className="flex flex-col items-center justify-center h-full space-y-12">
                        <div className="text-center space-y-6">
                            <div className="inline-flex relative">
                                <div className="absolute inset-0 bg-nebula-purple/30 blur-2xl rounded-full animate-pulse-slow" />
                                <BrainCircuit className="h-24 w-24 text-nebula-purple relative z-10" />
                            </div>
                            <h1 className="text-5xl md:text-6xl font-heading font-black tracking-widest text-white uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                Knowledge Injection
                            </h1>
                            <p className="text-plasma-cyan font-mono text-lg max-w-lg mx-auto tracking-wide uppercase">
                                Upload source material for rapid neural synthesis.
                            </p>
                        </div>

                        <div className="w-full max-w-xl">
                             <div className="group relative flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-3xl p-12 hover:bg-white/5 hover:border-plasma-cyan transition-all cursor-pointer bg-black/40 backdrop-blur-md overflow-hidden">
                                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 mix-blend-overlay" />
                                <div className="absolute inset-0 bg-gradient-to-t from-plasma-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <label className="cursor-pointer flex flex-col items-center gap-6 w-full z-10">
                                    <div className="p-6 bg-black/50 border border-white/10 rounded-full group-hover:scale-110 group-hover:border-plasma-cyan transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                                        <Upload className="w-10 h-10 text-plasma-cyan" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-xl text-white font-heading uppercase tracking-wide">Drop Data Packet</p>
                                        <p className="text-sm text-slate-400 mt-2 font-mono">PDF Format Only</p>
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
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex items-center justify-between bg-white/5 p-4 rounded-xl border border-plasma-cyan/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2 bg-plasma-cyan/10 rounded-lg border border-plasma-cyan/20"><FileText className="w-4 h-4 text-plasma-cyan" /></div>
                                        <span className="text-sm font-bold text-white truncate font-mono">{file.name}</span>
                                    </div>
                                    <NeonButton size="sm" onClick={handleGenerate} variant="primary">
                                        <Zap className="w-4 h-4 mr-2" /> Initiate Uplink
                                    </NeonButton>
                                </motion.div>
                            )}
                            
                            {error && (
                                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-500 animate-in shake">
                                    <XCircle className="w-5 h-5"/>
                                    <span className="text-sm font-mono uppercase tracking-wide">{error}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 2. Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center h-full gap-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-nebula-purple/30 blur-3xl rounded-full animate-pulse-slow" />
                            <Loader2 className="w-20 h-20 animate-spin text-nebula-purple relative z-10" />
                        </div>
                        <div className="text-center space-y-2">
                             <h3 className="text-3xl font-black font-heading text-white uppercase tracking-widest animate-pulse">Processing Data</h3>
                             <p className="text-plasma-cyan font-mono text-sm uppercase">Synthesizing neural pathways...</p>
                        </div>
                    </div>
                )}

                {/* 3. Deck View */}
                {deckData && currentCard && (
                    <div className="flex flex-col items-center h-full max-w-4xl mx-auto w-full pt-4">
                        {/* Header Controls */}
                        <div className="flex justify-between items-center w-full mb-8 px-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-nebula-purple/10 rounded-xl border border-nebula-purple/30 shadow-[0_0_15px_rgba(109,40,217,0.3)]">
                                    <ScanLine className="w-6 h-6 text-nebula-purple" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold leading-none text-white font-heading uppercase tracking-wide">{deckData.topic || "Construct"}</h2>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="h-1.5 w-48 bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-plasma-cyan shadow-[0_0_10px_#22D3EE] transition-all duration-300" 
                                                style={{ width: `${((currentIndex + 1) / shuffledCards.length) * 100}%` }} 
                                            />
                                        </div>
                                        <p className="text-[10px] text-plasma-cyan font-mono font-bold">{currentIndex + 1} / {shuffledCards.length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={handleShuffle} className="h-10 w-10 rounded-full bg-white/5 hover:bg-plasma-cyan hover:text-black hover:scale-110 flex items-center justify-center transition-all border border-white/10">
                                    <Shuffle className="w-4 h-4" />
                                </button>
                                <button onClick={() => { setDeckData(null); setFile(null); }} className="h-10 w-10 rounded-full bg-white/5 hover:bg-red-500 hover:text-white hover:scale-110 flex items-center justify-center transition-all border border-white/10">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Flashcard Area */}
                        
                        <div className="relative w-full aspect-[1.7/1] perspective-1000 group cursor-pointer max-w-3xl" onClick={() => setIsFlipped(!isFlipped)}>
                            <motion.div 
                                className="w-full h-full relative preserve-3d transition-all duration-700"
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                {/* FRONT */}
                                <div className="absolute inset-0 backface-hidden w-full h-full">
                                    <HolographicCard className="w-full h-full flex flex-col items-center justify-center p-12 text-center border-plasma-cyan/30 hover:border-plasma-cyan/60 transition-all bg-black/60 backdrop-blur-xl">
                                        <div className="absolute top-0 right-0 p-6 opacity-20">
                                            <Dna className="w-24 h-24 text-plasma-cyan animate-pulse-slow" />
                                        </div>
                                        
                                        <span className="absolute top-8 left-8 bg-plasma-cyan/10 border border-plasma-cyan/30 text-plasma-cyan uppercase tracking-widest text-[10px] font-bold px-3 py-1 rounded">
                                            {currentCard.category || "General Data"}
                                        </span>
                                        
                                        <h3 className="text-3xl md:text-5xl font-black leading-tight text-white font-heading relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                            {currentCard.front}
                                        </h3>
                                        
                                        <div className="absolute bottom-8 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            <MoreHorizontal className="w-4 h-4 animate-pulse" /> Tap Neural Link
                                        </div>
                                    </HolographicCard>
                                </div>

                                {/* BACK */}
                                <div 
                                    className="absolute inset-0 backface-hidden w-full h-full" 
                                    style={{ transform: "rotateY(180deg)" }}
                                >
                                    <HolographicCard className="w-full h-full flex flex-col items-center justify-center p-12 text-center border-nebula-purple/30 bg-black/80 backdrop-blur-xl">
                                        <div className="absolute inset-0 bg-nebula-purple/5 opacity-50" />
                                        <div className="prose prose-invert max-w-none text-xl md:text-2xl leading-relaxed font-light text-slate-100 relative z-10">
                                            {currentCard.back}
                                        </div>
                                    </HolographicCard>
                                </div>
                            </motion.div>
                        </div>

                        {/* Footer Controls */}
                        <div className="flex items-center justify-center w-full mt-12 gap-8">
                            <NeonButton variant="ghost" size="lg" onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="w-32 rounded-full text-xs">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                            </NeonButton>

                             <button 
                                className="h-20 w-20 rounded-full bg-aurora-green/10 text-aurora-green hover:bg-aurora-green hover:text-black border-2 border-aurora-green/30 hover:border-aurora-green transition-all hover:scale-110 shadow-[0_0_30px_rgba(45,212,191,0.3)] flex items-center justify-center group"
                                onClick={(e) => { e.stopPropagation(); markAsKnown(); }}
                            >
                                <CheckCircle2 className="w-10 h-10 group-hover:scale-110 transition-transform" />
                            </button>

                            <NeonButton variant="ghost" size="lg" onClick={(e) => { e.stopPropagation(); handleNext(); }} className="w-32 rounded-full text-xs">
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                            </NeonButton>
                        </div>
                        <p className="text-center text-[10px] text-slate-500 mt-8 font-mono uppercase tracking-widest">Neural Interface Active</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
