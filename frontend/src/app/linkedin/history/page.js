"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dash-layout';
import { Button } from '@/components/ui/button';
import { Loader2, Linkedin, ArrowLeft, Calendar, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function LinkedInHistoryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    useEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem('syllabus_auth_token');
            if (!token) return router.push('/auth/login');

            try {
                const res = await fetch('/api/auth/linkedin/history', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setPosts(data.posts);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [router]);

    if (loading) return (
        <DashboardLayout title="Post History">
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="animate-spin text-primary w-10 h-10" />
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout title="LinkedIn History">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-12">
                <div className="flex items-center justify-between">
                     <h2 className="text-3xl font-heading font-bold track-tight">Published Posts</h2>
                    <Button variant="outline" onClick={() => router.push('/linkedin/post')} className="text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-2 w-4 h-4" /> Back to Creator
                    </Button>
                </div>

                <div className="grid gap-6">
                    {posts.length === 0 ? (
                        <Card className="text-center py-20 border-dashed border-2 border-border/60 bg-muted/5">
                            <CardContent>
                                <div className="text-muted-foreground/30 mb-6">
                                    <Linkedin size={64} className="mx-auto" />
                                </div>
                                <p className="text-muted-foreground font-medium mb-6 text-lg">The archives are empty. Go make some noise.</p>
                                <Button className="h-12 px-8 text-base font-bold bg-[#0077b5] hover:bg-[#006097] text-white shadow-lg shadow-blue-500/20" onClick={() => router.push('/linkedin/post')}>
                                    Create First Post
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        posts.map((post) => (
                            <Card key={post.id} className="hover:shadow-md transition-all duration-300 group overflow-hidden border-l-4 border-l-[#0077b5]">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(post.publishedAt).toLocaleDateString()} at {new Date(post.publishedAt).toLocaleTimeString()}
                                        </div>
                                        <Badge variant="outline" className="bg-[#0077b5]/10 text-[#0077b5] border-[#0077b5]/30">
                                            <Linkedin className="w-3 h-3 mr-1" /> Published
                                        </Badge>
                                    </div>
                                    
                                    <div className="prose dark:prose-invert max-w-none mb-6">
                                        <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">{post.content}</p>
                                    </div>
                                    
                                    {post.linkedinPostId && (
                                        <div className="pt-4 border-t border-border/40 flex justify-end">
                                            <a 
                                                href={`https://www.linkedin.com/feed/update/${post.linkedinPostId}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-sm font-semibold text-[#0077b5] hover:text-[#006097] flex items-center transition-colors px-4 py-2 rounded-lg hover:bg-[#0077b5]/10"
                                            >
                                                View Live on LinkedIn <ExternalLink size={14} className="ml-2" />
                                            </a>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
