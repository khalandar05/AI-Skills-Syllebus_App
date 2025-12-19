"use client"

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Github, ExternalLink, Linkedin, Mail, Calendar, Award, Code2, Trash2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/dash-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function PortfolioPage() {
    const [data, setData] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('syllabus_auth_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            try {
                // Parallel fetching
                const [portfolioRes, projectsRes, certificatesRes, userRes] = await Promise.all([
                    fetch('/api/portfolio', { headers }),
                    fetch('/api/projects', { headers }),
                    fetch('/api/certificates', { headers }),
                    fetch('/api/user/profile', { headers })
                ]);

                let portfolio = {};
                try {
                    if (portfolioRes.ok) {
                        const pData = await portfolioRes.json();
                        portfolio = pData.portfolio || {};
                    }
                } catch (e) { console.warn("Portfolio parse error:", e); }

                let fetchedProjects = [];
                try {
                    if (projectsRes.ok) {
                        const pData = await projectsRes.json();
                        fetchedProjects = pData.projects || [];
                    }
                } catch(e) { console.warn("Projects parse error:", e); }

                let fetchedCertificates = [];
                try {
                    if (certificatesRes.ok) {
                         const cData = await certificatesRes.json();
                         fetchedCertificates = cData.certificates || [];
                    }
                } catch(e) { console.warn("Certificates parse error:", e); }
                
                let user = {};
                if (userRes.ok) {
                    try {
                        const userData = await userRes.json();
                        user = userData.user || {};
                    } catch(e) { console.warn("User parse error", e); }
                } else {
                    const localUser = localStorage.getItem('user');
                    if (localUser) user = JSON.parse(localUser);
                }

                setData({
                    portfolio,
                    certificates: fetchedCertificates,
                    user
                });
                setProjects(fetchedProjects);

            } catch (e) {
                console.error("Failed to load portfolio data", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <DashboardLayout title="Portfolio Preview"><div className="h-[80vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div></DashboardLayout>;
    if (!data) return <DashboardLayout title="Portfolio Preview"><div className="p-8 text-center text-muted-foreground">Failed to load portfolio.</div></DashboardLayout>;

    const { portfolio, certificates, user } = data;

    const handleDeleteProject = async (id) => {
        if (!confirm("Are you sure you want to remove this project from your portfolio? This will permanently delete the project.")) return;
        try {
            const token = localStorage.getItem('syllabus_auth_token');
            const res = await fetch(`/api/projects/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setProjects(projects.filter(p => p.id !== id));
            } else {
                alert("Failed to delete project");
            }
        } catch (e) {
            alert("Failed to delete project");
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <DashboardLayout title="Portfolio Preview">
            <div className="max-w-7xl mx-auto space-y-20 pb-24 animate-in fade-in duration-700">
                {/* HERO SECTION */}
                <motion.section 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative flex flex-col-reverse md:flex-row items-center gap-12 py-16 md:py-24"
                >
                    {/* Background Decorative */}
                    <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-primary/20 rounded-full blur-[100px] opacity-50" />
                    <div className="absolute bottom-0 left-0 -z-10 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] opacity-30" />

                    <div className="flex-1 space-y-6 text-center md:text-left">
                        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span> Available for hire
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-heading font-black tracking-tight text-foreground leading-tight">
                            Hi, I&apos;m <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">{user.name || "Developer"}</span>.
                        </h1>
                        
                        <h2 className="text-2xl md:text-3xl text-muted-foreground font-light">
                            {portfolio.jobTitle || "Full Stack Developer"}
                        </h2>
                        
                        <p className="max-w-xl text-lg text-muted-foreground leading-relaxed mx-auto md:mx-0">
                            {portfolio.bio || "Building digital experiences that matter. Passionate about clean code, modern architectures, and solving real-world problems."}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-6">
                            <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 text-white rounded-full" onClick={() => window.open('/resume', '_blank')}>
                                View Experience <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary backdrop-blur-sm">
                                <Mail className="mr-2 h-4 w-4" /> Contact Me
                            </Button>
                        </div>
                    </div>

                    <div className="relative group">
                         <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative w-56 h-56 md:w-80 md:h-80 rounded-full bg-card flex items-center justify-center border-4 border-background shadow-2xl shrink-0 overflow-hidden">
                            <Avatar className="w-full h-full">
                                <AvatarImage src={user.image} alt={user.name} className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                <AvatarFallback className="text-6xl font-bold text-muted-foreground/20">{user.name ? user.name[0] : "Me"}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </motion.section>

                {/* SKILLS SECTION */}
                <motion.section 
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="space-y-8"
                >
                    <div className="flex items-center gap-4">
                        <h3 className="text-3xl font-heading font-bold tracking-tight">Technical Skills</h3>
                        <div className="h-px bg-border flex-1" />
                    </div>
                    
                    <Card className="rounded-2xl border-border/50 shadow-sm">
                        <CardContent className="p-8">
                            <div className="flex flex-wrap gap-3">
                                {(portfolio.skills || "React, Node.js, JavaScript, TypeScript, Tailwind CSS, PostgreSQL, Git, Docker, AWS").split(',').map((skill, i) => (
                                    <motion.div key={i} variants={item}>
                                        <Badge variant="secondary" className="px-4 py-2 text-sm bg-secondary/40 hover:bg-secondary hover:scale-105 transition-all cursor-default border border-border/50">
                                            {skill.trim()}
                                        </Badge>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.section>

                {/* PROJECTS SECTION */}
                <section className="space-y-10">
                    <div className="flex items-end justify-between border-b border-border/40 pb-4">
                        <div>
                            <h3 className="text-3xl font-heading font-bold tracking-tight">Featured Projects</h3>
                            <p className="text-muted-foreground mt-1">A selection of my recent work.</p>
                        </div>
                        <span className="text-muted-foreground text-sm font-medium bg-muted px-3 py-1 rounded-full">{projects.length} Total</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {loading && <div className="col-span-2 text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>}
                        
                        {!loading && projects.length === 0 && (
                            <div className="col-span-2 text-center py-20 border border-dashed border-border/50 rounded-xl bg-muted/5">
                                <Code2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-foreground">No projects yet</h3>
                                <p className="text-muted-foreground">Start building to showcase your work here.</p>
                            </div>
                        )}

                        {projects.map((project, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Card className="h-full flex flex-col overflow-hidden hover:shadow-2xl transition-all duration-300 hover:border-primary/50 group relative rounded-2xl border-border/50">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                    
                                    <CardContent className="p-6 flex flex-col h-full pt-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                <Badge variant="outline" className="text-xs font-normal text-muted-foreground mb-2 block w-fit">{project.projectType || "Personal Project"}</Badge>
                                                <h3 className="text-2xl font-bold group-hover:text-primary transition-colors font-heading">{project.title}</h3>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 -mr-2" onClick={() => handleDeleteProject(project.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        
                                        <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed mb-6 flex-1">
                                            {project.description}
                                        </p>
                                        
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {project.techStack && (String(project.techStack).split(',').slice(0, 4).map((t, i) => (
                                                <Badge key={i} variant="secondary" className="text-[10px] bg-secondary/40 border border-border/30">{t.trim()}</Badge>
                                            )))}
                                        </div>
                                        
                                        {project.keyLearnings && (
                                            <div className="mb-6 px-4 py-3 bg-primary/5 rounded-lg text-xs italic text-primary/80 border border-primary/10">
                                                &quot;{project.keyLearnings}&quot;
                                            </div>
                                        )}

                                        <div className="flex gap-4 pt-4 border-t border-border/40 mt-auto">
                                            {project.repoLink && (
                                                <a href={project.repoLink} target="_blank" rel="noreferrer" className="flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">
                                                    <Github className="mr-2 h-4 w-4" /> Source Code
                                                </a>
                                            )}
                                            {project.liveDemoLink && (
                                                <a href={project.liveDemoLink} target="_blank" rel="noreferrer" className="flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">
                                                    <ExternalLink className="mr-2 h-4 w-4" /> Live Demo
                                                </a>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* CERTIFICATES SECTION */}
                {certificates.length > 0 && (
                    <section className="space-y-8">
                        <div className="flex items-center gap-4">
                            <h3 className="text-3xl font-heading font-bold tracking-tight">Certifications</h3>
                            <div className="h-px bg-border flex-1" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {certificates.map((cert, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors shadow-sm cursor-pointer hover:shadow-md">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10">
                                            <Award className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm truncate">{cert.title}</h4>
                                            <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{new Date(cert.issueDate).toLocaleDateString()}</p>
                                        </div>
                                        {cert.credentialUrl && (
                                            <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* FOOTER */}
                <footer className="text-center pt-20 border-t border-border/40 text-muted-foreground">
                    <div className="flex justify-center gap-8 mb-8">
                        <a href={portfolio.linkedinUrl || "#"} target="_blank" rel="noreferrer" className={`h-10 w-10 flex items-center justify-center rounded-full bg-muted/50 hover:bg-primary hover:text-white transition-all ${!portfolio.linkedinUrl && 'opacity-50 pointer-events-none'}`}>
                            <Linkedin className="h-5 w-5" />
                        </a>
                        <a href={portfolio.githubUrl || "#"} target="_blank" rel="noreferrer" className={`h-10 w-10 flex items-center justify-center rounded-full bg-muted/50 hover:bg-primary hover:text-white transition-all ${!portfolio.githubUrl && 'opacity-50 pointer-events-none'}`}>
                            <Github className="h-5 w-5" />
                        </a>
                        <a href={`mailto:${user.email}`} className="h-10 w-10 flex items-center justify-center rounded-full bg-muted/50 hover:bg-primary hover:text-white transition-all">
                             <Mail className="h-5 w-5" />
                        </a>
                    </div>
                    <p className="text-sm font-medium">© {new Date().getFullYear()} {user.name}. Built with CareerForge AI.</p>
                </footer>
            </div>
        </DashboardLayout>
    );
}
