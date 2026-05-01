"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DashboardLayout } from '@/components/dash-layout';
import { ArrowUpRight, BookOpen, Mic, User, Linkedin, FileText, Plus, Trophy, Activity, Code2, Globe } from 'lucide-react';
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
                    } catch (e) {}
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
        <DashboardLayout title="Overview">
            <div className="space-y-8 animate-in fade-in duration-500 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                     
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-card rounded-xl p-8 border shadow-sm">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground mb-2">
                            Welcome back, {user?.name}
                        </h1>
                        <p className="text-muted-foreground text-base">
                            Here is what's happening with your projects and progress today.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Button size="lg" variant="default" onClick={() => router.push('/projects/create')}>
                            <Plus className="mr-2 h-5 w-5" /> New Project
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Projects" value={stats.projects} icon={Code2} />
                    <StatCard title="Certificates" value={stats.certificates} icon={Trophy} />
                    <StatCard title="Interviews" value={stats.interviews} icon={Mic} />
                    <StatCard title="Profile Views" value="128" icon={Activity} />
                </div>

                {/* Quick Actions Grid */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 text-foreground">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ActionCard 
                            title="Mock Interview" 
                            desc="Practice technical interviews" 
                            icon={Mic} 
                            onClick={() => router.push('/mock-interview')}
                        />
                        <ActionCard 
                            title="Resume Builder" 
                            desc="Update your professional resume" 
                            icon={FileText} 
                            onClick={() => router.push('/resume')}
                        />
                        <ActionCard 
                            title="LinkedIn Post" 
                            desc="Share your latest achievements" 
                            icon={Linkedin} 
                            onClick={() => router.push('/linkedin/post')}
                        />
                    </div>
                </div>

                {/* Recent Projects */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-foreground">
                            Recent Projects
                        </h2>
                        <Button variant="outline" size="sm" onClick={() => router.push('/projects')}>View All</Button>
                    </div>
                    
                    {projects.length === 0 ? (
                        <Card className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="p-4 rounded-full bg-muted mb-4">
                                <BookOpen className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold text-lg text-foreground mb-1">No active projects</h3>
                            <p className="text-muted-foreground max-w-sm mb-6 text-sm">Create your first project to start tracking your progress.</p>
                            <Button variant="default" onClick={() => router.push('/projects/create')}>Create Project</Button>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.slice(0, 3).map((project, i) => (
                                <ProjectCard key={i} project={project} router={router} index={i} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

function StatCard({ title, value, icon: Icon }) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-3xl font-bold text-foreground">{value}</div>
            </CardContent>
        </Card>
    )
}

function ActionCard({ title, desc, icon: Icon, onClick }) {
    return (
        <Card className="cursor-pointer hover:border-primary/50 transition-colors group" onClick={onClick}>
            <CardContent className="p-6 flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
            </CardContent>
        </Card>
    )
}

function ProjectCard({ project, router, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full flex flex-col" onClick={() => router.push(`/projects/${project.id}?id=${project.id}&title=${encodeURIComponent(project.title)}`)}>
                <CardHeader>
                    <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
                    <CardDescription className="text-xs uppercase tracking-wider">{project.projectType || "Project"}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                     <div className="flex flex-wrap gap-2 mt-auto">
                        {project.techStack && (Array.isArray(project.techStack) ? project.techStack : project.techStack.split(',')).slice(0, 3).map((t, k) => (
                            <span key={k} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                                {t}
                            </span>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
