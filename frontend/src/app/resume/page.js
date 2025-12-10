"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Briefcase, User as UserIcon } from 'lucide-react';

export default function ResumePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            fetchPortfolio();
        } else {
            router.push('/auth/login');
        }
    }, [router]);

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
            console.error(e);
        }
    };

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
                const err = await res.json();
                throw new Error(err.error || "Generation Failed");
            }

            const data = await res.json();
            setPortfolio(data.portfolio);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="p-10">Loading...</div>;

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4 gap-2">
                <ArrowLeft size={16} /> Back
            </Button>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        AI Portfolio & Resume Builder
                    </h1>
                    <p className="text-gray-500">Transform your learning journey into a professional profile.</p>
                </div>
                <Button onClick={handleGenerate} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                    <Sparkles className="mr-2" size={18} />
                    {loading ? 'Generating...' : 'Regenerate with AI'}
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                    Error: {error}
                </div>
            )}

            {!portfolio ? (
                <Card className="text-center py-10">
                    <CardContent>
                        <Briefcase className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-medium text-gray-700">No Portfolio Yet</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Upload a syllabus and generate some projects first, then let our AI write your professional bio.
                        </p>
                        <Button onClick={handleGenerate} disabled={loading}>
                            {loading ? 'Analyzing...' : 'Generate First Portfolio'}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {/* Header Card */}
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <img
                                src={user.profilePhoto || "https://ui-avatars.com/api/?name=User"}
                                alt="Profile"
                                className="w-20 h-20 rounded-full border-2 border-gray-100"
                            />
                            <div>
                                <CardTitle className="text-2xl">{user.name}</CardTitle>
                                <CardDescription className="text-lg text-blue-600 font-medium">
                                    {portfolio.jobTitle || "Aspiring Developer"}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-50 p-4 rounded-md italic text-gray-700 border-l-2 border-gray-300">
                                "{portfolio.bio}"
                            </div>
                        </CardContent>
                    </Card>

                    {/* Fun Fact & Skills */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader><CardTitle>Professional Summary</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-gray-600 leading-relaxed">
                                    {portfolio.summary}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Skills Detected</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {portfolio.skills?.split(',').map((skill, i) => (
                                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                            {skill.trim()}
                                        </span>
                                    )) || "No skills detected yet."}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-gradient-to-r from-purple-50 to-white border-none shadow-sm">
                        <CardContent className="pt-6 flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <span className="font-bold text-gray-700 block">Fun Fact</span>
                                <span className="text-gray-600">{portfolio.funFact}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
