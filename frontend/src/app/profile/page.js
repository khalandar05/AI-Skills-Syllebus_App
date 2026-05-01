"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { NeonButton } from '@/components/ui/neon-button';
import { HolographicCard } from '@/components/ui/holographic-card';
import { Loader2, Sparkles, Edit, Briefcase, Mail, User, MapPin, Calendar, Camera, Award, ShieldCheck, Zap } from 'lucide-react';
import { DashboardLayout } from '@/components/dash-layout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    const [error, setError] = useState(null);

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
                    } else {
                        setError(data.error || "Failed to load profile data");
                    }
                } else if (res.status === 403 || res.status === 401) {
                    setError("Session Expired");
                } else {
                    setError(`Server Error: ${res.status}`);
                }
            } catch (err) {
                console.error("Profile Fetch Error:", err);
                setError("Network error: Could not reach server");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    if (loading) return (
        <DashboardLayout title="Personnel Record">
            <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
                <Loader2 className="animate-spin text-primary w-12 h-12" />
                <div className="text-xs font-mono text-primary uppercase tracking-widest animate-pulse">Decrypting Personnel File...</div>
            </div>
        </DashboardLayout>
    );

    if (error === "Session Expired" || error?.includes("403")) return (
         <DashboardLayout title="Personnel Record">
            <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
                <div className="text-amber-500 font-bold font-heading text-xl">SESSION TERMINATED</div>
                <div className="text-muted-foreground">Security protocol requires re-authentication.</div>
                 <NeonButton onClick={() => {
                     localStorage.removeItem('syllabus_auth_token');
                     router.push('/auth/login');
                 }} variant="primary" glowColor="amber">
                    Re-Initialize Link
                </NeonButton>
            </div>
        </DashboardLayout>
    );

    if (error) return (
         <DashboardLayout title="Personnel Record">
            <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
                <div className="text-red-500 font-bold">ACCESS DENIED: {error}</div>
                 <NeonButton onClick={() => window.location.reload()} variant="primary" glowColor="red">
                    Retry Connection
                </NeonButton>
            </div>
        </DashboardLayout>
    );

    if (!user) return (
        <DashboardLayout title="Personnel Record">
            <div className="flex h-[50vh] items-center justify-center">
                 <div className="text-muted-foreground">No profile data found.</div>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout title="My Profile">
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-1000">
                
                {/* Profile Header Card */}
                <HolographicCard className="p-0 overflow-hidden relative group border-border">
                    {/* Cover Image - Dynamic Space Gradient */}
                    <div className="h-64 bg-gradient-to-r from-primary via-nebula-purple to-space-black relative overflow-hidden">
                         <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 mix-blend-overlay" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                         
                         {/* Animated particles or glow */}
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full animate-pulse-glow" />

                         <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                             <NeonButton size="sm" variant="ghost" className=" bg-black/20 hover:bg-black/40 text-white border-border" onClick={() => router.push('/profile/edit')}>
                                 <Camera className="w-4 h-4 mr-2" /> Update Banner
                             </NeonButton>
                         </div>
                    </div>

                    <div className="px-8 pb-8 relative">
                        <div className="flex flex-col md:flex-row items-end gap-8 -mt-24 relative z-10">
                            <div className="relative group/avatar">
                                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary via-white to-nebula-purple opacity-75 blur-sm animate-spin-slow group-hover/avatar:opacity-100 transition-opacity duration-1000" />
                                <Avatar className="w-44 h-44 border-4 border-black shadow-2xl rounded-full bg-black relative z-10">
                                     {user.image ? (
                                        <Image 
                                            src={user.image} 
                                            alt={user.name} 
                                            width={176} 
                                            height={176} 
                                            className="object-cover h-full w-full rounded-full"
                                        />
                                    ) : (
                                        <AvatarFallback className="text-5xl font-heading font-bold bg-space-black text-primary">{user.name?.charAt(0) || 'U'}</AvatarFallback>
                                    )}
                                </Avatar>
                                <div className="absolute bottom-2 right-2 z-20 opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                    <button 
                                        className="h-10 w-10 rounded-full bg-primary text-black flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.5)] hover:scale-110 transition-transform"
                                        onClick={() => router.push('/profile/edit')}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left mb-2 space-y-2">
                                <div>
                                    <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                                        <h1 className="text-4xl md:text-5xl font-heading font-bold text-white tracking-wide uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{user.name}</h1>
                                        <ShieldCheck className="h-6 w-6 text-aurora-green animate-pulse" />
                                    </div>
                                    <p className="text-xl text-primary font-mono tracking-widest uppercase">{user.role || "Software Engineer"}</p>
                                </div>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground text-sm font-mono">
                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-muted border border-border"><Mail className="w-3.5 h-3.5" /> {user.email}</span>
                                    {user.location && <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-muted border border-border"><MapPin className="w-3.5 h-3.5" /> {user.location}</span>}
                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-muted border border-border"><Calendar className="w-3.5 h-3.5" /> Active Since 2024</span>
                                </div>
                            </div>
                            
                            <NeonButton 
                                className="mb-4"
                                onClick={() => router.push('/profile/edit')}
                                variant="cyan"
                            >
                                <Edit className="w-4 h-4 mr-2" /> Edit Profile
                            </NeonButton>
                        </div>
                    </div>
                </HolographicCard>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column - Bio & Stats */}
                    <div className="md:col-span-2 space-y-6">
                        <HolographicCard className="p-8">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                                <User className="h-6 w-6 text-nebula-purple" />
                                <h2 className="text-xl font-heading font-bold text-white uppercase tracking-wider">About Me</h2>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-lg font-light">
                                {user.bio || "No biography available. Update your profile to share your professional background."}
                            </p>
                        </HolographicCard>

                        {/* Recent Activity */}
                         <HolographicCard className="p-8">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                                <Award className="h-6 w-6 text-solar-gold" />
                                <h2 className="text-xl font-heading font-bold text-white uppercase tracking-wider">Recent Activity</h2>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="p-4 rounded-xl bg-muted border border-border flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">Account Active</p>
                                        <p className="text-xs text-muted-foreground">Profile initialized and verified</p>
                                    </div>
                                    <span className="ml-auto text-xs font-mono text-muted-foreground">Today</span>
                                </div>
                                {/* Placeholder for more history */}
                            </div>
                        </HolographicCard>
                    </div>

                    {/* Right Column - Skills & Exp */}
                    <div className="space-y-6">
                         <HolographicCard className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Zap className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-heading font-bold text-white uppercase tracking-wider">Skills & Technologies</h2>
                            </div>
                             <div className="flex flex-wrap gap-2">
                                {user.skills ? user.skills.split(',').filter(Boolean).map((s, i) => (
                                    <span key={i} className="px-3 py-1.5 text-xs font-bold bg-primary/10 text-primary border border-primary/30 rounded uppercase tracking-wider hover:bg-primary/20 transition-colors cursor-default">
                                        {s.trim()}
                                    </span>
                                )) : (
                                    <span className="text-muted-foreground text-sm italic">No skills listed.</span>
                                )}
                            </div>
                            <NeonButton variant="ghost" size="sm" className="w-full mt-6 text-xs" onClick={() => router.push('/profile/edit')}>
                                + Add Skills
                            </NeonButton>
                        </HolographicCard>

                        <HolographicCard className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Briefcase className="h-5 w-5 text-aurora-green" />
                                <h2 className="text-lg font-heading font-bold text-white uppercase tracking-wider">Experience</h2>
                            </div>
                            <div className="space-y-6">
                                <div className="relative pl-6 border-l-2 border-border pb-2">
                                    <div className="absolute top-1.5 -left-[5px] w-2.5 h-2.5 rounded-full bg-aurora-green shadow-[0_0_10px_#2DD4BF]" />
                                    <h4 className="font-bold text-sm text-white uppercase tracking-wide">Software Engineer</h4>
                                    <p className="text-xs font-mono text-aurora-green mb-1">Tech Corp // Internship</p>
                                    <p className="text-[10px] text-muted-foreground font-mono">2023 - Present</p>
                                </div>
                                <div className="relative pl-6 border-l-2 border-border pb-2">
                                    <div className="absolute top-1.5 -left-[5px] w-2.5 h-2.5 rounded-full bg-slate-500" />
                                    <h4 className="font-bold text-sm text-slate-300 uppercase tracking-wide">University Student</h4>
                                    <p className="text-xs font-mono text-muted-foreground mb-1">CS Dept</p>
                                    <p className="text-[10px] text-muted-foreground font-mono">2020 - 2024</p>
                                </div>
                                <NeonButton variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-white">View Full History</NeonButton>
                            </div>
                        </HolographicCard>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
