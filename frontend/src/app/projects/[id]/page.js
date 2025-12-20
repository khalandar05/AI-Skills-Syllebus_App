"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { CheckCircle2, Github, ArrowLeft, Copy, Clock, Layers, ShieldAlert, FileText, Activity, Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { DashboardLayout } from '@/components/dash-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProjectWorkspace({ params }) {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Data from URL (Fallback)
    const id = searchParams.get('id') || params.id;
    
    const [loading, setLoading] = useState(true);
    const [projectData, setProjectData] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [repoStats, setRepoStats] = useState({});

    // Fetch Project Data
    useEffect(() => {
        if (!id) return;
        const fetchProject = async () => {
            try {
                const token = localStorage.getItem('syllabus_auth_token');
                const res = await fetch(`/api/projects/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setProjectData(data.project);
                    setRepoStats(data.project.repoStats || {});
                    
                    // Parse Roadmap
                    let loadedRoadmap = [];
                    if (Array.isArray(data.project.roadmap)) {
                        loadedRoadmap = data.project.roadmap;
                    } else if (typeof data.project.roadmap === 'string') {
                        try { loadedRoadmap = JSON.parse(data.project.roadmap); } catch(e) {}
                    }

                    // Restore Status from RepoStats
                    const taskStatuses = data.project.repoStats?.taskStatuses || {};
                    
                    const mappedTasks = loadedRoadmap.map((step, idx) => ({
                         ...step,
                         task: step.title || step.task, // Normalize
                         status: taskStatuses[idx] || 'TODO', 
                         week: step.estimatedTime || 'Phase ' + (step.stepNumber || 1)
                    }));
                    
                    setTasks(mappedTasks.length ? mappedTasks : [{ task: "Initialize Repo", status: "TODO", week: "Setup" }]);
                }
            } catch (e) {
                console.error("Failed to load project", e);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    const [showCompletion, setShowCompletion] = useState(false);
    const [copiedField, setCopiedField] = useState(null);
    const [generatedAssets, setGeneratedAssets] = useState(null);
    const [completing, setCompleting] = useState(false);

    // Destructure repoStats for easy access in JSX
    const { 
        problemStatement, 
        realWorldApplication, 
        coreConceptsUsed, 
        risksChallenges, 
        architectureOverview, 
        syllabus_topics_used,
        // Legacy/Fallback keys
        real_world_scenario,
        whyThisMatchesTheSyllabus,
        expectedLearningOutcomes,
        projectScope,
        evaluationCriteria
    } = repoStats || {};

    const moveTask = async (taskIndex, newStatus) => {
        const newTasks = [...tasks];
        newTasks[taskIndex].status = newStatus;
        setTasks(newTasks);

        // Persist Progress
        try {
            // Create a map of { index: status } for all non-TODO items
            const taskStatuses = newTasks.reduce((acc, t, i) => {
                if (t.status && t.status !== 'TODO') acc[i] = t.status;
                return acc;
            }, {});
            
            const token = localStorage.getItem('syllabus_auth_token');
            await fetch(`/api/projects/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    repoStats: { ...repoStats, taskStatuses }
                })
            });
        } catch (e) {
            console.error("Failed to save progress", e);
        }
    };

    const handleComplete = async () => {
        setCompleting(true);
        try {
            const token = localStorage.getItem('syllabus_auth_token');
            const res = await fetch(`/api/projects/${id}/assets`, {
                method: 'POST',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            const data = await res.json();
            
            if (data.success) {
                setGeneratedAssets(data.assets);
                setShowCompletion(true);
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 }
                });
            } else {
                alert("Failed to finalize: " + data.error);
            }
        } catch (e) {
            alert("Network error");
        } finally {
            setCompleting(false);
        }
    };

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    // VIBGYOR Color Palette
    const VIBGYOR = [
        { name: 'violet', bg: 'bg-violet-500', text: 'text-violet-700', border: 'border-violet-500', soft: 'bg-violet-50/50 text-violet-700 dark:text-violet-300' },
        { name: 'indigo', bg: 'bg-indigo-500', text: 'text-indigo-700', border: 'border-indigo-500', soft: 'bg-indigo-50/50 text-indigo-700 dark:text-indigo-300' },
        { name: 'blue', bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-500', soft: 'bg-blue-50/50 text-blue-700 dark:text-blue-300' },
        { name: 'green', bg: 'bg-green-500', text: 'text-green-700', border: 'border-green-500', soft: 'bg-green-50/50 text-green-700 dark:text-green-300' },
        { name: 'amber', bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-500', soft: 'bg-amber-50/50 text-amber-700 dark:text-amber-300' },
    ];

    if (!id || id.length < 10) {
        return (
            <DashboardLayout title="Error">
                <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                    <ShieldAlert className="w-16 h-16 text-yellow-500" />
                    <h2 className="text-2xl font-bold">Invalid Project Link</h2>
                    <p className="text-muted-foreground max-w-md">
                        This project link is outdated (using a numeric ID). 
                        Please go back to the Dashboard and click the project again to get the correct link.
                    </p>
                    <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
                </div>
            </DashboardLayout>
        );
    }

    const getWeekColor = (weekStr) => {
        const num = weekStr.match(/\d+/);
        const index = num ? (parseInt(num[0]) - 1) % 5 : 0;
        return VIBGYOR[index] || VIBGYOR[0];
    };

    const TaskCard = ({ task, index, color }) => (
        <div 
            className="group relative glass-card p-4 rounded-xl cursor-pointer hover:border-primary/40 transition-all hover:shadow-md mb-3 overflow-hidden border border-border/40 bg-card/60 backdrop-blur-sm" 
            onClick={() => {
                if (task.status === 'TODO') moveTask(index, 'IN_PROGRESS');
                if (task.status === 'IN_PROGRESS') moveTask(index, 'DONE');
            }}
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${color.bg} opacity-70`} />
            
            <div className="pl-3">
                <div className="flex justify-between items-start gap-2">
                    <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors leading-relaxed">
                        {task.task}
                    </p>
                    {task.status === 'DONE' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                </div>
                <div className="flex justify-between items-center mt-3 h-4">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        {task.status === 'TODO' ? <>Start Task <ArrowLeft className="w-3 h-3 rotate-180" /></> : task.status === 'IN_PROGRESS' ? <>Mark Done <CheckCircle2 className="w-3 h-3" /></> : <span className="text-emerald-500">Completed</span>}
                    </p>
                </div>
            </div>
        </div>
    );

    const renderGroupedTasks = (status) => {
        const filtered = tasks.filter(t => (t.status === status) || (status === 'TODO' && !t.status));
        if (filtered.length === 0) return <div className="p-8 text-center text-muted-foreground text-sm italic opacity-40">No tasks in this stage</div>;

        const groups = filtered.reduce((acc, t) => {
            const week = t.week || 'Onboarding';
            if (!acc[week]) acc[week] = [];
            acc[week].push(t);
            return acc;
        }, {});

        return Object.keys(groups).map((week) => {
            const color = getWeekColor(week);
            return (
                <div key={week} className="mb-6 last:mb-2">
                     <div className={`flex items-center gap-2 px-3 py-1 mb-3 rounded-md w-fit ${color.soft}`}>
                        <Clock className="w-3.5 h-3.5 opacity-70" /> 
                        <span className="text-[11px] font-bold uppercase tracking-widest">{week}</span>
                     </div>
                     <div className="space-y-1">
                        {groups[week].map((t) => (
                             <TaskCard key={tasks.indexOf(t)} task={t} index={tasks.indexOf(t)} color={color} />
                        ))}
                     </div>
                </div>
            );
        });
    };

    return (
        <DashboardLayout title="Workspace">
            <div className="flex flex-col space-y-6 pb-12 w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
                <Button variant="ghost" onClick={() => router.back()} className="w-fit mb-2 gap-2 text-muted-foreground hover:text-foreground pl-0 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Projects
                </Button>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row justify-between gap-8 bg-card/40 backdrop-blur-sm p-6 rounded-2xl border border-border/50">
                        <div className="space-y-4 max-w-3xl">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">Enterprise Project</Badge>
                                    <span className="text-xs text-muted-foreground font-mono">ID: {id?.slice(0,8)}</span>
                                </div>
                                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                    {projectData?.title}
                                </h1>
                            </div>
                            <p className="text-lg text-muted-foreground leading-relaxed">{projectData?.description}</p>
                            
                            <div className="flex flex-wrap gap-2 pt-2">
                                {/* Fixed techStack rendering to handle both array and string (some legacy data) */}
                                {(Array.isArray(projectData?.techStack) ? projectData.techStack : (projectData?.techStack || '').split(',')).map((t, i) => (
                                    <Badge key={i} variant="secondary" className="px-3 py-1 text-sm bg-secondary/50 hover:bg-secondary/80 font-medium">
                                        {t.trim()}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 min-w-[240px]">
                            <div className="glass-card p-4 rounded-xl">
                                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-primary" /> Project Health
                                </h3>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex justify-between text-xs font-medium uppercase tracking-wider">
                                        <span>Progress</span>
                                        <span>{Math.round((tasks.filter(t => t.status === 'DONE').length / (tasks.length || 1)) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                                        <div className="bg-gradient-to-r from-primary to-purple-500 h-full transition-all duration-500 shadow-[0_0_10px_rgba(79,70,229,0.3)]" style={{ width: `${(tasks.filter(t => t.status === 'DONE').length / (tasks.length || 1)) * 100}%` }} />
                                    </div>
                                </div>
                            </div>

                            <Button onClick={handleComplete} disabled={completing} className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg shadow-emerald-500/20 h-10 font-bold tracking-wide transition-all hover:scale-[1.02]">
                                {completing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                Finalize Project
                            </Button>
                        </div>
                    </div>
                )}

                <Tabs defaultValue="roadmap" className="w-full">
                    <TabsList className="mb-8 p-1 bg-muted/30 border border-border/40 rounded-lg w-full max-w-3xl grid grid-cols-4">
                        <TabsTrigger value="roadmap" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Roadmap</TabsTrigger>
                        <TabsTrigger value="mentorship" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Mentorship</TabsTrigger>
                        <TabsTrigger value="architecture" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Architecture</TabsTrigger>
                        <TabsTrigger value="business" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Value</TabsTrigger>
                    </TabsList>

                    <TabsContent value="roadmap" className="mt-0 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                            {/* TODO */}
                            <div className="flex flex-col bg-muted/20 rounded-2xl border border-dashed border-border/60 min-h-[500px]">
                                <div className="p-4 flex items-center justify-between border-b border-border/30 bg-muted/10 rounded-t-2xl">
                                    <h3 className="font-bold text-muted-foreground uppercase text-xs tracking-widest flex items-center gap-2">
                                        <Layers className="w-4 h-4" /> To Do
                                    </h3>
                                    <Badge variant="outline" className="bg-background text-xs font-mono">{tasks.filter(t => t.status === 'TODO' || !t.status).length}</Badge>
                                </div>
                                <div className="p-3 h-full overflow-y-auto max-h-[700px] custom-scrollbar">
                                    {renderGroupedTasks('TODO')}
                                </div>
                            </div>

                            {/* IN PROGRESS */}
                            <div className="flex flex-col bg-blue-50/20 dark:bg-blue-900/5 rounded-2xl border border-blue-200/30 dark:border-blue-800/20 min-h-[500px]">
                                <div className="p-4 flex items-center justify-between border-b border-blue-200/30 dark:border-blue-800/20 bg-blue-50/30 dark:bg-blue-900/10 rounded-t-2xl">
                                    <h3 className="font-bold text-blue-600 dark:text-blue-400 uppercase text-xs tracking-widest flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> In Progress
                                    </h3>
                                    <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-mono">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</Badge>
                                </div>
                                <div className="p-3 h-full overflow-y-auto max-h-[700px] custom-scrollbar">
                                    {renderGroupedTasks('IN_PROGRESS')}
                                </div>
                            </div>

                            {/* DONE */}
                            <div className="flex flex-col bg-emerald-50/20 dark:bg-emerald-900/5 rounded-2xl border border-emerald-200/30 dark:border-emerald-800/20 min-h-[500px]">
                                <div className="p-4 flex items-center justify-between border-b border-emerald-200/30 dark:border-emerald-800/20 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-t-2xl">
                                    <h3 className="font-bold text-emerald-600 dark:text-emerald-400 uppercase text-xs tracking-widest flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Done
                                    </h3>
                                    <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-mono">{tasks.filter(t => t.status === 'DONE').length}</Badge>
                                </div>
                                <div className="p-3 h-full overflow-y-auto max-h-[700px] custom-scrollbar">
                                    {renderGroupedTasks('DONE')}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="mentorship" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="glass-card rounded-xl p-6 border-l-4 border-l-primary">
                                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                    <BrainCircuit className="w-5 h-5 text-primary" /> Why this Project?
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">Real-World Scenario</h4>
                                        <p className="text-foreground leading-relaxed">{realWorldApplication || real_world_scenario || whyThisMatchesTheSyllabus || "Aligns with core syllabus topics."}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">Syllabus Grounding</h4>
                                        <p className="text-sm text-muted-foreground">{syllabus_topics_used ? `Strictly based on: ${syllabus_topics_used.join(', ')}` : (projectScope || projectData?.description)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="glass-card rounded-xl p-6">
                                    <h3 className="text-lg font-bold mb-4">Core Concepts</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {coreConceptsUsed && coreConceptsUsed.length > 0 ? (
                                            coreConceptsUsed.map((c, i) => <Badge key={i} variant="outline" className="px-3 py-1">{c}</Badge>)
                                        ) : <span className="text-muted-foreground italic">Standard Concepts</span>}
                                    </div>
                                </div>

                                <div className="glass-card rounded-xl p-6">
                                    <h3 className="text-lg font-bold mb-4">Learning Outcomes</h3>
                                    <ul className="list-disc pl-4 space-y-2 text-sm text-muted-foreground marker:text-primary">
                                        {expectedLearningOutcomes && expectedLearningOutcomes.length > 0 ? (
                                            expectedLearningOutcomes.map((l, i) => <li key={i}>{l}</li>)
                                        ) : <li>Full Stack Proficiency</li>}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="architecture" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="glass-card rounded-xl p-6">
                                <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                                    <Layers className="text-primary" /> System Architecture
                                </h3>
                                <div className="prose dark:prose-invert text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    <p>{architectureOverview || "No detailed architecture provided."}</p>
                                </div>
                            </div>

                            <div className="glass-card rounded-xl p-6 border-red-500/20 bg-red-500/5">
                                <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-red-600 dark:text-red-400">
                                    <ShieldAlert /> Risks & Challenges
                                </h3>
                                <div className="prose dark:prose-invert text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                    <p>{risksChallenges || "No risks identified."}</p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="business" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                         <div className="glass-card rounded-xl p-6">
                            <h3 className="text-xl font-bold mb-6">Evaluation Criteria & Business Value</h3>
                            <div className="grid gap-8 md:grid-cols-3">
                                <div>
                                    <h4 className="font-bold text-primary mb-2">Problem Statement</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{problemStatement || "N/A"}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-primary mb-2">Real World Application</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{realWorldApplication || "N/A"}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-primary mb-2">Success Metrics</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{evaluationCriteria || "N/A"}</p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>


                {/* Completion Modal */}
                <Dialog open={showCompletion} onOpenChange={setShowCompletion}>
                    <DialogContent className="max-w-3xl glass-card border-none shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent pb-2">🎉 Project Completed!</DialogTitle>
                            <DialogDescription className="text-center text-lg">
                                Excellent work! You've mastered this project. Here are your rewards.
                            </DialogDescription>
                        </DialogHeader>

                        {generatedAssets && (
                            <div className="grid gap-6 py-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-primary" /> Resume Bullet Points
                                        </h3>
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            onClick={() => copyToClipboard(generatedAssets.resumeBullets?.join('\n'), 'resume')}
                                            className="h-8 text-xs gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors"
                                        >
                                            {copiedField === 'resume' ? <><CheckCircle2 className="h-3 w-3 text-green-500" /> Copied</> : <><Copy className="h-3 w-3" /> Copy to Clipboard</>}
                                        </Button>
                                    </div>
                                    <div className="bg-muted/50 p-4 rounded-xl text-sm border border-border/50 text-foreground shadow-inner">
                                        <ul className="list-disc pl-4 space-y-2">
                                            {generatedAssets.resumeBullets?.map((b, i) => <li key={i}>{b}</li>) || <li>No bullets generated</li>}
                                        </ul>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-blue-500" /> LinkedIn Post
                                        </h3>
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            onClick={() => copyToClipboard(generatedAssets.linkedInPost, 'linkedin')}
                                            className="h-8 text-xs gap-1.5 hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
                                        >
                                            {copiedField === 'linkedin' ? <><CheckCircle2 className="h-3 w-3 text-green-500" /> Copied</> : <><Copy className="h-3 w-3" /> Copy to Clipboard</>}
                                        </Button>
                                    </div>
                                    <div className="bg-muted/50 p-4 rounded-xl text-sm whitespace-pre-wrap border border-border/50 text-foreground min-h-[100px] shadow-inner font-medium">
                                        {generatedAssets.linkedInPost || "No post generated"}
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="sm:justify-center">
                            <Button onClick={() => setShowCompletion(false)} size="lg" className="px-8 shadow-lg">Close & Continue</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
