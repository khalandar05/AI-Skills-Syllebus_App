"use client"

import { useEffect, useState } from 'react';
import { NeonButton } from '@/components/ui/neon-button';
import { HolographicCard } from '@/components/ui/holographic-card';
import { Loader2, Github, ExternalLink, Linkedin, Mail, Calendar, Award, Code2, Trash2, ArrowRight, Star, Cpu, ShieldCheck, Zap } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { DashboardLayout } from '@/components/dash-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function PortfolioPage() {
    const [data, setData] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

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

    if (loading) return (
        <DashboardLayout title="Holodeck Preview">
            <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-plasma-cyan" />
                <div className="text-xs font-mono text-plasma-cyan uppercase tracking-widest animate-pulse">Rendering Holodeck Environment...</div>
            </div>
        </DashboardLayout>
    );

    if (!data) return <DashboardLayout title="Holodeck Preview"><div className="p-8 text-center text-slate-500">Failed to initialize environment.</div></DashboardLayout>;

    const { portfolio, certificates, user } = data;

    const handleDeleteProject = async (id) => {
        if (!confirm("Confirm removal from archive? This action is permanent.")) return;
        try {
            const token = localStorage.getItem('syllabus_auth_token');
            const res = await fetch(`/api/projects/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setProjects(projects.filter(p => p.id !== id));
            } else {
                alert("Archive deletion failed.");
            }
        } catch (e) {
            alert("System error removing project.");
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
        <DashboardLayout title="Public Holodeck">
            <div className="max-w-7xl mx-auto space-y-20 pb-24 animate-in fade-in duration-1000">
                {/* HERO SECTION */}
                <motion.section 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative flex flex-col md:flex-row items-center gap-12 py-12 md:py-20"
                >
                    {/* Holograhic Glow Background */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cosmic-indigo/30 rounded-full blur-[120px] -z-10 animate-pulse-glow" />

                    <div className="flex-1 space-y-6 text-center md:text-left relative z-10">
                        <div className="inline-flex items-center rounded-full border border-plasma-cyan/30 bg-plasma-cyan/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-plasma-cyan backdrop-blur-sm shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                            <span className="flex h-2 w-2 rounded-full bg-plasma-cyan mr-3 animate-pulse shadow-[0_0_10px_#22D3EE]"></span> Open For Deployment
                        </div>
                        
                        <h1 className="text-5xl md:text-8xl font-heading font-black tracking-tight text-white leading-tight uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-plasma-cyan to-nebula-purple">{user.name || "Pilot"}</span>
                        </h1>
                        
                        <h2 className="text-2xl md:text-3xl text-slate-300 font-mono tracking-wider uppercase">
                            {portfolio.jobTitle || "Full Stack Engineer"}
                        </h2>
                        
                        <p className="max-w-xl text-lg text-slate-400 leading-relaxed mx-auto md:mx-0 font-light border-l-2 border-plasma-cyan/20 pl-6">
                            {portfolio.bio || "Crafting advanced digital systems. Specializing in high-performance architectures and AI integration vectors."}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-6">
                            <NeonButton size="lg" onClick={() => window.open('/resume', '_blank')} variant="primary">
                                View Service Log <ArrowRight className="ml-2 h-4 w-4" />
                            </NeonButton>
                            <NeonButton size="lg" variant="ghost" className="text-plasma-cyan border-plasma-cyan/30 hover:bg-plasma-cyan/10">
                                <Mail className="mr-2 h-4 w-4" /> Open Comms
                            </NeonButton>
                        </div>
                    </div>

                    <div className="relative group">
                         <div className="absolute -inset-2 bg-gradient-to-r from-plasma-cyan via-white to-nebula-purple rounded-full opacity-30 group-hover:opacity-60 blur-xl transition duration-500 animate-spin-slow"></div>
                        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-black flex items-center justify-center border-4 border-white/10 shrink-0 overflow-hidden z-10">
                            <Avatar className="w-full h-full">
                                <AvatarImage src={user.image} alt={user.name} className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                <AvatarFallback className="text-6xl font-bold text-slate-700 bg-space-black">{user.name ? user.name[0] : "Me"}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </motion.section>

                {/* SKILLS MATRIX */}
                <motion.section 
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="space-y-8"
                >
                    <div className="flex items-center gap-4">
                        <Zap className="h-6 w-6 text-solar-gold animate-pulse" />
                        <h3 className="text-2xl font-heading font-bold tracking-widest uppercase text-white">Technical Matrix</h3>
                        <div className="h-px bg-gradient-to-r from-white/20 to-transparent flex-1" />
                    </div>
                    
                    <HolographicCard className="p-8 border-t border-white/20">
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            {(portfolio.skills || "React, Node.js, JavaScript, TypeScript, Tailwind CSS, PostgreSQL, Git, Docker, AWS").split(',').map((skill, i) => (
                                <motion.div key={i} variants={item}>
                                    <div className="px-5 py-2.5 text-sm font-bold bg-white/5 hover:bg-white/10 text-plasma-cyan border border-plasma-cyan/30 rounded shadow-[0_0_10px_rgba(34,211,238,0.1)] uppercase tracking-wider backdrop-blur-md transition-all hover:scale-105 cursor-default">
                                        {skill.trim()}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </HolographicCard>
                </motion.section>

                {/* PROJECTS GALLERY */}
                <section className="space-y-10">
                    <div className="flex items-end justify-between border-b border-white/10 pb-4">
                        <div>
                            <h3 className="text-3xl font-heading font-bold tracking-widest uppercase text-white flex items-center gap-3">
                                <Code2 className="h-6 w-6 text-nebula-purple" /> 
                                Project Archives
                            </h3>
                            <p className="text-slate-500 mt-1 font-mono text-xs uppercase tracking-wider">Deployments: {projects.length}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {loading && <div className="col-span-2 text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-plasma-cyan" /></div>}
                        
                        {!loading && projects.length === 0 && (
                            <HolographicCard className="col-span-2 text-center py-20 flex flex-col items-center">
                                <div className="p-4 rounded-full bg-white/5 mb-4 border border-white/5">
                                    <Code2 className="w-12 h-12 text-slate-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-wider">Archive Empty</h3>
                                <p className="text-slate-400 font-mono text-sm mt-2">Initialize new projects to populate the gallery.</p>
                            </HolographicCard>
                        )}

                        {projects.map((project, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <HolographicCard className="h-full flex flex-col p-8 group border-transparent hover:border-plasma-cyan/50">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-plasma-cyan uppercase tracking-widest bg-plasma-cyan/10 px-2 py-1 rounded border border-plasma-cyan/20">
                                                {project.projectType || "Personal Mission"}
                                            </span>
                                            <h3 className="text-2xl font-bold text-white group-hover:text-plasma-cyan transition-colors font-heading tracking-wide mt-2">{project.title}</h3>
                                        </div>
                                        <button className="h-8 w-8 text-slate-600 hover:text-red-400 transition-colors" onClick={() => handleDeleteProject(project.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    
                                    <p className="text-slate-400 line-clamp-3 text-sm leading-relaxed mb-6 flex-1 font-light border-l border-white/10 pl-4">
                                        {project.description}
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {project.techStack && (String(project.techStack).split(',').slice(0, 4).map((t, i) => (
                                            <span key={i} className="text-[10px] font-mono text-slate-300 bg-white/5 px-2 py-1 rounded border border-white/5">{t.trim()}</span>
                                        )))}
                                    </div>
                                    
                                    {project.keyLearnings && (
                                        <div className="mb-6 px-4 py-3 bg-nebula-purple/10 rounded border border-nebula-purple/20">
                                            <p className="text-xs italic text-nebula-purple font-mono">&quot;{project.keyLearnings}&quot;</p>
                                        </div>
                                    )}

                                    <div className="flex gap-4 pt-4 border-t border-white/5 mt-auto">
                                        {project.repoLink && (
                                            <a href={project.repoLink} target="_blank" rel="noreferrer" className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors">
                                                <Github className="mr-2 h-4 w-4" /> Source Data
                                            </a>
                                        )}
                                        {project.liveDemoLink && (
                                            <a href={project.liveDemoLink} target="_blank" rel="noreferrer" className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors">
                                                <ExternalLink className="mr-2 h-4 w-4" /> Live Uplink
                                            </a>
                                        )}
                                    </div>
                                </HolographicCard>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* CERTIFICATES SECTION */}
                {certificates.length > 0 && (
                    <section className="space-y-8">
                        <div className="flex items-center gap-4">
                            <ShieldCheck className="h-6 w-6 text-aurora-green animate-pulse" />
                            <h3 className="text-2xl font-heading font-bold tracking-widest uppercase text-white">Credentials</h3>
                            <div className="h-px bg-gradient-to-r from-white/20 to-transparent flex-1" />
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
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-aurora-green/50 transition-colors shadow-sm cursor-pointer hover:shadow-[0_0_15px_rgba(45,212,191,0.2)] group backdrop-blur-sm">
                                        <div className="h-12 w-12 rounded-full bg-aurora-green/10 flex items-center justify-center shrink-0 border border-aurora-green/20 group-hover:scale-110 transition-transform">
                                            <Award className="h-6 w-6 text-aurora-green" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-white truncate group-hover:text-aurora-green transition-colors uppercase tracking-wide">{cert.title}</h4>
                                            <p className="text-xs text-slate-400 font-mono">{cert.issuer}</p>
                                            <p className="text-[10px] text-slate-600 mt-0.5 font-mono">{new Date(cert.issueDate).toLocaleDateString()}</p>
                                        </div>
                                        {cert.credentialUrl && (
                                            <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-aurora-green transition-colors">
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
                <footer className="text-center pt-20 border-t border-white/10 text-slate-500">
                    <div className="flex justify-center gap-8 mb-8">
                        <a href={portfolio.linkedinUrl || "#"} target="_blank" rel="noreferrer" className={`h-12 w-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-plasma-cyan hover:text-black hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all ${!portfolio.linkedinUrl && 'opacity-50 pointer-events-none'}`}>
                            <Linkedin className="h-5 w-5" />
                        </a>
                        <a href={portfolio.githubUrl || "#"} target="_blank" rel="noreferrer" className={`h-12 w-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all ${!portfolio.githubUrl && 'opacity-50 pointer-events-none'}`}>
                            <Github className="h-5 w-5" />
                        </a>
                        <a href={`mailto:${user.email}`} className="h-12 w-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-nebula-purple hover:text-white hover:shadow-[0_0_20px_rgba(109,40,217,0.5)] transition-all">
                             <Mail className="h-5 w-5" />
                        </a>
                    </div>
                    <p className="text-xs font-mono uppercase tracking-widest">© {new Date().getFullYear()} {user.name}. Powered by Antigravity Systems.</p>
                </footer>
            </div>
        </DashboardLayout>
    );
}
