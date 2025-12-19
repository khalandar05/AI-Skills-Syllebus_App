"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NeonButton } from '@/components/ui/neon-button';
import { HolographicCard } from '@/components/ui/holographic-card';
import { DashboardLayout } from '@/components/dash-layout';
import { ArrowUpRight, BookOpen, Mic, User, Linkedin, FileText, Sparkles, Plus, Trophy, Zap, Code2, Activity, Cpu, Globe, Rocket, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState({ projects: 0, certificates: 0, interviews: 0 });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            router.push('/auth/login');
        }
    }, [router]);

    useEffect(() => {
        const loadRequests = async () => {
            const deleted = JSON.parse(localStorage.getItem('deletedProjectTitles') || '[]');
            const local = localStorage.getItem('generatedProjects');
            let loadedProjects = [];
            
            if (local) {
                loadedProjects = JSON.parse(local);
            } else {
                const token = localStorage.getItem('syllabus_auth_token');
                if (token) {
                    try {
                        const res = await fetch('/api/projects', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (res.ok) {
                            const data = await res.json();
                            loadedProjects = data.projects || [];
                        }
                    } catch (e) {
                        console.error("Failed to fetch projects", e);
                    }
                }
            }
            
            const filtered = loadedProjects.filter(p => !deleted.includes(p.title));
            setProjects(filtered);
            setStats({
                projects: filtered.length,
                certificates: localStorage.getItem('certificates') ? JSON.parse(localStorage.getItem('certificates')).length : 0, 
                interviews: 0
            });
        };
        loadRequests();
    }, []);

    if (!user) return null;

    return (
        <DashboardLayout title="Mission Control">
             <div className="space-y-8 animate-in fade-in duration-1000">
                 
                 {/* Hero Section - Mission Control Header */}
                 <HolographicCard className="p-8 relative overflow-hidden group">
                     {/* Dynamic Background */}
                     <div className="absolute inset-0 bg-gradient-to-r from-cosmic-indigo to-primary/20 opacity-50" />
                     <div className="absolute top-0 right-0 p-10 opacity-10 animate-[spin-slow_20s_linear_infinite]">
                         <Rocket className="h-48 w-48 text-plasma-cyan" />
                     </div>
                     
                     <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                         <div>
                             <div className="flex items-center gap-3 mb-2">
                                 <div className="h-3 w-3 rounded-full bg-aurora-green animate-pulse shadow-[0_0_10px_#2DD4BF]" />
                                 <span className="text-xs font-mono text-plasma-cyan tracking-widest uppercase">Commander On Deck</span>
                             </div>
                             <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-white mb-4">
                                Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-plasma-cyan to-nebula-purple">{user?.name}</span>
                             </h1>
                             <p className="text-slate-300 max-w-xl text-lg leading-relaxed border-l-2 border-plasma-cyan/30 pl-4">
                                Systems nominal. You have <span className="text-plasma-cyan font-bold">{projects.length} missions</span> active and <span className="text-aurora-green font-bold">2 certifications</span> in orbit.
                             </p>
                         </div>
                         <div className="flex gap-4">
                             <NeonButton size="lg" variant="primary" onClick={() => router.push('/projects/create')}>
                                 <Plus className="mr-2 h-5 w-5" /> New Mission
                             </NeonButton>
                             <NeonButton size="lg" variant="cyan" onClick={() => router.push('/profile')}>
                                 <User className="mr-2 h-5 w-5" /> Profile
                             </NeonButton>
                         </div>
                     </div>
                 </HolographicCard>

                 {/* Stats Telemetry */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     <TelemetryCard title="Total Missions" value={stats.projects} icon={Code2} color="text-plasma-cyan" trend="+2 detected" delay={0} />
                     <TelemetryCard title="Credentials" value={stats.certificates} icon={Trophy} color="text-solar-gold" trend="Verified" delay={0.1} />
                     <TelemetryCard title="Simulations" value={stats.interviews} icon={Mic} color="text-nebula-purple" trend="0 active" delay={0.2} />
                     <TelemetryCard title="Profile Vis" value="128" icon={Activity} color="text-aurora-green" trend="+12% activity" delay={0.3} />
                 </div>

                {/* Quick Actions Grid */}
                <div>
                    <h2 className="text-xl font-heading font-bold mb-6 flex items-center gap-2 text-white">
                        <Zap className="h-5 w-5 text-solar-gold animate-pulse" />
                        <span className="tracking-wider uppercase">Rapid Deployment</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ActionModule 
                            title="Mock Interview" 
                            desc="Run technical simulations" 
                            icon={Mic} 
                            color="from-nebula-purple/20 to-transparent"
                            iconColor="text-nebula-purple"
                            onClick={() => router.push('/mock-interview')}
                        />
                        <ActionModule 
                            title="Resume Builder" 
                            desc="Compile mission data log" 
                            icon={FileText} 
                            color="from-cosmic-indigo/40 to-transparent"
                            iconColor="text-plasma-cyan"
                            onClick={() => router.push('/resume')}
                        />
                        <ActionModule 
                            title="Comms Relay" 
                            desc="Broadcast achievement to network" 
                            icon={Linkedin} 
                            color="from-blue-900/40 to-transparent"
                            iconColor="text-blue-400"
                            onClick={() => router.push('/linkedin/post')}
                        />
                    </div>
                </div>

                 {/* Recent Missions */}
                 <div>
                     <div className="flex items-center justify-between mb-6">
                         <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
                             <Globe className="h-5 w-5 text-plasma-cyan" />
                             <span className="tracking-wider uppercase">Recent Operations</span>
                         </h2>
                         <NeonButton variant="ghost" className="text-xs" onClick={() => router.push('/projects')}>View All Logs</NeonButton>
                     </div>
                     
                     {projects.length === 0 ? (
                         <HolographicCard className="py-20 flex flex-col items-center justify-center text-center">
                             <div className="p-6 rounded-full bg-white/5 mb-6 animate-pulse">
                                 <BookOpen className="h-10 w-10 text-slate-400" />
                             </div>
                             <h3 className="font-heading font-bold text-xl text-white mb-2">No active missions</h3>
                             <p className="text-slate-400 max-w-sm mb-8">Upload syllabus telemetry to generate your first mission roadmap.</p>
                             <NeonButton variant="cyan" onClick={() => router.push('/projects')}>Initiate Mission</NeonButton>
                         </HolographicCard>
                     ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {projects.slice(0, 3).map((project, i) => (
                                 <MissionCard key={i} project={project} router={router} index={i} />
                             ))}
                         </div>
                     )}
                 </div>
            </div>
        </DashboardLayout>
    );
}

function TelemetryCard({ title, value, icon: Icon, color, trend, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay, duration: 0.5 }}
        >
            <HolographicCard className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-white/5 border border-white/10`}>
                        <Icon className={`h-6 w-6 ${color} drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]`} />
                    </div>
                     <span className="text-[10px] font-mono font-bold text-slate-400 bg-white/5 px-2 py-1 rounded border border-white/5">{trend}</span>
                </div>
                <div className="space-y-1">
                    <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest">{title}</h3>
                    <div className="text-3xl font-heading font-bold text-white shadow-black drop-shadow-md">{value}</div>
                </div>
            </HolographicCard>
        </motion.div>
    )
}

function ActionModule({ title, desc, icon: Icon, color, iconColor, onClick }) {
    return (
        <HolographicCard 
            className={`p-6 cursor-pointer group hover:border-plasma-cyan/50 bg-gradient-to-br ${color}`} 
            onClick={onClick}
        >
            <div className="flex items-center gap-5 relative z-10">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg bg-black/20 border border-white/10`}>
                    <Icon className={`h-7 w-7 ${iconColor}`} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-white text-lg group-hover:text-plasma-cyan transition-colors font-heading tracking-wide uppercase">{title}</h3>
                    <p className="text-xs font-mono text-slate-400 mt-1">{desc}</p>
                </div>
                <ArrowUpRight className="ml-auto h-5 w-5 text-slate-500 group-hover:text-plasma-cyan transition-colors" />
            </div>
            
            {/* Hover Glitch Effect Line */}
            <div className="absolute bottom-0 left-0 h-1 bg-plasma-cyan/50 w-0 group-hover:w-full transition-all duration-300" />
        </HolographicCard>
    )
}

function MissionCard({ project, router, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => router.push(`/projects/${project.id}?id=${project.id}&title=${encodeURIComponent(project.title)}&description=${encodeURIComponent(project.description)}&techStack=${encodeURIComponent(Array.isArray(project.techStack) ? project.techStack.join(',') : project.techStack)}`)}
            className="cursor-pointer"
        >
             <HolographicCard className="h-full flex flex-col group p-0">
                <div className="h-2 w-full bg-gradient-to-r from-cosmic-indigo via-nebula-purple to-plasma-cyan opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="p-6 flex flex-col h-full">
                     <div className="mb-4 flex justify-between items-center">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-plasma-cyan bg-plasma-cyan/10 px-2 py-1 rounded border border-plasma-cyan/20">
                            {project.difficulty || 'Intermediate'} Sector
                        </span>
                        <Code2 className="h-4 w-4 text-slate-500 group-hover:text-white" />
                     </div>
                    <h3 className="font-heading font-bold text-lg mb-2 line-clamp-1 text-white group-hover:text-plasma-cyan transition-colors">{project.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 h-8 mb-6 leading-relaxed font-mono">{project.description}</p>
                    
                    <div className="mt-auto flex flex-wrap gap-2">
                        {project.techStack && (Array.isArray(project.techStack) ? project.techStack : project.techStack.split(',')).slice(0, 3).map((t, k) => (
                            <span key={k} className="text-[10px] bg-white/5 text-slate-300 px-2 py-1 rounded font-medium border border-white/5">
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            </HolographicCard>
        </motion.div>
    )
}
