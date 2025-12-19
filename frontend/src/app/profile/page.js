"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Edit, Briefcase, Mail, User, MapPin, Calendar, Camera, Award } from 'lucide-react';
import { DashboardLayout } from '@/components/dash-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('syllabus_auth_token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            try {
                const res = await fetch('/api/user/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setUser(data.user);
                    }
                }
            } catch (err) {
                console.error("Profile Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    if (loading) return (
        <DashboardLayout title="Profile">
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="animate-spin text-primary w-10 h-10" />
            </div>
        </DashboardLayout>
    );

    if (!user) return null;

    return (
        <DashboardLayout title="My Profile">
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                
                {/* Profile Header Card */}
                <div className="rounded-2xl overflow-hidden border border-border/50 bg-card shadow-xl relative group">
                    {/* Cover Image */}
                    <div className="h-56 bg-gradient-to-r from-indigo-600 via-primary to-purple-600 relative overflow-hidden">
                         <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30 mix-blend-overlay" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                         <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button size="sm" variant="secondary" className="backdrop-blur-md bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40" onClick={() => router.push('/profile/edit')}>
                                 <Camera className="w-4 h-4 mr-2" /> Change Cover
                             </Button>
                         </div>
                    </div>

                    <div className="px-8 pb-8">
                        <div className="flex flex-col md:flex-row items-end gap-8 -mt-20 relative z-10">
                            <div className="relative group/avatar">
                                <Avatar className="w-40 h-40 border-4 border-card shadow-2xl rounded-2xl bg-muted ring-4 ring-black/5">
                                     {user.image ? (
                                        <Image 
                                            src={user.image} 
                                            alt={user.name} 
                                            width={160} 
                                            height={160} 
                                            className="object-cover h-full w-full"
                                        />
                                    ) : (
                                        <AvatarFallback className="text-5xl font-heading font-bold bg-primary/10 text-primary">{user.name?.charAt(0) || 'U'}</AvatarFallback>
                                    )}
                                </Avatar>
                                <div className="absolute bottom-2 right-2 opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-lg" onClick={() => router.push('/profile/edit')}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left mb-2 space-y-2">
                                <div>
                                    <h1 className="text-4xl font-heading font-bold text-foreground tracking-tight">{user.name}</h1>
                                    <p className="text-lg text-muted-foreground font-medium">{user.role || "Software Engineering Student"}</p>
                                </div>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground text-sm">
                                    <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full"><Mail className="w-3.5 h-3.5" /> {user.email}</span>
                                    {user.location && <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full"><MapPin className="w-3.5 h-3.5" /> {user.location}</span>}
                                    <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full"><Calendar className="w-3.5 h-3.5" /> Class of 2025</span>
                                </div>
                            </div>
                            
                            <Button 
                                className="mb-4 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-full px-6 h-12 text-base"
                                onClick={() => router.push('/profile/edit')}
                            >
                                <Edit className="w-4 h-4 mr-2" /> Edit Profile
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column - About */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="premium-card border-none shadow-none">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-heading">
                                    <User className="h-5 w-5 text-indigo-600" /> About Me
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed text-lg">
                                    {user.bio || "I am a passionate software engineer looking to build impactful products. I specialize in full-stack development and AI integration."}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Recent Activity or Stats (Placeholder) */}
                         <Card className="premium-card border-none shadow-none">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-heading">
                                    <Award className="h-5 w-5 text-amber-500" /> Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center h-40 text-muted-foreground bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex-col gap-2">
                                    <Sparkles className="h-8 w-8 text-slate-300" />
                                    <span>No public activity recorded yet.</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Skills & Details */}
                    <div className="space-y-6">
                         <Card className="premium-card border-none shadow-none">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-heading">
                                    <Sparkles className="h-5 w-5 text-violet-500" /> Skills
                                </CardTitle>
                            </CardHeader>
                             <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {user.skills ? user.skills.split(',').filter(Boolean).map((s, i) => (
                                        <Badge key={i} variant="secondary" className="px-3 py-1.5 font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition-colors">
                                            {s.trim()}
                                        </Badge>
                                    )) : (
                                        <span className="text-muted-foreground text-sm italic">Add your top skills to showcase your expertise.</span>
                                    )}
                                </div>
                                <Button variant="outline" size="sm" className="w-full mt-6 border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-colors" onClick={() => router.push('/profile/edit')}>
                                    + Add New Skill
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="premium-card border-none shadow-none">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-heading">
                                    <Briefcase className="h-5 w-5 text-emerald-500" /> Experience
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    <div className="relative pl-6 border-l-2 border-indigo-100 dark:border-indigo-900 pb-1">
                                        <div className="absolute top-1.5 -left-[5px] w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-950" />
                                        <h4 className="font-bold text-base text-foreground">Software Engineer Intern</h4>
                                        <p className="text-sm font-medium text-indigo-600 mb-1">Tech Corp</p>
                                        <p className="text-xs text-muted-foreground">June 2023 - Present</p>
                                    </div>
                                    <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 pb-1">
                                        <div className="absolute top-1.5 -left-[5px] w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white dark:ring-slate-950" />
                                        <h4 className="font-bold text-base text-foreground">Computer Science Student</h4>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">University of Technology</p>
                                        <p className="text-xs text-muted-foreground">Aug 2020 - May 2024</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50">View Full Resume</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
