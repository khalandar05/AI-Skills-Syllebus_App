"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Download, FileText, Printer, Sparkles, Briefcase, User as UserIcon, Loader2, Plus, Trash2, Code2, Copy, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dash-layout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        <DashboardLayout title="Resume Intelligence">
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                {/* Header Card */}
                <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-8 shadow-sm">
                     <div className="absolute top-0 right-0 p-8 opacity-5">
                        <FileText className="h-40 w-40 text-primary" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground flex items-center gap-2">
                                <Sparkles className="h-6 w-6 text-primary" />
                                Resume Builder
                            </h1>
                            <p className="text-muted-foreground mt-2 text-lg">
                                AI-generated professional bio and resume assets based on your project history.
                            </p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg flex items-center gap-2">
                        <span className="font-bold">Error:</span> {error}
                    </div>
                )}

                {!portfolio ? (
                    <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border/60 rounded-2xl bg-muted/5 text-center shadow-inner">
                        <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <Sparkles className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 tracking-tight font-heading">AI Resume Generation</h3>
                        <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg leading-relaxed">
                            We analyze your completed projects and skills to build a professional resume instantly.
                        </p>
                        <Button onClick={handleGenerate} disabled={loading} size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/25 transition-all hover:scale-105 h-12 px-8 rounded-full">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            {loading ? 'Analyzing Profile...' : 'Generate Resume'}
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-8">
                        {/* Profile Header */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                            <div className="relative overflow-hidden border border-border/50 bg-card/60 backdrop-blur-xl shadow-xl rounded-2xl">
                                <div className="h-40 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/5 relative">
                                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                                </div>
                                <div className="px-8 pb-8 flex flex-col md:flex-row items-end gap-6 -mt-16">
                                    <div className="h-32 w-32 relative rounded-2xl border-4 border-background shadow-2xl overflow-hidden bg-muted group-hover:scale-105 transition-transform duration-300">
                                         {user.image ? (
                                            <Image src={user.image} alt="Profile" fill className="object-cover" />
                                         ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary/20 text-4xl font-bold text-primary">{user.name?.[0]}</div>
                                         )}
                                    </div>
                                    <div className="flex-1 text-center md:text-left mb-2">
                                        <h2 className="text-3xl font-heading font-bold tracking-tight text-foreground">{user.name}</h2>
                                        <div className="text-lg text-primary font-medium flex items-center justify-center md:justify-start gap-2">
                                            {portfolio.jobTitle || "Software Engineer"}
                                            <Badge variant="outline" className="text-xs font-normal border-primary/20 bg-primary/5 text-primary">AI Enriched</Badge>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mb-2">
                                        <Button onClick={handleGenerate} variant="outline" disabled={loading} className="hover:bg-primary/10 hover:text-primary transition-colors border-primary/20 backdrop-blur-sm">
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                            Regenerate
                                        </Button>
                                        
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                                                    <FileText className="mr-2 h-4 w-4" /> Preview PDF
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto bg-white text-slate-900 p-0 sm:rounded-none md:rounded-lg">
                                                <DialogTitle className="sr-only">Resume Preview</DialogTitle>
                                                 <ResumePreview user={user} portfolio={portfolio} projects={projects} customSections={customSections} />
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                             {/* Sidebar Info */}
                            <div className="space-y-6">
                                <Card className="border-border/60 shadow-sm">
                                     <CardHeader>
                                        <CardTitle className="text-lg font-heading flex items-center gap-2"><Code2 className="h-4 w-4 text-primary" /> Core Skills</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {portfolio.skills?.split(',').map((skill, i) => (
                                                <Badge key={i} variant="secondary" className="font-medium bg-secondary/50 hover:bg-secondary transition-colors cursor-default border border-border/50">
                                                    {skill.trim()}
                                                </Badge>
                                            )) || <span className="text-muted-foreground text-sm">No skills yet.</span>}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-border/60 shadow-sm">
                                    <CardHeader>
                                         <CardTitle className="text-lg font-heading flex items-center gap-2"><UserIcon className="h-4 w-4 text-primary" /> Contact</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                         <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/30">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                 <span className="font-bold text-xs text-primary">@</span>
                                            </div>
                                            <div className="overflow-hidden min-w-0">
                                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email</p>
                                                <p className="text-sm truncate font-medium" title={user.email}>{user.email}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Custom Sections Manager */}
                                <Card className="border-border/60 shadow-sm">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-lg font-heading">Custom Sections</CardTitle>
                                        <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary">
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogTitle>Add Custom Section</DialogTitle>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Section Title</label>
                                                        <input 
                                                            className="w-full p-2 border rounded-md bg-background" 
                                                            placeholder="e.g. Volunteering"
                                                            value={newSection.title}
                                                            onChange={e => setNewSection({...newSection, title: e.target.value})}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Content</label>
                                                        <textarea 
                                                            className="w-full p-2 border rounded-md bg-background min-h-[100px]" 
                                                            placeholder="Describe your experience..."
                                                            value={newSection.content}
                                                            onChange={e => setNewSection({...newSection, content: e.target.value})}
                                                        />
                                                    </div>
                                                    <Button onClick={handleAddSection} className="w-full bg-primary text-white">Save Section</Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {customSections.length === 0 && <p className="text-sm text-muted-foreground italic text-center py-4 bg-muted/20 rounded-lg border border-dashed border-border/30">Add extra sections like &quot;Volunteering&quot; or &quot;Awards&quot;.</p>}
                                        {customSections.map(section => (
                                            <div key={section.id} className="group flex justify-between items-start p-3 bg-muted/20 hover:bg-muted/40 rounded-lg transition-colors text-sm border border-transparent hover:border-border/50">
                                                <div>
                                                     <span className="font-semibold block mb-1 text-foreground">{section.title}</span>
                                                     <p className="text-xs text-muted-foreground line-clamp-1">{section.content}</p>
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteSection(section.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Main Content */}
                            <div className="md:col-span-2 space-y-6">
                                <Card className="border-border/60 shadow-sm relative group overflow-hidden">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                         <CardTitle className="text-xl font-heading font-bold">Professional Summary</CardTitle>
                                         <Button variant="ghost" size="sm" onClick={copySummary} className="h-8 text-xs gap-1.5 hover:bg-primary/10 hover:text-primary">
                                             {copied ? <><CheckCircle2 className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                                         </Button>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                                            {portfolio.summary}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-border/60 shadow-sm overflow-hidden">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-heading font-bold">Generated Bio</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 p-6 rounded-xl border-l-4 border-l-primary/50 italic text-muted-foreground leading-relaxed">
                                            &quot;{portfolio.bio}&quot;
                                        </div>
                                    </CardContent>
                                </Card>
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
        <div className="p-10 md:p-12 print:p-0 max-w-[210mm] mx-auto bg-white min-h-[297mm] text-slate-900 shadow-2xl md:my-8 print:shadow-none print:my-0">
            {/* Resume Header */}
            <div className="border-b-2 border-slate-900 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-slate-900 leading-none">{user.name}</h1>
                    <p className="text-xl text-indigo-600 font-bold mt-2 uppercase tracking-wide">{portfolio.jobTitle || "Software Engineer"}</p>
                </div>
                <div className="text-left md:text-right text-sm text-slate-600 font-mono space-y-1">
                    <p className="flex items-center gap-2 md:justify-end"><span className="text-indigo-500">@</span> {user.email}</p>
                </div>
            </div>

            {/* Summary */}
            <div className="mb-8">
                <h2 className="text-sm font-black uppercase border-b-2 border-slate-100 mb-4 text-slate-400 tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Profile
                </h2>
                <p className="text-slate-700 leading-relaxed text-sm text-justify font-medium">{portfolio.summary}</p>
            </div>

            {/* Skills */}
            <div className="mb-8">
                <h2 className="text-sm font-black uppercase border-b-2 border-slate-100 mb-4 text-slate-400 tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Technical Skills
                </h2>
                <div className="w-full">
                    <p className="leading-relaxed text-sm text-slate-700 font-medium">{portfolio.skills}</p>
                </div>
            </div>

            {/* Projects */}
            <div className="mb-8">
                <h2 className="text-sm font-black uppercase border-b-2 border-slate-100 mb-4 text-slate-400 tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Projects
                </h2>
                <div className="grid gap-6">
                    {projects.slice(0, 4).map((p, i) => (
                        <div key={i} className="group">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">{p.title}</h3>
                                {p.difficulty && <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{p.difficulty}</span>}
                            </div>
                            <p className="text-slate-600 text-sm mb-2 leading-relaxed">{p.description}</p>
                            <p className="text-xs text-slate-500 font-mono bg-slate-50 inline-block px-2 py-1 rounded">
                                <span className="font-semibold text-slate-700">Stack:</span> {Array.isArray(p.techStack) ? p.techStack.join(', ') : p.techStack}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom Sections */}
             {customSections && customSections.map((section, idx) => (
                <div key={idx} className="mb-8">
                    <h2 className="text-sm font-black uppercase border-b-2 border-slate-100 mb-4 text-slate-400 tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> {section.title}
                    </h2>
                    <div className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                        {section.content}
                    </div>
                </div>
            ))}

            <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                <span>Generated by CareerForge AI</span>
                <span>{new Date().getFullYear()}</span>
            </div>
            
            <div className="fixed bottom-6 right-6 print:hidden z-50">
                <Button onClick={() => window.print()} className="shadow-xl bg-slate-900 text-white hover:bg-slate-800">
                    <Printer className="mr-2 h-4 w-4" /> Print / Save PDF
                </Button>
            </div>
        </div>
    );
}
