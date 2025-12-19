"use client"

import Link from 'next/link';
import { NeonButton } from '@/components/ui/neon-button';
import { HolographicCard } from '@/components/ui/holographic-card';
import { BookOpen, Code2, FileText, ArrowRight, Sparkles, BrainCircuit, Rocket, ChevronRight, Globe, Zap, Database, ShieldCheck, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col font-sans overflow-x-hidden selection:bg-plasma-cyan/30 relative z-10">
      
      {/* Navbar - Glass HUD */}
      <nav className="fixed top-0 inset-x-0 z-50 h-20 border-b border-white/5 bg-space-black/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-full flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight font-heading uppercase">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-plasma-cyan to-cosmic-indigo shadow-[0_0_15px_rgba(34,211,238,0.4)] animate-pulse">
                <Rocket className="h-5 w-5 text-white transform -rotate-45" />
            </div>
            <span className="text-white tracking-widest">Career<span className="text-plasma-cyan">Forge</span> AI</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/auth/login">
              <ButtonWrapper variant="ghost" className="text-slate-400 hover:text-white font-medium hover:bg-white/5 uppercase tracking-widest text-xs">Login Sequence</ButtonWrapper>
            </Link>
            <Link href="/auth/register">
              <NeonButton variant="cyan" className="shadow-[0_0_20px_rgba(34,211,238,0.3)] px-8 font-bold h-10">
                Initialize <ChevronRight className="ml-1 h-4 w-4" />
              </NeonButton>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-20 relative z-10">
        {/* Hero Section */}
        <section className="relative pt-32 pb-40 lg:pt-48 overflow-hidden">
           {/* Animated Glow Behind Head */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cosmic-indigo/20 rounded-full blur-[120px] animate-pulse-glow -z-10" />

          <div className="container mx-auto px-6 text-center max-w-6xl space-y-10 relative z-10">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center rounded-full border border-plasma-cyan/30 bg-plasma-cyan/10 px-6 py-2 text-sm font-medium text-plasma-cyan shadow-[0_0_15px_rgba(34,211,238,0.15)] backdrop-blur-md"
            >
               <span className="flex h-2 w-2 rounded-full bg-plasma-cyan mr-2 animate-pulse shadow-[0_0_10px_#22D3EE]"></span> 
               <span className="uppercase tracking-[0.2em] text-xs font-mono">System Online: V2.0 Live</span>
            </motion.div>

            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-none font-heading uppercase drop-shadow-[0_0_25px_rgba(255,255,255,0.1)]"
            >
              Accelerate Your <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-plasma-cyan via-white to-nebula-purple animate-gradient-x">Trajectory</span>
            </motion.h1>
            
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light border-l-2 border-plasma-cyan/20 pl-6"
            >
              Parse syllabus telemetry. Generate mission-critical roadmaps. Deploy your career.
              The advanced AI guidance system for engineering pilots.
            </motion.p>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row justify-center gap-6 pt-8"
            >
              <Link href="/auth/register">
                <NeonButton size="lg" className="h-16 px-12 text-lg rounded-xl">
                  <Rocket className="mr-3 h-6 w-6" /> LAUNCH CONSOLE
                </NeonButton>
              </Link>
            </motion.div>
            
            {/* Dashboard Preview - Holographic Tilt */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                transition={{ duration: 1, delay: 0.5, type: "spring" }}
                className="mt-32 relative mx-auto max-w-6xl"
            >
                <div className="absolute inset-0 bg-gradient-to-t from-plasma-cyan/10 to-transparent blur-3xl -z-10" />
                <HolographicCard className="shadow-2xl overflow-hidden relative group border-white/10 bg-space-black/60 p-0">
                   {/* HUD Header */}
                   <div className="h-12 bg-black/40 border-b border-white/5 flex items-center px-4 justify-between">
                       <div className="flex gap-2">
                           <div className="w-3 h-3 rounded-full bg-slate-700" />
                           <div className="w-3 h-3 rounded-full bg-slate-700" />
                           <div className="w-3 h-3 rounded-full bg-slate-700" />
                       </div>
                       <div className="text-xs font-mono text-plasma-cyan/50 uppercase tracking-widest flex items-center gap-2">
                           <Zap className="h-3 w-3 animate-pulse" /> Secure Connection // ENCRYPTED
                       </div>
                   </div>
                   {/* Mock UI Content */}
                   <div className="p-8 grid gap-8 md:grid-cols-4 bg-transparent min-h-[400px]">
                       {/* Sidebar Mock */}
                       <div className="hidden md:flex flex-col gap-4 border-r border-white/5 pr-8">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="h-12 rounded-xl bg-white/5 w-full border border-white/5" />
                            ))}
                       </div>
                       {/* Main Content Mock */}
                       <div className="md:col-span-3 grid grid-cols-2 gap-6">
                            <div className="col-span-2 h-40 rounded-2xl bg-gradient-to-r from-cosmic-indigo/40 to-plasma-cyan/20 border border-white/5 flex items-center p-8 relative overflow-hidden">
                                <div className="absolute right-0 top-0 p-4 opacity-20">
                                    <Sparkles className="h-24 w-24 text-white" />
                                </div>
                                <div className="space-y-4 w-full relative z-10">
                                    <div className="h-6 w-1/3 bg-white/10 rounded-lg backdrop-blur-sm" />
                                    <div className="h-4 w-1/2 bg-white/5 rounded-lg backdrop-blur-sm" />
                                </div>
                            </div>
                            <div className="h-56 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm" />
                            <div className="h-56 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm" />
                       </div>
                   </div>
                   
                   {/* Scanline Overlay */}
                   <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
                </HolographicCard>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-32 relative">
             <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: Database, title: "Syllabus Telemetry", desc: "Ingest PDF data. Extract core vectors. Quantify learning outcomes.", color: "text-plasma-cyan" },
                        { icon: BrainCircuit, title: "Neural Architect", desc: "Generate 3 unique project schematics tailored to your skill matrix.", color: "text-nebula-purple" },
                        { icon: ShieldCheck, title: "Career Defense", desc: "Auto-compile resume assets. Fortify your professional profile.", color: "text-aurora-green" }
                    ].map((feature, i) => (
                        <motion.div 
                            key={i}
                            whileHover={{ y: -10 }}
                        >
                            <HolographicCard className="p-8 h-full bg-space-black/40">
                                <div className={`h-16 w-16 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
                                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4 font-heading tracking-wide uppercase">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed font-light">
                                    {feature.desc}
                                </p>
                            </HolographicCard>
                        </motion.div>
                    ))}
                </div>
             </div>
        </section>
      </main>
      
      <footer className="border-t border-white/10 py-12 bg-black/80 backdrop-blur-md text-center relative z-10">
        <div className="container mx-auto px-6 items-center flex flex-col">
             <div className="flex items-center gap-2 font-bold text-xl text-white mb-6 opacity-50 uppercase tracking-widest">
                 <Rocket className="h-5 w-5" /> CareerForge AI
            </div>
            <p className="text-sm text-slate-600 mb-8 max-w-sm">
                Engineering the next generation of pilots.
            </p>
            <p className="text-xs text-slate-700 font-mono">SYSTEM ID: CF-AI-2024 // ALL RIGHTS RESERVED</p>
        </div>
      </footer>
    </div>
  );
}

// Simple wrapper for button styles if NeonButton isn't appropriate
function ButtonWrapper({ className, children, ...props }) {
    return <div className={`cursor-pointer px-4 py-2 ${className}`} {...props}>{children}</div>
}
