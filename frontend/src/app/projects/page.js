"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowRight, Code2, RefreshCcw } from 'lucide-react';

export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [source, setSource] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setLoading(true);
        // Try to get from LocalStorage (passed from Syllabus upload)
        const stored = localStorage.getItem('generatedProjects');
        const storedSource = localStorage.getItem('syllabusSource');

        if (stored) {
            try {
                setProjects(JSON.parse(stored));
                setSource(storedSource || 'Uploaded Syllabus');
                setLoading(false);
                return;
            } catch (e) { console.error(e); }
        }

        // Fallback: Default Fetch
        await fetchDefaultProjects();
        setSource('Common Favorites');
        setLoading(false);
    };

    const fetchDefaultProjects = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/projects/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: 'Full Stack Development', techStack: ['React', 'Node'] })
            });
            const data = await res.json();
            if (data.success && data.projects) {
                setProjects(data.projects);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="container mx-auto p-10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Your Projects</h1>
                    <p className="text-gray-500">Based on: <span className="font-semibold text-blue-600">{source}</span></p>
                </div>
                <Button variant="outline" onClick={() => { localStorage.removeItem('generatedProjects'); loadProjects(); }}>
                    <RefreshCcw className="w-4 h-4 mr-2" /> Reset / Refresh
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <p className="text-xl text-gray-400">Loading AI suggestions...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.length === 0 && <p>No projects found.</p>}
                    {projects.map((project, idx) => (
                        <Card key={idx} className="hover:shadow-lg transition-shadow border-t-4 border-t-blue-500">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <Badge variant={project.difficulty === 'BEGINNER' ? 'secondary' : 'default'} className="mb-2">
                                        {project.difficulty}
                                    </Badge>
                                </div>
                                <CardTitle className="text-xl">{project.title}</CardTitle>
                                <CardDescription className="line-clamp-3 mt-2">{project.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {project.techStack && (Array.isArray(project.techStack) ? project.techStack : project.techStack.split(',')).map((t, i) => (
                                        <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{t}</span>
                                    ))}
                                </div>
                                <Link href={`/projects/${idx}?title=${encodeURIComponent(project.title)}&description=${encodeURIComponent(project.description)}&techStack=${encodeURIComponent(Array.isArray(project.techStack) ? project.techStack.join(',') : project.techStack)}&roadmap=${encodeURIComponent(typeof project.roadmap === 'string' ? project.roadmap : JSON.stringify(project.roadmap || []))}`}>
                                    <Button className="w-full">
                                        View Workspace <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
