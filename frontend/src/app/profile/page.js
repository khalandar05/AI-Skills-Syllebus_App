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
        <DashboardLayout title="Personnel Record">
            <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
                <Loader2 className="animate-spin text-plasma-cyan w-12 h-12" />
                <div className="text-xs font-mono text-plasma-cyan uppercase tracking-widest animate-pulse">Decrypting Personnel File...</div>
            </div>
        </DashboardLayout>
    );

    if (!user) return null;

    return (
        <DashboardLayout title="Personnel Record">
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-1000">
                
                {/* Profile Header Card */}
                <HolographicCard className="p-0 overflow-hidden relative group border-white/10">
                    {/* Cover Image - Dynamic Space Gradient */}
                    <div className="h-64 bg-gradient-to-r from-cosmic-indigo via-nebula-purple to-space-black relative overflow-hidden">
                         <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 mix-blend-overlay" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                         
                         {/* Animated particles or glow */}
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-plasma-cyan/20 blur-[100px] rounded-full animate-pulse-glow" />

                         <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                             <NeonButton size="sm" variant="ghost" className="backdrop-blur-md bg-black/20 hover:bg-black/40 text-white border-white/20" onClick={() => router.push('/profile/edit')}>
                                 <Camera className="w-4 h-4 mr-2" /> Update Banner
                             </NeonButton>
                         </div>
                    </div>

                    <div className="px-8 pb-8 relative">
                        <div className="flex flex-col md:flex-row items-end gap-8 -mt-24 relative z-10">
                            <div className="relative group/avatar">
                                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-plasma-cyan via-white to-nebula-purple opacity-75 blur-sm animate-spin-slow group-hover/avatar:opacity-100 transition-opacity duration-1000" />
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
                                        <AvatarFallback className="text-5xl font-heading font-bold bg-space-black text-plasma-cyan">{user.name?.charAt(0) || 'U'}</AvatarFallback>
                                    )}
                                </Avatar>
                                <div className="absolute bottom-2 right-2 z-20 opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                    <button 
                                        className="h-10 w-10 rounded-full bg-plasma-cyan text-black flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.5)] hover:scale-110 transition-transform"
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
                                    <p className="text-xl text-plasma-cyan font-mono tracking-widest uppercase">{user.role || "Cadet Pilot"}</p>
                                </div>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-400 text-sm font-mono">
                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/5 border border-white/5"><Mail className="w-3.5 h-3.5" /> {user.email}</span>
                                    {user.location && <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/5 border border-white/5"><MapPin className="w-3.5 h-3.5" /> {user.location}</span>}
                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/5 border border-white/5"><Calendar className="w-3.5 h-3.5" /> Active Since 2024</span>
                                </div>
                            </div>
                            
                            <NeonButton 
                                className="mb-4"
                                onClick={() => router.push('/profile/edit')}
                                variant="cyan"
                            >
                                <Edit className="w-4 h-4 mr-2" /> Modify Profile
                            </NeonButton>
                        </div>
                    </div>
                </HolographicCard>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column - Bio & Stats */}
                    <div className="md:col-span-2 space-y-6">
                        <HolographicCard className="p-8">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                                <User className="h-6 w-6 text-nebula-purple" />
                                <h2 className="text-xl font-heading font-bold text-white uppercase tracking-wider">Bio-Data</h2>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-lg font-light">
                                {user.bio || "No biography data available in the mainframe. Pilot has not yet synchronized their personal history log."}
                            </p>
                        </HolographicCard>

                        {/* Recent Activity */}
                         <HolographicCard className="p-8">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                                <Award className="h-6 w-6 text-solar-gold" />
                                <h2 className="text-xl font-heading font-bold text-white uppercase tracking-wider">Mission Log</h2>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-plasma-cyan/20 flex items-center justify-center text-plasma-cyan">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">System Initialization</p>
                                        <p className="text-xs text-slate-400">Account created & verified</p>
                                    </div>
                                    <span className="ml-auto text-xs font-mono text-slate-500">Today</span>
                                </div>
                                {/* Placeholder for more history */}
                            </div>
                        </HolographicCard>
                    </div>

                    {/* Right Column - Skills & Exp */}
                    <div className="space-y-6">
                         <HolographicCard className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Zap className="h-5 w-5 text-plasma-cyan" />
                                <h2 className="text-lg font-heading font-bold text-white uppercase tracking-wider">Skill Matrix</h2>
                            </div>
                             <div className="flex flex-wrap gap-2">
                                {user.skills ? user.skills.split(',').filter(Boolean).map((s, i) => (
                                    <span key={i} className="px-3 py-1.5 text-xs font-bold bg-plasma-cyan/10 text-plasma-cyan border border-plasma-cyan/30 rounded uppercase tracking-wider hover:bg-plasma-cyan/20 transition-colors cursor-default">
                                        {s.trim()}
                                    </span>
                                )) : (
                                    <span className="text-slate-500 text-sm italic">No skills calibrated.</span>
                                )}
                            </div>
                            <NeonButton variant="ghost" size="sm" className="w-full mt-6 text-xs" onClick={() => router.push('/profile/edit')}>
                                + Calibrate New Skill
                            </NeonButton>
                        </HolographicCard>

                        <HolographicCard className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Briefcase className="h-5 w-5 text-aurora-green" />
                                <h2 className="text-lg font-heading font-bold text-white uppercase tracking-wider">Service Record</h2>
                            </div>
                            <div className="space-y-6">
                                <div className="relative pl-6 border-l-2 border-white/10 pb-2">
                                    <div className="absolute top-1.5 -left-[5px] w-2.5 h-2.5 rounded-full bg-aurora-green shadow-[0_0_10px_#2DD4BF]" />
                                    <h4 className="font-bold text-sm text-white uppercase tracking-wide">Cadet Engineer</h4>
                                    <p className="text-xs font-mono text-aurora-green mb-1">Tech Corp // Internship</p>
                                    <p className="text-[10px] text-slate-500 font-mono">2023 - Present</p>
                                </div>
                                <div className="relative pl-6 border-l-2 border-white/10 pb-2">
                                    <div className="absolute top-1.5 -left-[5px] w-2.5 h-2.5 rounded-full bg-slate-500" />
                                    <h4 className="font-bold text-sm text-slate-300 uppercase tracking-wide">University Student</h4>
                                    <p className="text-xs font-mono text-slate-500 mb-1">CS Dept</p>
                                    <p className="text-[10px] text-slate-500 font-mono">2020 - 2024</p>
                                </div>
                                <NeonButton variant="ghost" size="sm" className="w-full text-xs text-slate-400 hover:text-white">View Full Log</NeonButton>
                            </div>
                        </HolographicCard>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
