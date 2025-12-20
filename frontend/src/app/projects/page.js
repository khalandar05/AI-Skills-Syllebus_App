"use client"

import { useEffect, useState, useRef } from 'react';
import { NeonButton } from '@/components/ui/neon-button';
import { DashboardLayout } from '@/components/dash-layout';
import { HolographicCard } from '@/components/ui/holographic-card';
import { Loader2, Plus, Trash2, Code2, Sparkles, FolderGit2, Rocket, ArrowRight, Layers, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import SceneCanvas from '@/components/ui/SceneCanvas';
import HeroScene from '@/components/landing/HeroScene';

export default function ProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const canvasRef = useRef(null);

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

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Stop click from triggering card navigation
        if (!confirm("Confirm project deletion? This action is irreversible.")) return;
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
        <DashboardLayout title="Mission Log">
            <div ref={canvasRef} className="relative w-full h-full min-h-screen">
                {/* Background Scene - Kept for ambience but fixed to back */}
                <SceneCanvas 
                   eventSource={canvasRef} 
                   className="fixed inset-0 pointer-events-none z-0" 
                   style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none' }}
                >
                    <HeroScene />
                </SceneCanvas>

                <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-800 relative z-10 pb-20">
                    
                    {/* Header Card */}
                    <HolographicCard className="p-8 relative overflow-hidden group border-plasma-cyan/20">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                 <div className="flex items-center gap-2 mb-2">
                                    <Code2 className="h-5 w-5 text-plasma-cyan" />
                                    <span className="text-xs font-mono text-plasma-cyan tracking-widest uppercase">Development Sector</span>
                                </div>
                                <h1 className="text-3xl font-heading font-bold tracking-tight text-white flex items-center gap-3">
                                    Active Missions
                                </h1>
                                <p className="text-slate-400 mt-2 text-lg max-w-2xl font-light">
                                    Manage your AI-generated roadmaps and deployed portfolios.
                                </p>
                            </div>
                            <NeonButton onClick={() => router.push('/projects/create')} size="lg" variant="primary">
                                <Plus className="mr-2 h-5 w-5" /> Initialize Project
                            </NeonButton>
                        </div>
                    </HolographicCard>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <Loader2 className="h-12 w-12 animate-spin text-plasma-cyan" />
                            <p className="mt-4 text-plasma-cyan font-mono text-xs uppercase tracking-widest animate-pulse">Retrieving Mission Data...</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <AnimatePresence>
                                {projects.map((project, idx) => (
                                    <ProjectCard 
                                        key={project.id || idx} 
                                        project={project} 
                                        idx={idx} 
                                        router={router} 
                                        handleDelete={handleDelete} 
                                    />
                                ))}
                            </AnimatePresence>
                            
                            {projects.length === 0 && !loading && (
                                 <HolographicCard className="col-span-full flex flex-col items-center justify-center p-20 text-center animate-in fade-in zoom-in duration-500">
                                    <div className="bg-white/5 p-6 rounded-full mb-6 border border-white/5">
                                        <FolderGit2 className="h-12 w-12 text-slate-500" />
                                    </div>
                                    <h3 className="font-heading font-bold text-2xl mb-2 text-white">No active missions found</h3>
                                    <p className="text-slate-400 mb-8 max-w-md mx-auto text-lg">
                                        Start your journey by generating your first AI-powered project roadmap tailored to your syllabus.
                                    </p>
                                    <NeonButton onClick={() => router.push('/projects/create')} size="lg">
                                        <Rocket className="mr-2 h-5 w-5" /> Launch First Mission
                                    </NeonButton>
                                </HolographicCard>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

function ProjectCard({ project, idx, router, handleDelete }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            onClick={() => router.push(`/projects/${project.id}?id=${project.id}&title=${encodeURIComponent(project.title)}`)}
            className="cursor-pointer group h-full"
        >
            <HolographicCard className="h-full flex flex-col p-6 hover:border-plasma-cyan/50 transition-all duration-300 relative overflow-hidden">
                {/* Decorative Background Gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-plasma-cyan/5 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-50 group-hover:opacity-100" />
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:scale-110 transition-transform duration-300">
                       <Cpu className="h-6 w-6 text-plasma-cyan" />
                    </div>
                    <button 
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors z-20"
                        onClick={(e) => handleDelete(e, project.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 relative z-10">
                    <div className="mb-2">
                         <span className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded text-plasma-cyan border border-white/10 uppercase tracking-wider">
                            {project.projectType || 'Mission'}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-plasma-cyan transition-colors line-clamp-2">
                        {project.title}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-3 mb-4 font-mono leading-relaxed">
                        {project.description || "No description provided."}
                    </p>
                </div>

                <div className="mt-auto relative z-10 pt-4 border-t border-white/5 flex flex-col gap-4">
                     {/* Tech Stack Tags */}
                     <div className="flex flex-wrap gap-2">
                        {(Array.isArray(project.techStack) ? project.techStack : String(project.techStack || '').split(',')).slice(0, 3).map((t, i) => (
                            <span key={i} className="px-2 py-1 text-[10px] bg-black/30 text-slate-300 border border-white/10 rounded-md">
                                {t.trim()}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-plasma-cyan/80 group-hover:text-plasma-cyan transition-colors">
                        <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" /> 
                            {project.roadmap?.length || 0} Modules
                        </span>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </HolographicCard>
        </motion.div>
    );
}
