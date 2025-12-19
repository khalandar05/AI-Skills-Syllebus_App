"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/dash-layout';
import { ArrowUpRight, BookOpen, Mic, User, Linkedin, FileText, Sparkles, Plus, Trophy, Zap, Code2 } from 'lucide-react';

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
                certificates: localStorage.getItem('certificates') ? JSON.parse(localStorage.getItem('certificates')).length : 0, // Mock logic if not real
                interviews: 0 // Placeholder
            });
        };
        loadRequests();
    }, []);

    if (!user) return null;

    if (!user) return null;

    return (
        <DashboardLayout title="Overview">
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                 
                 {/* Hero Section - Vibrant Premium */}
                 <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-8 shadow-xl shadow-indigo-500/20 text-white">
                     <div className="absolute top-0 right-0 p-8 opacity-20">
                         <Sparkles className="h-48 w-48 text-white rotate-12" />
                     </div>
                     <div className="relative z-10">
                         <h1 className="text-4xl font-heading font-bold mb-3 tracking-tight">
                            Welcome back, {user?.name || 'Student'}!
                         </h1>
                         <p className="text-indigo-100 max-w-xl mb-8 text-lg font-medium leading-relaxed">
                            Your learning journey is on track. You have <span className="text-white font-bold">{projects.length} active projects</span> and <span className="text-white font-bold">2 certificates</span> pending.
                         </p>
                         <div className="flex gap-4">
                             <Button size="lg" className="rounded-xl shadow-lg bg-white text-indigo-600 hover:bg-indigo-50 font-bold border-none transition-transform hover:scale-105" onClick={() => router.push('/projects/create')}>
                                 <Plus className="mr-2 h-5 w-5" /> Generate Project
                             </Button>
                             <Button size="lg" variant="outline" className="rounded-xl bg-indigo-700/50 backdrop-blur border-indigo-400/30 text-white hover:bg-indigo-700/70 border-none" onClick={() => router.push('/profile')}>
                                 View Profile
                             </Button>
                         </div>
                     </div>
                 </div>

                 {/* Stats Overview */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     <StatsCard title="Total Projects" value={stats.projects} icon={Code2} color="text-indigo-600" trend="+2 this week" bg="bg-indigo-50 dark:bg-indigo-900/20" />
                     <StatsCard title="Certificates" value={stats.certificates} icon={Trophy} color="text-amber-500" trend="Verified" bg="bg-amber-50 dark:bg-amber-900/20" />
                     <StatsCard title="Interview Prep" value={stats.interviews} icon={Mic} color="text-purple-500" trend="0 sessions" bg="bg-purple-50 dark:bg-purple-900/20" />
                     <StatsCard title="Profile Views" value="128" icon={User} color="text-emerald-500" trend="+12% activity" bg="bg-emerald-50 dark:bg-emerald-900/20" />
                 </div>

                {/* Quick Actions Grid */}
                <div>
                    <h2 className="text-xl font-heading font-bold mb-6 flex items-center gap-2 text-foreground">
                        <Zap className="h-5 w-5 text-amber-500" />
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ActionCard 
                            title="Mock Interview" 
                            desc="Practice technical & behavioral questions" 
                            icon={Mic} 
                            color="bg-purple-100 dark:bg-purple-900/30 text-purple-600"
                            onClick={() => router.push('/mock-interview')}
                        />
                        <ActionCard 
                            title="Resume Builder" 
                            desc="Auto-generate bullet points from projects" 
                            icon={FileText} 
                            color="bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                            onClick={() => router.push('/resume')}
                        />
                        <ActionCard 
                            title="LinkedIn Post" 
                            desc="Share your achievements with network" 
                            icon={Linkedin} 
                            color="bg-sky-100 dark:bg-sky-900/30 text-sky-600"
                            onClick={() => router.push('/linkedin/post')}
                        />
                    </div>
                </div>

                 {/* Recent Projects */}
                 <div>
                     <div className="flex items-center justify-between mb-6">
                         <h2 className="text-xl font-heading font-bold text-foreground">Recent Projects</h2>
                         <Button variant="link" className="text-primary font-semibold" onClick={() => router.push('/projects')}>View All</Button>
                     </div>
                     
                     {projects.length === 0 ? (
                         <div className="premium-card py-16 flex flex-col items-center justify-center text-center bg-card">
                             <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                 <BookOpen className="h-8 w-8 text-muted-foreground" />
                             </div>
                             <h3 className="font-heading font-bold text-lg mb-2">No projects yet</h3>
                             <p className="text-muted-foreground max-w-sm mb-6">Upload a syllabus to get your first professional project roadmap.</p>
                             <Button onClick={() => router.push('/projects')}>Create Project</Button>
                         </div>
                     ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {projects.slice(0, 3).map((project, i) => (
                                 <ProjectCard key={i} project={project} router={router} />
                             ))}
                         </div>
                     )}
                 </div>
            </div>
        </DashboardLayout>
    );
}

function StatsCard({ title, value, icon: Icon, color, trend, bg }) {
    return (
        <div className="premium-card p-6 bg-card">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${bg}`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                </div>
                 <span className="text-xs font-semibold text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">{trend}</span>
            </div>
            <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                <div className="text-3xl font-heading font-bold text-foreground">{value}</div>
            </div>
        </div>
    )
}

function ActionCard({ title, desc, icon: Icon, color, onClick }) {
    return (
        <div className="premium-card p-6 cursor-pointer group bg-card hover:border-primary/50 relative overflow-hidden" onClick={onClick}>
            <div className="flex items-center gap-5 relative z-10">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${color}`}>
                    <Icon className="h-7 w-7" />
                </div>
                <div>
                    <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-snug mt-1">{desc}</p>
                </div>
                <ArrowUpRight className="ml-auto h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
            </div>
        </div>
    )
}

function ProjectCard({ project, router }) {
    return (
         <div 
            className="premium-card overflow-hidden cursor-pointer group bg-card relative"
            onClick={() => router.push(`/projects/${project.id}?id=${project.id}&title=${encodeURIComponent(project.title)}&description=${encodeURIComponent(project.description)}&techStack=${encodeURIComponent(Array.isArray(project.techStack) ? project.techStack.join(',') : project.techStack)}`)}
        >
            <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="p-6">
                 <div className="mb-4 flex justify-between items-center">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-800">
                        {project.difficulty || 'Intermediate'}
                    </span>
                 </div>
                <h3 className="font-heading font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">{project.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-6 leading-relaxed">{project.description}</p>
                
                <div className="flex flex-wrap gap-2">
                    {project.techStack && (Array.isArray(project.techStack) ? project.techStack : project.techStack.split(',')).slice(0, 3).map((t, k) => (
                        <span key={k} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md font-semibold border border-slate-200 dark:border-slate-700">
                            {t}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}
