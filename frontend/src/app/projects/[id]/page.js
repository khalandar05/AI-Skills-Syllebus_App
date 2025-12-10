"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { CheckCircle2, Github, ArrowLeft, ArrowRight, Copy } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export default function ProjectWorkspace({ params }) {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Data from URL
    const title = searchParams.get('title') || 'Project Workspace';
    const description = searchParams.get('description') || '';
    const techStack = searchParams.get('techStack') ? searchParams.get('techStack').split(',') : [];

    // Parse Roadmap from URL (or default)
    // Parse Roadmap from URL (or default)
    let initialRoadmap = [
        { task: "Initialize Project Repo", status: "TODO" },
        { task: "Setup Development Environment", status: "TODO" },
        { task: "Implement Core Logic", status: "TODO" }
    ];

    try {
        const rawRoadmap = searchParams.get('roadmap');
        if (rawRoadmap) {
            const decoded = decodeURIComponent(rawRoadmap);
            // Check if it looks like JSON array
            if (decoded.trim().startsWith('[')) {
                initialRoadmap = JSON.parse(decoded);
            } else {
                // If it's just a string, wrap it as a single task
                initialRoadmap = [{ task: decoded, status: "TODO" }];
            }
        }
    } catch (e) {
        console.error("Failed to parse roadmap:", e);
    }

    const [tasks, setTasks] = useState(initialRoadmap);
    const [showCompletion, setShowCompletion] = useState(false);
    const [generatedAssets, setGeneratedAssets] = useState(null);

    const moveTask = (taskIndex, newStatus) => {
        const newTasks = [...tasks];
        newTasks[taskIndex].status = newStatus;
        setTasks(newTasks);
    };

    const handleComplete = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        // Mock Generation of Resume/LinkedIn assets
        setGeneratedAssets({
            resume: [
                `Built a ${title} using ${techStack.join(', ')} to solve real-world problems.`,
                `Implemented scalable architecture handling complex data flows.`,
                `Optimized performance by 30% using modern best practices.`
            ],
            linkedin: `🚀 Just finished building ${title}! \n\nIt was a challenging journey learning ${techStack.join(' and ')}. Check out the code below! #coding #developer #project`,
            readme: `# ${title}\n\n## Description\n${description}\n\n## Tech Stack\n- ${techStack.join('\n- ')}`
        });

        setShowCompletion(true);
    };

    const TaskCard = ({ task, index }) => (
        <Card className="mb-2 p-3 bg-white shadow-sm hover:shadow-md cursor-pointer transition-all" onClick={() => {
            if (task.status === 'TODO') moveTask(index, 'IN_PROGRESS');
            if (task.status === 'IN_PROGRESS') moveTask(index, 'DONE');
        }}>
            <p className="font-medium text-sm">{task.task}</p>
            <p className="text-xs text-gray-400 mt-2">
                {task.status === 'TODO' ? 'Click to Start ->' : task.status === 'IN_PROGRESS' ? 'Click to Finish ->' : 'Completed'}
            </p>
        </Card>
    );

    return (
        <div className="container mx-auto p-10">
            <Link href="/projects" className="flex items-center text-sm text-gray-500 mb-4 hover:text-blue-600">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
            </Link>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">{title}</h1>
                    <p className="text-gray-500 max-w-2xl mt-2">{description}</p>
                    <div className="flex gap-2 mt-4">
                        {techStack.map(t => (
                            <Badge key={t} variant="secondary">{t.trim()}</Badge>
                        ))}
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline">
                        <Github className="w-4 h-4 mr-2" /> Link Repo
                    </Button>
                    <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Complete
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
                {/* TODO */}
                <Card className="bg-gray-50 flex flex-col">
                    <CardHeader><CardTitle className="text-sm uppercase text-gray-500">To Do</CardTitle></CardHeader>
                    <CardContent className="flex-1 overflow-auto">
                        {tasks.filter(t => t.status === 'TODO' || !t.status).map((t, i) => (
                            <TaskCard key={i} task={t} index={tasks.indexOf(t)} />
                        ))}
                    </CardContent>
                </Card>

                {/* IN PROGRESS */}
                <Card className="bg-blue-50/50 flex flex-col">
                    <CardHeader><CardTitle className="text-sm uppercase text-blue-500">In Progress</CardTitle></CardHeader>
                    <CardContent className="flex-1 overflow-auto">
                        {tasks.filter(t => t.status === 'IN_PROGRESS').map((t, i) => (
                            <TaskCard key={i} task={t} index={tasks.indexOf(t)} />
                        ))}
                        {tasks.filter(t => t.status === 'IN_PROGRESS').length === 0 &&
                            <p className="text-sm text-gray-400 text-center italic mt-10">Select a task from Todo to start</p>
                        }
                    </CardContent>
                </Card>

                {/* DONE */}
                <Card className="bg-green-50/50 flex flex-col">
                    <CardHeader><CardTitle className="text-sm uppercase text-green-600">Done</CardTitle></CardHeader>
                    <CardContent className="flex-1 overflow-auto">
                        {tasks.filter(t => t.status === 'DONE').map((t, i) => (
                            <TaskCard key={i} task={t} index={tasks.indexOf(t)} />
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Completion Modal */}
            <Dialog open={showCompletion} onOpenChange={setShowCompletion}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>🎉 Project Completed!</DialogTitle>
                        <DialogDescription>
                            Great job! Here are your generated assets to showcase your work.
                        </DialogDescription>
                    </DialogHeader>

                    {generatedAssets && (
                        <div className="grid gap-6 py-4">
                            <div className="space-y-2">
                                <h3 className="font-semibold text-sm">Resume Bullet Points</h3>
                                <div className="bg-slate-100 p-4 rounded-md text-sm font-mono relative group">
                                    <Button size="icon" variant="ghost" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-6 w-6">
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {generatedAssets.resume.map((b, i) => <li key={i}>{b}</li>)}
                                    </ul>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-semibold text-sm">LinkedIn Post</h3>
                                <div className="bg-slate-100 p-4 rounded-md text-sm whitespace-pre-wrap relative group">
                                    <Button size="icon" variant="ghost" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-6 w-6">
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                    {generatedAssets.linkedin}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setShowCompletion(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
