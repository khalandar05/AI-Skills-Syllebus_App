"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NeonButton } from '@/components/ui/neon-button';
import { HolographicCard } from '@/components/ui/holographic-card';
import { Input } from '@/components/ui/input'; // We might need to style this or replace it
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'; 
import { Loader2, Sparkles, Code2, ArrowLeft, ArrowRight, Wand2, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/dash-layout';

export default function CreateProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [generatedProjects, setGeneratedProjects] = useState([]);
    
    // AI Form State
    const [topic, setTopic] = useState('');
    const [techStack, setTechStack] = useState('');
    
    // Manual Form State
    const [manualData, setManualData] = useState({
        title: '', description: '', techStack: '', difficulty: 'Intermediate', projectType: 'Personal'
    });

    const handleGenerate = async () => {
        if (!topic) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('syllabus_auth_token');
            const res = await fetch('/api/projects/generate', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ topic, techStack: techStack.split(',').map(s=>s.trim()).filter(Boolean) })
            });
            const data = await res.json();
            if (data.success && data.projects) {
                setGeneratedProjects(data.projects);
            } else {
                alert(data.error || "Failed to generate ideas");
            }
        } catch (e) {
            console.error(e);
            alert("Error generating projects");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGenerated = async (project) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('syllabus_auth_token');
            const payload = {
                title: project.title,
                description: project.description,
                techStack: project.techStack, 
                difficulty: project.difficulty || 'Intermediate',
                projectType: 'Personal',
                roadmap: project.roadmap 
            };

            const res = await fetch('/api/projects/create', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                router.push(`/projects/${data.project.id}?id=${data.project.id}&title=${encodeURIComponent(data.project.title)}`); 
            } else {
                alert(data.error || "Failed to save project");
            }
        } catch (e) {
            alert("Failed to save project");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveManual = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('syllabus_auth_token');
            const res = await fetch('/api/projects/create', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(manualData)
            });
            const data = await res.json();
            if (data.success) {
                router.push('/projects');
            } else {
                alert(data.error);
            }
        } catch (e) {
             alert("Error saving project");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Initialize Mission">
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <NeonButton variant="ghost" onClick={() => router.back()} className="mb-4 pl-0 gap-2 text-slate-400 hover:text-white">
                    <ArrowLeft size={16} /> Abort & Return to Log
                </NeonButton>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-heading font-bold tracking-tight text-white uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">New Mission Protocol</h1>
                        <p className="text-slate-400 mt-2 text-lg">Give idea for implenting project i will give you the guidance of it</p>
                    </div>
                </div>

                <Tabs defaultValue="ai" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-black/40 p-1 border border-white/10 backdrop-blur-md rounded-xl">
                        <TabsTrigger value="ai" className="data-[state=active]:bg-plasma-cyan/20 data-[state=active]:text-plasma-cyan font-bold tracking-wide transition-all rounded-lg uppercase text-xs h-9">
                            <Sparkles className="mr-2 h-4 w-4" /> AI Generator
                        </TabsTrigger>
                        <TabsTrigger value="manual" className="data-[state=active]:bg-white/10 data-[state=active]:text-white font-bold tracking-wide transition-all rounded-lg uppercase text-xs h-9">
                            <Code2 className="mr-2 h-4 w-4" /> Manual Entry
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="ai" className="space-y-8">
                        <div className="grid gap-8 lg:grid-cols-5">
                            {/* Input Section */}
                            <div className="lg:col-span-2 space-y-6">
                                <HolographicCard className="rounded-xl p-6 border-l-4 border-l-plasma-cyan">
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold flex items-center gap-2 text-white font-heading uppercase">
                                            <Wand2 className="w-5 h-5 text-plasma-cyan" /> Mission Spec
                                        </h2>
                                        <p className="text-xs text-slate-400 mt-1 font-mono">Define parameters for generation.</p>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Topic / Domain</Label>
                                            <Input 
                                                placeholder="e.g. Orbital Mechanics, React.js" 
                                                value={topic}
                                                onChange={(e) => setTopic(e.target.value)}
                                                className="bg-black/30 border-white/10 focus:border-plasma-cyan/50 text-white placeholder-slate-600 h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Tech Stack (Optional)</Label>
                                            <Input 
                                                placeholder="e.g. Next.js, Python" 
                                                value={techStack}
                                                onChange={(e) => setTechStack(e.target.value)}
                                                className="bg-black/30 border-white/10 focus:border-plasma-cyan/50 text-white placeholder-slate-600 h-12"
                                            />
                                        </div>
                                        <NeonButton 
                                            className="w-full h-12 text-base font-bold"
                                            onClick={handleGenerate}
                                            disabled={loading || !topic}
                                            variant="primary"
                                        >
                                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Rocket className="mr-2 h-5 w-5" />}
                                            Generate Concepts
                                        </NeonButton>
                                    </div>
                                </HolographicCard>
                            </div>

                            {/* Results Section */}
                            <div className="lg:col-span-3 space-y-4">
                                <AnimatePresence mode="wait">
                                    {generatedProjects.length === 0 && !loading && (
                                        <motion.div 
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="flex flex-col items-center justify-center h-full min-h-[400px] text-center border-2 border-dashed border-white/5 rounded-xl bg-white/5 p-8"
                                        >
                                            <div className="bg-white/5 p-6 rounded-full mb-6 relative">
                                                <div className="absolute inset-0 bg-plasma-cyan/20 blur-xl rounded-full" />
                                                <Sparkles className="h-10 w-10 text-plasma-cyan relative z-10" />
                                            </div>
                                            <h3 className="font-heading font-bold text-xl text-white uppercase tracking-wider">Awaiting Input</h3>
                                            <p className="text-slate-400 max-w-xs mt-2 leading-relaxed font-mono text-sm">
                                                Enter mission parameters to generate skill-aligned project roadmaps.
                                            </p>
                                        </motion.div>
                                    )}

                                    {loading && (
                                        <motion.div 
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="flex flex-col items-center justify-center h-full min-h-[400px]"
                                        >
                                            <Loader2 className="h-16 w-16 animate-spin text-plasma-cyan mb-6" />
                                            <h3 className="text-lg font-bold text-white uppercase tracking-widest animate-pulse">Computing Trajectories...</h3>
                                            <p className="text-xs text-slate-500 mt-2 font-mono">Analyzing vectors & compiling roadmaps</p>
                                        </motion.div>
                                    )}

                                    {generatedProjects.length > 0 && !loading && (
                                        <div className="grid gap-4">
                                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Calculated Trajectories</h3>
                                            {generatedProjects.map((proj, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                >
                                                    <div 
                                                        className="glass-panel rounded-xl p-6 hover:bg-white/5 cursor-pointer group relative overflow-hidden transition-all border border-white/5 hover:border-plasma-cyan/30"
                                                        onClick={() => handleSaveGenerated(proj)}
                                                    >
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-plasma-cyan to-nebula-purple opacity-50 group-hover:opacity-100 transition-opacity" />
                                                        
                                                        <div className="flex justify-between items-start mb-2 pl-4">
                                                            <h4 className="font-bold text-lg text-white group-hover:text-plasma-cyan transition-colors font-heading tracking-wide uppercase">{proj.title}</h4>
                                                            <span className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded text-plasma-cyan border border-white/10 uppercase">{proj.difficulty || 'Intermediate'}</span>
                                                        </div>
                                                        
                                                        <p className="text-sm text-slate-400 line-clamp-2 mb-4 pl-4 font-mono leading-relaxed">
                                                            {proj.description}
                                                        </p>
                                                        
                                                        <div className="flex items-center justify-between pl-4 mt-4">
                                                             <div className="flex gap-2 flex-wrap">
                                                                {(Array.isArray(proj.techStack) ? proj.techStack : proj.techStack?.split(',') || []).map((t, k) => (
                                                                    <span key={k} className="text-[10px] bg-black/30 px-2 py-1 rounded border border-white/10 text-slate-400">{t}</span>
                                                                ))}
                                                            </div>
                                                            <NeonButton variant="ghost" className="text-xs text-plasma-cyan hover:text-white h-auto py-1">
                                                                Initialize Mission <ArrowRight className="ml-1.5 h-3 w-3" />
                                                            </NeonButton>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="manual">
                         <div className="max-w-2xl mx-auto">
                            <HolographicCard className="p-8 border border-white/10">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-white font-heading uppercase">Manual Override</h2>
                                    <p className="text-sm text-slate-400 font-mono">Manually input mission parameters.</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Mission Title</Label>
                                            <Input value={manualData.title} onChange={e => setManualData({...manualData, title: e.target.value})} className="bg-black/30 border-white/10 text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Tech Stack</Label>
                                            <Input value={manualData.techStack} onChange={e => setManualData({...manualData, techStack: e.target.value})} placeholder="React, Node.js" className="bg-black/30 border-white/10 text-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Description</Label>
                                        <Textarea value={manualData.description} onChange={e => setManualData({...manualData, description: e.target.value})} rows={4} className="bg-black/30 border-white/10 text-white resize-none" />
                                    </div>
                                    <NeonButton className="w-full" onClick={handleSaveManual} disabled={loading || !manualData.title} variant="primary">
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save to Log
                                    </NeonButton>
                                </div>
                            </HolographicCard>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
