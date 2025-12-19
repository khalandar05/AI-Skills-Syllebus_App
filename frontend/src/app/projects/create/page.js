"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'; // Assumed component based on dir list
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Code2, ArrowLeft, ArrowRight, Wand2 } from 'lucide-react';
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
        <DashboardLayout title="Create Project">
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-muted-foreground hover:text-foreground pl-0 gap-2">
                    <ArrowLeft size={16} /> Back to Projects
                </Button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">New Project</h1>
                        <p className="text-muted-foreground mt-2 text-lg">Generate AI-powered project roadmaps tailored to your goals.</p>
                    </div>
                </div>

                <Tabs defaultValue="ai" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-muted/50 p-1 border border-border/50">
                        <TabsTrigger value="ai" className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                            <Sparkles className="mr-2 h-4 w-4" /> AI Generator
                        </TabsTrigger>
                        <TabsTrigger value="manual" className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                            <Code2 className="mr-2 h-4 w-4" /> Manual Entry
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="ai" className="space-y-8">
                        <div className="grid gap-8 lg:grid-cols-5">
                            {/* Input Section */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="glass-card rounded-xl p-6 border-l-4 border-l-primary">
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <Wand2 className="w-5 h-5 text-primary" /> Project Spec
                                        </h2>
                                        <p className="text-sm text-muted-foreground mt-1">Describe what you want to build or learn.</p>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Topic / Interest</Label>
                                            <Input 
                                                placeholder="e.g. E-commerce, Crypto, Health Tech" 
                                                value={topic}
                                                onChange={(e) => setTopic(e.target.value)}
                                                className="bg-background/50 border-input focus:border-primary transition-colors h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Tech Stack (Optional)</Label>
                                            <Input 
                                                placeholder="e.g. Next.js, Python, Supabase" 
                                                value={techStack}
                                                onChange={(e) => setTechStack(e.target.value)}
                                                className="bg-background/50 border-input focus:border-primary transition-colors h-11"
                                            />
                                        </div>
                                        <Button 
                                            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/25 h-12 text-base"
                                            onClick={handleGenerate}
                                            disabled={loading || !topic}
                                        >
                                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                                            Generate Ideas
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Results Section */}
                            <div className="lg:col-span-3 space-y-4">
                                <AnimatePresence mode="wait">
                                    {generatedProjects.length === 0 && !loading && (
                                        <motion.div 
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="flex flex-col items-center justify-center h-full min-h-[400px] text-center border border-dashed border-border/50 rounded-xl bg-muted/5 p-8"
                                        >
                                            <div className="bg-primary/10 p-6 rounded-full mb-6">
                                                <Sparkles className="h-10 w-10 text-primary" />
                                            </div>
                                            <h3 className="font-bold text-xl text-foreground">Ready to Brainstorm?</h3>
                                            <p className="text-muted-foreground max-w-xs mt-2 leading-relaxed">
                                                Enter a topic on the left to generate unique, syllabus-aligned project ideas with complete roadmaps.
                                            </p>
                                        </motion.div>
                                    )}

                                    {loading && (
                                        <motion.div 
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="flex flex-col items-center justify-center h-full min-h-[400px]"
                                        >
                                            <Loader2 className="h-12 w-12 animate-spin text-primary mb-6" />
                                            <h3 className="text-lg font-medium animate-pulse">Designing your projects...</h3>
                                            <p className="text-sm text-muted-foreground mt-2">Analyzing requirements & creating roadmaps</p>
                                        </motion.div>
                                    )}

                                    {generatedProjects.length > 0 && !loading && (
                                        <div className="grid gap-4">
                                            <h3 className="text-lg font-semibold px-1">Generated Concepts</h3>
                                            {generatedProjects.map((proj, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                >
                                                    <div 
                                                        className="glass-card rounded-xl p-5 border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer group relative overflow-hidden"
                                                        onClick={() => handleSaveGenerated(proj)}
                                                    >
                                                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        
                                                        <div className="flex justify-between items-start mb-2 pl-2">
                                                            <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{proj.title}</h4>
                                                            <Badge variant={proj.difficulty === 'Advanced' ? "destructive" : "secondary"} className="bg-secondary/50">{proj.difficulty || 'Intermediate'}</Badge>
                                                        </div>
                                                        
                                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 pl-2 font-medium leading-relaxed">
                                                            {proj.description}
                                                        </p>
                                                        
                                                        <div className="flex items-center justify-between pl-2 mt-4">
                                                             <div className="flex gap-2 flex-wrap">
                                                                {(Array.isArray(proj.techStack) ? proj.techStack : proj.techStack?.split(',') || []).map((t, k) => (
                                                                    <span key={k} className="text-[10px] bg-secondary/50 px-2 py-1 rounded border border-border/50 text-muted-foreground">{t}</span>
                                                                ))}
                                                            </div>
                                                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 -mr-2">
                                                                Select <ArrowRight className="ml-1.5 h-4 w-4" />
                                                            </Button>
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
                            <div className="glass-card rounded-xl p-8 border border-border/50">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold">Manual Entry</h2>
                                    <p className="text-sm text-muted-foreground">Already have a project? Add it to your portfolio manually.</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Project Title</Label>
                                            <Input value={manualData.title} onChange={e => setManualData({...manualData, title: e.target.value})} className="bg-background/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tech Stack</Label>
                                            <Input value={manualData.techStack} onChange={e => setManualData({...manualData, techStack: e.target.value})} placeholder="React, Node.js" className="bg-background/50" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea value={manualData.description} onChange={e => setManualData({...manualData, description: e.target.value})} rows={4} className="bg-background/50 resize-none" />
                                    </div>
                                    <Button className="w-full bg-primary" onClick={handleSaveManual} disabled={loading || !manualData.title}>
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Project
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
