"use client"

import { useEffect, useState } from 'react';
import { NeonButton } from '@/components/ui/neon-button';
import { DashboardLayout } from '@/components/dash-layout';
import { HolographicCard } from '@/components/ui/holographic-card';
import { Loader2, Plus, Trash2, Github, ExternalLink, Code2, ArrowUpRight, Sparkles, FolderGit2, Rocket } from 'lucide-react';
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
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-800">
                
                {/* Header Card */}
                <HolographicCard className="p-8 relative overflow-hidden group">
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
                                <motion.div
                                    key={project.id || idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                >
                                    <HolographicCard
                                        className="h-full cursor-pointer p-0 group"
                                        onClick={() => router.push(`/projects/${project.id}?id=${project.id}&title=${encodeURIComponent(project.title)}&description=${encodeURIComponent(project.description)}&techStack=${encodeURIComponent(Array.isArray(project.techStack) ? (project.techStack.join ? project.techStack.join(',') : project.techStack) : project.techStack)}&roadmap=${encodeURIComponent(typeof project.roadmap === 'string' ? project.roadmap : JSON.stringify(project.roadmap || []))}`)}
                                    >
                                        <div className="h-1 w-full bg-gradient-to-r from-plasma-cyan via-nebula-purple to-cosmic-indigo opacity-60 group-hover:opacity-100 transition-opacity" />
                                        
                                        <div className="p-6 flex flex-col h-full">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="bg-plasma-cyan/10 border border-plasma-cyan/30 text-plasma-cyan px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase">
                                                    {project.projectType || "MISSION"}
                                                </span>
                                                
                                                <button 
                                                    className="h-8 w-8 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-full transition-all opacity-0 group-hover:opacity-100" 
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            
                                            <h3 className="text-xl font-heading font-bold line-clamp-1 text-white group-hover:text-plasma-cyan transition-colors mb-2">
                                                {project.title}
                                            </h3>
                                            
                                            <p className="text-sm text-slate-400 line-clamp-3 mb-6 flex-1 leading-relaxed font-mono">
                                                {project.description}
                                            </p>
                                            
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {(Array.isArray(project.techStack) ? project.techStack : String(project.techStack).split(',')).slice(0, 3).map((t, i) => (
                                                    <span key={i} className="px-2 py-1 text-[10px] font-medium bg-white/5 text-slate-300 border border-white/10 rounded">
                                                        {t.trim()}
                                                    </span>
                                                ))}
                                                {(Array.isArray(project.techStack) ? project.techStack.length : String(project.techStack).split(',').length) > 3 && (
                                                    <span className="text-[10px] text-slate-500 self-center font-mono">+More</span>
                                                )}
                                            </div>
                                            
                                            <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                                                <div className="flex gap-4">
                                                    {project.repoLink && (
                                                        <a href={project.repoLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-xs flex items-center text-slate-400 hover:text-white transition-colors">
                                                            <Github className="mr-1.5 h-3.5 w-3.5" /> Code
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="flex items-center text-xs text-plasma-cyan font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Access Log <ArrowUpRight className="ml-1 h-3 w-3" />
                                                </div>
                                            </div>
                                        </div>
                                    </HolographicCard>
                                </motion.div>
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
        </DashboardLayout>
    );
}
