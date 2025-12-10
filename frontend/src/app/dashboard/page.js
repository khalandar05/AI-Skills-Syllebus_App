"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, LogOut, User } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        // Check local storage first for immediate render
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            router.push('/');
        }
    }, [router]);

    useEffect(() => {
        const fetchProjects = async () => {
            const token = localStorage.getItem('syllabus_auth_token');
            if (token) {
                try {
                    const res = await fetch('/api/projects', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setProjects(data.projects || []);
                    }
                } catch (e) {
                    console.error("Failed to fetch projects", e);
                }
            }

            // Fallback/Immediate check from local generation
            const local = localStorage.getItem('lastGeneratedProjects');
            if (local) {
                // If backend fetch was empty or pending, show local
                // Prioritize backend if available, but for now let's merge or show valid one
                // Simple: if state is empty, use local
                setProjects(prev => prev.length > 0 ? prev : JSON.parse(local));
            }
        };
        fetchProjects();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('syllabus_auth_token');
        router.push('/');
    };

    if (!user) return null;

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r hidden md:block">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-blue-600">SyllabusAI</h1>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <Button variant="ghost" className="w-full justify-start gap-2 bg-blue-50 text-blue-600">
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => router.push('/profile')}>
                        <User size={20} />
                        Profile
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => router.push('/resume')}>
                        <span className="text-xl">📄</span>
                        Resume Builder
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => router.push('/qa')}>
                        <span className="text-xl">❓</span>
                        Chapter Q&A
                    </Button>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Navbar */}
                <header className="h-16 bg-white border-b flex items-center justify-between px-8">
                    <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <img
                                src={user.profilePhoto || "https://ui-avatars.com/api/?name=User"}
                                alt="Profile"
                                className="w-8 h-8 rounded-full border border-gray-200"
                            />
                            <span className="font-medium text-gray-700">{user.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                            <LogOut size={20} className="text-gray-500 hover:text-red-500" />
                        </Button>
                    </div>
                </header>

                <main className="p-8 flex-1 overflow-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Welcome back, {user.name}!</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    Start by uploading your syllabus to generate a personalized learning path.
                                </p>
                                <Button className="mt-4 w-full" onClick={() => router.push('/syllabus')}>Upload Syllabus</Button>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Skills</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-4 text-gray-400">
                                    No skills tracked yet.
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="md:col-span-3">
                            <CardHeader>
                                <CardTitle>Active Projects ({projects.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {projects.length === 0 ? (
                                    <div className="text-center py-4 text-gray-400">
                                        No active projects.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {projects.map((project, i) => (
                                            <div key={project.id || i} className="border rounded-lg p-4 hover:shadow-md transition bg-white">
                                                <h3 className="font-semibold text-lg">{project.title}</h3>
                                                <p className="text-sm text-gray-500 line-clamp-2 mt-1">{project.description}</p>
                                                <div className="flex gap-2 mt-3">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${project.difficulty === 'BEGINNER' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {project.difficulty}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
