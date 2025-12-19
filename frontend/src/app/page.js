"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BookOpen, Code2, FileText, ArrowRight, Sparkles, BrainCircuit, Layers, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground flex flex-col font-sans overflow-x-hidden selection:bg-indigo-500/30">
      
      {/* Navbar - Premium Glass */}
      <nav className="fixed top-0 inset-x-0 z-50 h-16 border-b border-white/10 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl transition-all">
        <div className="container mx-auto px-6 h-full flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight font-heading">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-md shadow-indigo-500/20">
                <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-slate-900 dark:text-white">CareerForge AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">Log in</Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 rounded-full px-6 font-bold h-10 transition-transform hover:scale-105">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 lg:pt-32 overflow-hidden">
           {/* Background Effects */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-slate-100/0 to-transparent pointer-events-none -z-10 dark:from-indigo-900/20" />
           <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

          <div className="container mx-auto px-6 text-center max-w-5xl space-y-8 relative z-10">
            <div className="inline-flex items-center rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 text-sm font-medium text-indigo-700 dark:text-indigo-300 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span> v2.0 Student Edition
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 font-heading">
              Turn your syllabus into <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x">real-world portfolio projects</span>.
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Stop building generic to-do apps. Our AI extracts core concepts from your course PDF and generates industry-grade project architectures, roadmaps, and resume points.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <Link href="/auth/register">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-indigo-500/30 bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all hover:-translate-y-1">
                  Start Building Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            {/* Valid Dashboard Preview Mockup */}
            <div className="mt-20 relative mx-auto max-w-5xl animate-in fade-in zoom-in duration-1000 delay-500">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden relative group">
                   {/* Chrome-like Header */}
                   <div className="h-10 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-2">
                       <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                       <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                       <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                   </div>
                   {/* Mock UI Content */}
                   <div className="p-8 grid gap-8 md:grid-cols-4 bg-slate-50/50 dark:bg-slate-950/50">
                       <div className="h-48 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between hover:border-indigo-500/50 transition-colors">
                            <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600"><Code2 /></div>
                            <div className="space-y-2">
                                <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800 rounded" />
                                <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" />
                            </div>
                       </div>
                       <div className="md:col-span-3 h-48 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex items-center justify-center border-dashed">
                            <div className="text-center space-y-2">
                                <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
                                <p className="text-sm font-medium text-slate-500">AI Project Generator Active</p>
                            </div>
                       </div>
                   </div>
                   {/* Overlay */}
                   <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent dark:from-slate-950/80 pointer-events-none" />
                </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 bg-slate-50 dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800/50 relative">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />
            
          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <Card className="premium-card p-2 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">Syllabus Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
                Drag & drop your PDF course syllabus. We parse complex topics, learning outcomes, and weekly schedules to structure your roadmap.
              </CardContent>
            </Card>
            
            <Card className="premium-card p-2 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 group">
              <CardHeader>
                 <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BrainCircuit className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">Project Architect</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
                Get 3 unique, portfolio-ready project ideas. Includes tech stack, architectural diagrams, and step-by-step implementation guides.
              </CardContent>
            </Card>
            
            <Card className="premium-card p-2 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 group">
              <CardHeader>
                 <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">Resume Engine</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
                Auto-generate STAR-method bullet points for your resume based on the projects you build, highlighting specific skills like React, Node.js, or AI.
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white mb-6">
                 <div className="p-1.5 bg-indigo-600 rounded-lg">
                    <Sparkles className="h-4 w-4 text-white" />
                </div>
                CareerForge AI
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
                Empowering engineering students to bridge the gap between academic theory and industry reality.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-600">&copy; {new Date().getFullYear()} CareerForge AI Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
