"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dash-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Linkedin, Sparkles, Send, History, Image as ImageIcon, Globe, MoreHorizontal, ThumbsUp, MessageSquare, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function LinkedInPostPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [status, setStatus] = useState(null);

    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            const token = localStorage.getItem('syllabus_auth_token');
            if (!token) return router.push('/auth/login');

            try {
                const res = await fetch('/api/auth/linkedin/status', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                setIsConnected(data.connected);
                
                // Also fetch profile for name/image
                const profileRes = await fetch('/api/user/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const profileData = await profileRes.json();
                if (profileData.success) setUser(profileData.user);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        checkStatus();
    }, [router]);

    const handleConnect = () => {
        window.location.href = '/api/auth/linkedin/auth';
    };

    const handleGenerate = async () => {
        setGenerating(true);
        setStatus(null);
        try {
           const token = localStorage.getItem('syllabus_auth_token');
           const res = await fetch('/api/auth/linkedin/generate', { 
               method: 'POST',
               headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
               body: JSON.stringify({ topic: "General Update" })
           });
           const data = await res.json();
           if(data.success) {
               setContent(data.content);
           } else {
               setStatus({ type: 'error', message: 'Failed to generate post.' });
           }
        } catch (e) {
            setStatus({ type: 'error', message: 'Error generating post.' });
        }
        setGenerating(false);
    };

    const handlePublish = async () => {
        if (!content && !image) return;
        setPublishing(true);
        setStatus(null);
        const token = localStorage.getItem('syllabus_auth_token');

        try {
            const formData = new FormData();
            formData.append('content', content);
            if (image) {
                formData.append('image', image);
            }

            const res = await fetch('/api/auth/linkedin/publish', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setStatus({ type: 'success', message: 'Post published successfully!' });
                setContent('');
                setImage(null);
                setPreview(null);
            } else {
                setStatus({ type: 'error', message: data.error || 'Failed to publish.' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'An error occurred.' });
        } finally {
            setPublishing(false);
        }
    };

    if (loading) return (
        <DashboardLayout title="LinkedIn Post">
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="animate-spin text-primary w-10 h-10" />
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout title="LinkedIn Creator">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-12">
                
                {status && (
                    <div className={`p-4 rounded-xl border flex items-center gap-3 ${status.type === 'error' ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'}`}>
                        <div className={`w-2 h-2 rounded-full ${status.type === 'error' ? 'bg-destructive' : 'bg-emerald-600'}`} />
                        <p className="font-medium">{status.message}</p>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Editor Column */}
                    <div className="w-full lg:w-1/2 space-y-6">
                        <Card className="border-border/60 shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/20 border-b border-border/40">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-[#0077b5]/10 text-[#0077b5] border-[#0077b5]/20 px-2 py-0.5 rounded-md hover:bg-[#0077b5]/20">
                                        <Linkedin size={14} className="mr-1" /> LinkedIn
                                    </Badge>
                                    Creator Studio
                                </CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => router.push('/linkedin/history')} className="text-xs text-muted-foreground hover:text-foreground">
                                    <History className="mr-2 w-3 h-3" /> History
                                </Button>
                            </CardHeader>
                        
                            <CardContent className="p-6 space-y-6">
                                {!isConnected ? (
                                    <div className="text-center py-16 space-y-6">
                                        <div className="p-6 rounded-full bg-blue-50 dark:bg-blue-900/20 inline-block shadow-inner ring-1 ring-blue-100 dark:ring-blue-900/50">
                                            <Linkedin size={48} className="text-[#0077b5]" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-xl">Connect your Profile</h3>
                                            <p className="text-muted-foreground max-w-xs mx-auto text-sm">Authorize CareerForge AI to publish posts directly to your LinkedIn feed.</p>
                                        </div>
                                        <Button onClick={handleConnect} className="bg-[#0077b5] hover:bg-[#006097] text-white px-8 h-12 text-base font-bold shadow-lg shadow-blue-500/20 rounded-full">
                                            Connect LinkedIn
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Post Content</label>
                                            <div className="relative">
                                                <Textarea 
                                                    placeholder="What do you want to talk about?" 
                                                    className="min-h-[240px] text-base p-4 resize-none bg-background/50 border-border/50 focus:border-primary/50 rounded-xl leading-relaxed shadow-inner"
                                                    value={content}
                                                    onChange={(e) => setContent(e.target.value)}
                                                />
                                                <Button 
                                                    size="sm" 
                                                    variant="secondary" 
                                                    className="absolute bottom-4 right-4 text-xs h-8 bg-background/80 backdrop-blur border border-border/50 shadow-sm hover:text-primary transition-colors"
                                                    onClick={handleGenerate}
                                                    disabled={generating}
                                                >
                                                    {generating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1 text-primary" />}
                                                    AI Draft
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <label className="cursor-pointer group flex items-center gap-3 px-4 py-3 bg-muted/30 border border-border/50 rounded-xl hover:bg-muted/50 transition-all flex-1 border-dashed hover:border-primary/40">
                                                    <div className="p-2 bg-background rounded-lg text-primary shadow-sm group-hover:scale-105 transition-transform"><ImageIcon size={18} /></div>
                                                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                                        {image ? "Change Media" : "Add Photo / Media"}
                                                    </span>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        className="hidden" 
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if(file) {
                                                                setImage(file);
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => setPreview(reader.result);
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                                {image && (
                                                    <Button variant="ghost" size="icon" onClick={() => { setImage(null); setPreview(null); }} className="text-destructive hover:bg-destructive/10 rounded-xl">
                                                        <span className="sr-only">Remove</span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="pt-4 border-t border-border/50">
                                            <Button 
                                                onClick={handlePublish} 
                                                disabled={(!content && !image) || publishing}
                                                className="w-full bg-[#0077b5] hover:bg-[#006097] text-white h-12 text-base font-bold shadow-lg shadow-blue-500/20 rounded-xl transition-all hover:scale-[1.01]"
                                            >
                                                {publishing ? <Loader2 className="animate-spin mr-2 w-5 h-5" /> : <Send className="mr-2 w-5 h-5" />}
                                                Post to LinkedIn
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Preview Column */}
                    <div className="w-full lg:w-1/2">
                        <div className="sticky top-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 ml-1 flex items-center gap-2">
                                <Globe className="w-3 h-3" /> Live Preview
                            </h3>
                            
                            {/* Realistic LinkedIn Card */}
                            <div className="bg-background rounded-xl border border-border/60 shadow-xl overflow-hidden max-w-[550px] mx-auto md:mx-0">
                                {/* Header */}
                                <div className="p-4 flex gap-3">
                                    <Avatar className="h-12 w-12 border border-border">
                                        <AvatarImage src={user?.image} alt={user?.name || "User"} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{user?.name?.[0] || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-sm text-foreground truncate">{user?.name || "Your Name"}</h4>
                                                <p className="text-xs text-muted-foreground truncate">{user?.jobTitle || "Software Engineer"}</p>
                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                                                    <span>1h • Edited • </span> <Globe className="w-2.5 h-2.5" />
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="px-4 pb-2">
                                     <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                                        {content || <span className="text-muted-foreground italic">Start typing to preview your post...</span>}
                                     </p>
                                      {content && (
                                        <button className="text-muted-foreground text-xs font-semibold mt-1 hover:text-primary hover:underline">...see more</button>
                                    )}
                                </div>

                                {/* Image */}
                                {preview ? (
                                    <div className="mt-2 w-full bg-muted/20">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={preview} alt="Post content" className="w-full h-auto max-h-[500px] object-contain" />
                                    </div>
                                ) : (
                                    image ? (
                                        <div className="mt-2 w-full h-64 bg-muted/20 flex items-center justify-center text-muted-foreground animate-pulse">
                                            <ImageIcon className="w-8 h-8 opacity-50" />
                                        </div>
                                    ) : null
                                )}

                                {/* Social Counts */}
                                <div className="px-4 py-2 flex items-center justify-between text-xs text-muted-foreground border-b border-border/40 mt-1">
                                    <div className="flex items-center gap-1">
                                        <div className="flex -space-x-1">
                                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center border border-background">
                                                <ThumbsUp className="w-2 h-2 text-white fill-current" />
                                            </div>
                                        </div>
                                        <span>72</span>
                                    </div>
                                    <span>2 comments • 1 repost</span>
                                </div>

                                {/* Actions */}
                                <div className="px-2 py-1 flex items-center justify-between">
                                    <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground hover:bg-muted/50 rounded-lg py-4 group h-auto">
                                        <ThumbsUp className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                                        <span className="text-sm font-medium">Like</span>
                                    </Button>
                                    <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground hover:bg-muted/50 rounded-lg py-4 group h-auto">
                                        <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                                        <span className="text-sm font-medium">Comment</span>
                                    </Button>
                                    <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground hover:bg-muted/50 rounded-lg py-4 group h-auto">
                                        <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                                        <span className="text-sm font-medium">Repost</span>
                                    </Button>
                                    <Button variant="ghost" className="flex-1 gap-2 text-muted-foreground hover:bg-muted/50 rounded-lg py-4 group h-auto">
                                        <Send className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                                        <span className="text-sm font-medium">Send</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
