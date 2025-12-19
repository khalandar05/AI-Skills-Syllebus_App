"use client"

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'next/link';
import { DashboardLayout } from '@/components/dash-layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Plus, Trash2, Github, ExternalLink, Calendar, Code2, ArrowUpRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function ProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('syllabus_auth_token');
            const res = await fetch('/api/projects', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setProjects(data.projects);
            } else {
                setError(data.error);
            }
        } catch (e) {
            setError("Failed to load projects.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProjects(); }, []);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        try {
            const token = localStorage.getItem('syllabus_auth_token');
            const res = await fetch(`/api/projects/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setProjects(projects.filter(p => p.id !== id));
            }
        } catch (e) {
            alert("Failed to delete project");
        }
    };

    return (
        <DashboardLayout title="My Projects">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                
                {/* Header Card */}
                <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-8 shadow-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Code2 className="h-40 w-40 text-primary" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground flex items-center gap-2">
                                <Sparkles className="h-6 w-6 text-primary" />
                                Projects Library
                            </h1>
                            <p className="text-muted-foreground mt-2 text-lg">
                                Manage your AI-generated roadmap and portfolio projects.
                            </p>
                        </div>
                        <Button onClick={() => router.push('/projects/create')} size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                            <Plus className="mr-2 h-5 w-5" /> Create New Project
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="mt-4 text-muted-foreground font-medium animate-pulse">Loading your portfolio...</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence>
                            {projects.map((project, idx) => (
                                <motion.div
                                    key={project.id || idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                >
                                    <Card
                                        className="h-full cursor-pointer hover:border-primary/50 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                                        onClick={() => router.push(`/projects/${project.id}?id=${project.id}&title=${encodeURIComponent(project.title)}&description=${encodeURIComponent(project.description)}&techStack=${encodeURIComponent(Array.isArray(project.techStack) ? (project.techStack.join ? project.techStack.join(',') : project.techStack) : project.techStack)}&roadmap=${encodeURIComponent(typeof project.roadmap === 'string' ? project.roadmap : JSON.stringify(project.roadmap || []))}`)}
                                    >
                                        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-purple-500 to-accent opacity-70 group-hover:opacity-100 transition-opacity" />
                                        
                                        <CardContent className="p-6 flex flex-col h-full">
                                            <div className="flex justify-between items-start mb-4">
                                                <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-semibold tracking-wide">
                                                    {project.projectType || "PROJECT"}
                                                </Badge>
                                                
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity" 
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            
                                            <h3 className="text-xl font-heading font-bold line-clamp-1 group-hover:text-primary transition-colors mb-2">
                                                {project.title}
                                            </h3>
                                            
                                            <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1 leading-relaxed">
                                                {project.description}
                                            </p>
                                            
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {(Array.isArray(project.techStack) ? project.techStack : String(project.techStack).split(',')).slice(0, 3).map((t, i) => (
                                                    <Badge key={i} variant="secondary" className="px-2.5 py-1 text-[10px] font-medium bg-secondary text-secondary-foreground border border-border/50">
                                                        {t.trim()}
                                                    </Badge>
                                                ))}
                                                {(Array.isArray(project.techStack) ? project.techStack.length : String(project.techStack).split(',').length) > 3 && (
                                                    <span className="text-[10px] text-muted-foreground self-center font-medium">+More</span>
                                                )}
                                            </div>
                                            
                                            <div className="pt-4 border-t border-border/40 flex items-center justify-between mt-auto">
                                                <div className="flex gap-4">
                                                    {project.repoLink && (
                                                        <a href={project.repoLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-xs flex items-center text-muted-foreground hover:text-primary transition-colors font-medium">
                                                            <Github className="mr-1.5 h-3.5 w-3.5" /> Code
                                                        </a>
                                                    )}
                                                    {project.liveDemoLink && (
                                                        <a href={project.liveDemoLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-xs flex items-center text-muted-foreground hover:text-primary transition-colors font-medium">
                                                            <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Demo
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="flex items-center text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                    View Details <ArrowUpRight className="ml-1 h-3 w-3" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        
                        {projects.length === 0 && !loading && (
                             <div className="col-span-full flex flex-col items-center justify-center p-16 border-2 border-dashed border-border/60 rounded-2xl bg-muted/5 text-center animate-in fade-in zoom-in duration-500">
                                <div className="bg-background p-6 rounded-full shadow-sm mb-6">
                                    <Code2 className="h-12 w-12 text-muted-foreground/60" />
                                </div>
                                <h3 className="font-heading font-bold text-2xl mb-2">No projects created yet</h3>
                                <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                                    Start your journey by generating your first AI-powered project roadmap tailored to your syllabus.
                                </p>
                                <Button onClick={() => router.push('/projects/create')} size="lg" className="shadow-xl shadow-primary/20 h-12 px-8 text-base">
                                    Create First Project
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
