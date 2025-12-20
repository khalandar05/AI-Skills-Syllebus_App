"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Brain, Rocket, Code2, Cpu, BookOpen, Target, FileText, Play } from "lucide-react";
import SceneCanvas from "@/components/ui/SceneCanvas";
import HeroScene from "@/components/landing/HeroScene";
import { NeonButton } from "@/components/ui/neon-button";

// Pre-defined animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.1, ease: "easeOut" }
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function LandingPage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);

  return (
    <main className="relative min-h-screen bg-neutral-950 text-white overflow-x-hidden selection:bg-violet-500/30">
      {/* 3D Background Layer - Fixed */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <SceneCanvas className="w-full h-full">
          <HeroScene />
        </SceneCanvas>
        {/* Overlay gradient for text readability - CRITICAL for user request */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/30 via-[#0A0A0A]/60 to-[#0A0A0A] z-[1]" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
        
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/20">
                <Brain className="w-6 h-6" />
              </div>
              <span className="font-bold text-xl tracking-tight">NexusAI</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                Log in
              </Link>
              <Link href="/auth/register">
                <NeonButton variant="primary" size="sm" glowColor="violet">
                  Get Started
                </NeonButton>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-24 px-6">
          <div className="max-w-5xl mx-auto text-center relative z-20">
            
            <motion.div 
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 backdrop-blur-md mb-8"
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-semibold text-violet-300 uppercase tracking-wider">AI-Powered Learning Revolution</span>
            </motion.div>

            <motion.h1 
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[1.1] drop-shadow-2xl"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-neutral-400">
                Transform Your
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400">
                Course into Skills
              </span>
            </motion.h1>

            <motion.p 
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
            >
              Upload your course material. Get an instant, AI-generated roadmap of projects, 
              skills, and resume boosters. Stop studying blindly. Start building.
            </motion.p>

            <motion.div 
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link href="/dashboard">
                <NeonButton variant="primary" size="lg" glowColor="violet" className="px-8 min-w-[200px] h-14 text-lg">
                  Start Building <ArrowRight className="w-5 h-5 ml-2" />
                </NeonButton>
              </Link>
              
              <button className="h-14 px-8 rounded-full border border-white/10 bg-white/5 text-white font-medium hover:bg-white/10 transition-all flex items-center gap-2 min-w-[200px] justify-center backdrop-blur-sm">
                <Play className="w-5 h-5 fill-current" /> Watch Demo
              </button>
            </motion.div>

            {/* Floating UI Elements Mockup */}
             <motion.div 
              style={{ y: y1, opacity: 0.8 }}
              className="absolute -left-32 top-1/2 hidden xl:block pointer-events-none"
            >
               <GlassCard icon={<Code2 className="text-blue-400" />} title="Smart Generator" subtitle="+15 Projects Created" />
            </motion.div>
             <motion.div 
              style={{ y: y2, opacity: 0.8 }}
              className="absolute -right-32 top-1/3 hidden xl:block pointer-events-none"
            >
              <GlassCard icon={<Cpu className="text-emerald-400" />} title="Skill Analysis" subtitle="98% Match Rate" />
            </motion.div>

          </div>
        </section>

        {/* Feature Grid with Glassmorphism */}
        <section className="py-32 px-6 relative" id="features">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">Everything you need to grow</h2>
               <p className="text-neutral-400 text-lg">From theory to hired in record time.</p>
            </div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <FeatureCard 
                icon={<BookOpen className="w-8 h-8 text-indigo-400" />}
                title="Skill Extractor"
                description="Drop your course material. We extract every topic, subtopic, and learning outcome instantly."
                delay={0}
              />
              <FeatureCard 
                icon={<Target className="w-8 h-8 text-violet-400" />}
                title="Project Generator"
                description="Turn theory into practice. Get 3-5 custom project ideas based on your exact curriculum."
                delay={0.1}
              />
              <FeatureCard 
                icon={<FileText className="w-8 h-8 text-fuchsia-400" />}
                title="Resume Builder"
                description="Auto-generate bullet points for your resume based on the projects you build."
                delay={0.2}
              />
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}

// Sub-components for cleaner file
function FeatureCard({ icon, title, description, delay }) {
  return (
    <motion.div 
      variants={fadeUp}
      className="group p-8 rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.08] transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/5 shadow-inner relative z-10 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4 text-white relative z-10">{title}</h3>
      <p className="text-neutral-400 leading-relaxed relative z-10 group-hover:text-neutral-300 transition-colors">
        {description}
      </p>
    </motion.div>
  );
}

function GlassCard({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-4 p-4 pr-8 rounded-2xl border border-white/10 bg-neutral-900/40 backdrop-blur-xl shadow-2xl">
      <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center border border-white/5">
        {icon}
      </div>
      <div className="text-left">
        <p className="text-sm font-medium text-neutral-400">{title}</p>
        <p className="text-lg font-bold text-white">{subtitle}</p>
      </div>
    </div>
  );
}
