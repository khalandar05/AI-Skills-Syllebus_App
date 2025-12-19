"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { NeonButton } from '@/components/ui/neon-button';
import { HolographicCard } from '@/components/ui/holographic-card';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Download, FileText, Printer, Sparkles, Briefcase, User as UserIcon, Loader2, Plus, Trash2, Code2, Copy, CheckCircle2, Cpu, ScanLine, Share2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dash-layout';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResumePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [projects, setProjects] = useState([]);
    const [customSections, setCustomSections] = useState([]);
    const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
    const [newSection, setNewSection] = useState({ title: '', content: '' }); 
    const [copied, setCopied] = useState(false);

    const fetchPortfolio = async () => {
        const token = localStorage.getItem('syllabus_auth_token');
        if (!token) return;

        try {
            const res = await fetch('/api/portfolio', {
                 headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.portfolio) setPortfolio(data.portfolio);
            }
        } catch (e) {
            console.error("Fetch Portfolio Failed:", e);
        }
    };

    const fetchProjects = async () => {
        const token = localStorage.getItem('syllabus_auth_token');
        if (!token) return;

        try {
            const res = await fetch('/api/projects', {
                 headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.projects) setProjects(data.projects);
            }
        } catch (e) {
             console.error("Fetch Projects Failed:", e);
        }
    };

    const fetchCustomSections = async () => {
        const token = localStorage.getItem('syllabus_auth_token');
        if (!token) return;
        try {
            const res = await fetch('/api/custom-sections', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.sections) setCustomSections(data.sections);
            }
        } catch (e) {
            console.error("Fetch Sections Failed:", e);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            fetchPortfolio();
            fetchProjects();
            fetchCustomSections();
        } else {
            router.push('/auth/login');
        }
    }, [router]);

    const handleGenerate = async () => {
        const token = localStorage.getItem('syllabus_auth_token');
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/portfolio/generate', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                let errorMsg = "Generation Failed";
                try {
                    const err = await res.json();
                    errorMsg = err.error || errorMsg;
                } catch (jsonError) {
                    errorMsg = `Server Error: ${res.status} ${res.statusText}`;
                }
                throw new Error(errorMsg);
            }

            const data = await res.json();
            setPortfolio(data.portfolio);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSection = async () => {
        const token = localStorage.getItem('syllabus_auth_token');
        try {
             const res = await fetch('/api/custom-sections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newSection)
            });
            if (res.ok) {
                fetchCustomSections();
                setIsSectionDialogOpen(false);
                setNewSection({ title: '', content: '' });
            }
        } catch(e) { console.error(e) }
    };

    const handleDeleteSection = async (id) => {
        const token = localStorage.getItem('syllabus_auth_token');
        try {
             await fetch(`/api/custom-sections/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchCustomSections();
        } catch(e) { console.error(e) }
    };

    const copySummary = () => {
        if (portfolio?.summary) {
            navigator.clipboard.writeText(portfolio.summary);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!user) return null;

    return (
        <DashboardLayout title="Dossier Generator">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-1000">
                {error && (
                    <div className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg flex items-center gap-2">
                        <span className="font-bold">Error:</span> {error}
                    </div>
                )}

                {!portfolio ? (
                    <HolographicCard className="flex flex-col items-center justify-center py-24 text-center border-dashed border-white/10">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-plasma-cyan/20 blur-xl rounded-full animate-pulse" />
                            <FileText className="h-20 w-20 text-plasma-cyan relative z-10" />
                        </div>
                        <h3 className="text-3xl font-heading font-bold mb-3 text-white uppercase tracking-widest">Dossier Compilation Required</h3>
                        <p className="text-slate-400 max-w-md mx-auto mb-8 text-lg font-light leading-relaxed">
                            Initialize AI protocols to compile personnel data into a standardized resume format.
                        </p>
                        <NeonButton onClick={handleGenerate} disabled={loading} size="lg">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            {loading ? 'Compiling Data...' : 'Build Dossier'}
                        </NeonButton>
                    </HolographicCard>
                ) : (
                    <div className="grid gap-8">
                        {/* Dossier Header */}
                        <HolographicCard className="p-0 overflow-hidden group">
                            <div className="px-8 py-8 flex flex-col md:flex-row items-center gap-8 bg-black/40">
                                <div className="h-32 w-32 relative rounded-full border-4 border-plasma-cyan shadow-[0_0_20px_rgba(34,211,238,0.3)] overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-500">
                                        {user.image ? (
                                        <Image src={user.image} alt="Profile" fill className="object-cover" />
                                        ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-black text-4xl font-bold text-plasma-cyan">{user.name?.[0]}</div>
                                        )}
                                </div>
                                <div className="flex-1 text-center md:text-left space-y-2">
                                    <h2 className="text-4xl font-heading font-black tracking-wider text-white uppercase">{user.name}</h2>
                                    <p className="text-xl text-plasma-cyan font-mono tracking-widest uppercase">{portfolio.jobTitle || "Personnel"}</p>
                                </div>

                                <div className="flex gap-4">
                                    <NeonButton onClick={handleGenerate} variant="ghost" disabled={loading} className="text-xs">
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                        Re-Compile
                                    </NeonButton>
                                    
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <NeonButton variant="primary">
                                                <Printer className="mr-2 h-4 w-4" /> Print Dossier
                                            </NeonButton>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto bg-white text-slate-900 p-0 sm:rounded-none md:rounded-lg border-none">
                                            <DialogTitle className="sr-only">Dossier Preview</DialogTitle>
                                                <ResumePreview user={user} portfolio={portfolio} projects={projects} customSections={customSections} />
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </HolographicCard>

                        <div className="grid md:grid-cols-3 gap-8">
                                {/* Sidebar Info */}
                            <div className="space-y-6">
                                <HolographicCard className="p-6">
                                    <div className="flex items-center gap-2 mb-4 text-plasma-cyan uppercase tracking-widest font-bold text-xs">
                                        <Code2 className="h-4 w-4" /> Skill Matrix
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {portfolio.skills?.split(',').map((skill, i) => (
                                            <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 text-slate-300 text-xs rounded hover:border-plasma-cyan transition-colors cursor-default">
                                                {skill.trim()}
                                            </span>
                                        )) || <span className="text-slate-500 text-sm">No capabilities logged.</span>}
                                    </div>
                                </HolographicCard>

                                <HolographicCard className="p-6">
                                    <div className="flex items-center gap-2 mb-4 text-white uppercase tracking-widest font-bold text-xs">
                                        <Share2 className="h-4 w-4" /> Comms
                                    </div>
                                    <div className="p-3 rounded bg-white/5 border border-white/5 flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-plasma-cyan/20 flex items-center justify-center text-plasma-cyan font-bold">@</div>
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold">Subspace ID</p>
                                            <p className="text-sm text-white truncate font-mono">{user.email}</p>
                                        </div>
                                    </div>
                                </HolographicCard>

                                {/* Custom Sections Manager */}
                                <HolographicCard className="p-6">
                                    <div className="flex flex-row items-center justify-between mb-4">
                                        <div className="flex items-center gap-2 text-solar-gold uppercase tracking-widest font-bold text-xs">
                                            <Plus className="h-4 w-4" /> Append Data
                                        </div>
                                        <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
                                            <DialogTrigger asChild>
                                                <button className="h-6 w-6 rounded-full bg-white/10 hover:bg-solar-gold hover:text-black flex items-center justify-center transition-colors">
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-black/90 border-white/20 text-white backdrop-blur-md">
                                                <DialogTitle className="uppercase tracking-widest text-solar-gold">Append Record</DialogTitle>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Type / Title</label>
                                                        <input 
                                                            className="w-full p-3 bg-white/5 border border-white/10 rounded focus:border-solar-gold outline-none text-white" 
                                                            placeholder="e.g. Clearance Levels"
                                                            value={newSection.title}
                                                            onChange={e => setNewSection({...newSection, title: e.target.value})}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Data Content</label>
                                                        <textarea 
                                                            className="w-full p-3 bg-white/5 border border-white/10 rounded focus:border-solar-gold outline-none text-white min-h-[120px]" 
                                                            placeholder="Enter record details..."
                                                            value={newSection.content}
                                                            onChange={e => setNewSection({...newSection, content: e.target.value})}
                                                        />
                                                    </div>
                                                    <NeonButton onClick={handleAddSection} className="w-full">Confirm Append</NeonButton>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {customSections.length === 0 && <p className="text-xs text-slate-500 italic text-center py-4 border border-dashed border-white/10 rounded">No auxiliary data appended.</p>}
                                        {customSections.map(section => (
                                            <div key={section.id} className="group flex justify-between items-start p-3 bg-white/5 hover:bg-white/10 rounded transition-colors text-sm border border-transparent hover:border-solar-gold/30">
                                                <div>
                                                        <span className="font-bold block mb-1 text-white uppercase text-xs tracking-wider">{section.title}</span>
                                                        <p className="text-xs text-slate-400 line-clamp-1">{section.content}</p>
                                                </div>
                                                <button className="text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteSection(section.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </HolographicCard>
                            </div>

                            {/* Main Content */}
                            <div className="md:col-span-2 space-y-6">
                                <HolographicCard className="p-8">
                                    <div className="flex flex-row items-center justify-between mb-6 pb-4 border-b border-white/10">
                                            <h3 className="text-lg font-heading font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                                <ScanLine className="h-5 w-5 text-plasma-cyan" /> Executive Summary
                                            </h3>
                                            <NeonButton variant="ghost" size="sm" onClick={copySummary} className="h-8 text-[10px]">
                                                {copied ? <><CheckCircle2 className="w-3 h-3 mr-1" /> Copied</> : <><Copy className="w-3 h-3 mr-1" /> Copy Data</>}
                                            </NeonButton>
                                    </div>
                                    <p className="text-slate-300 leading-relaxed font-light text-sm md:text-base border-l-2 border-plasma-cyan/30 pl-4">
                                        {portfolio.summary}
                                    </p>
                                </HolographicCard>

                                <HolographicCard className="p-8">
                                    <div className="mb-6 pb-4 border-b border-white/10">
                                        <h3 className="text-lg font-heading font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                            <UserIcon className="h-5 w-5 text-nebula-purple" /> Bio-Narrative
                                        </h3>
                                    </div>
                                    <div className="bg-nebula-purple/5 p-6 rounded border border-nebula-purple/20 italic text-slate-400 leading-relaxed font-mono text-sm relative">
                                        <div className="absolute top-2 left-2 text-nebula-purple/40 text-4xl font-serif">"</div>
                                        {portfolio.bio}
                                        <div className="absolute bottom-[-10px] right-4 text-nebula-purple/40 text-4xl font-serif">"</div>
                                    </div>
                                </HolographicCard>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

function ResumePreview({ user, portfolio, projects, customSections }) {
    return (
        <div className="p-12 print:p-0 max-w-[210mm] mx-auto bg-white min-h-[297mm] text-slate-900 shadow-2xl md:my-0 print:shadow-none print:my-0">
            {/* Resume Header */}
            <div className="border-b-4 border-slate-900 pb-8 mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative">
                <div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900 leading-none mb-2">{user.name}</h1>
                    <p className="text-xl text-blue-600 font-bold uppercase tracking-widest">{portfolio.jobTitle || "Software Engineer"}</p>
                </div>
                <div className="flex flex-col items-end gap-4">
                    <div className="print:hidden">
                        <NeonButton onClick={() => window.print()} className="shadow-2xl" variant="primary">
                            <Printer className="mr-2 h-4 w-4" /> Save PDF
                        </NeonButton>
                    </div>
                    <div className="text-right text-sm text-slate-600 font-mono space-y-1">
                        <p className="font-bold text-slate-900">{user.email}</p>
                        <p>{user.location || "Remote / Earth"}</p>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="mb-10">
                <h2 className="text-xs font-black uppercase border-b border-slate-200 mb-4 text-slate-400 tracking-[0.2em] flex items-center gap-2">
                    Profile
                </h2>
                <p className="text-slate-700 leading-loose text-sm text-justify font-medium">{portfolio.summary}</p>
            </div>

            {/* Skills */}
            <div className="mb-10">
                <h2 className="text-xs font-black uppercase border-b border-slate-200 mb-4 text-slate-400 tracking-[0.2em] flex items-center gap-2">
                    Technical Capabilities
                </h2>
                <div className="w-full">
                    <p className="leading-loose text-sm text-slate-800 font-bold">{portfolio.skills}</p>
                </div>
            </div>

            {/* Projects */}
            <div className="mb-10">
                <h2 className="text-xs font-black uppercase border-b border-slate-200 mb-6 text-slate-400 tracking-[0.2em] flex items-center gap-2">
                    Project History
                </h2>
                <div className="grid gap-8">
                    {projects.slice(0, 4).map((p, i) => (
                        <div key={i} className="">
                            <div className="flex justify-between items-baseline mb-2">
                                <h3 className="font-bold text-lg text-slate-900">{p.title}</h3>
                                {p.difficulty && <span className="text-[10px] uppercase font-bold text-slate-500 border border-slate-200 px-2 py-0.5 rounded">{p.difficulty}</span>}
                            </div>
                            <p className="text-slate-600 text-sm mb-2 leading-relaxed">{p.description}</p>
                            <p className="text-xs text-slate-500 font-mono">
                                <span className="font-bold text-slate-700">Stack:</span> {Array.isArray(p.techStack) ? p.techStack.join(', ') : p.techStack}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom Sections */}
             {customSections && customSections.map((section, idx) => (
                <div key={idx} className="mb-10">
                    <h2 className="text-xs font-black uppercase border-b border-slate-200 mb-4 text-slate-400 tracking-[0.2em] flex items-center gap-2">
                        {section.title}
                    </h2>
                    <div className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                        {section.content}
                    </div>
                </div>
            ))}

            <div className="mt-20 pt-8 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-300 font-mono uppercase tracking-widest">
                <span>Generated via CareerForge</span>
                <span>Classified Personnel Record</span>
            </div>
            

        </div>
    );
}
