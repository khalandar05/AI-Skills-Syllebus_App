"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NeonButton } from '@/components/ui/neon-button';
import { HolographicCard } from '@/components/ui/holographic-card';
import { Sparkles, Loader2, KeyRound, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Simulate API call for demo (replace with actual auth logic)
        // In a real app, this would hit your backend
        try {
            // Mock delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Mock success
            localStorage.setItem('user', JSON.stringify({ name: 'Pilot', email: email }));
            localStorage.setItem('syllabus_auth_token', 'mock_token_xyz');
            router.push('/dashboard');
            
        } catch (err) {
            setError('Authentication Failed. Credentials rejected by mainframe.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements are handled by layout's SpaceBackground, but we can add specific glows here */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-plasma-cyan/10 rounded-full blur-[100px] pointer-events-none" />

            <HolographicCard className="w-full max-w-md p-8 md:p-10 border-t border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-plasma-cyan to-transparent opacity-50" />
                
                <div className="mb-8 text-center">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-space-black/50 border border-plasma-cyan/30 shadow-[0_0_20px_rgba(34,211,238,0.2)] mb-6 group">
                        <Sparkles className="h-8 w-8 text-plasma-cyan group-hover:rotate-12 transition-transform" />
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-white tracking-wide uppercase mb-2">
                        System Access
                    </h1>
                    <p className="text-slate-400 font-light">
                        Enter credentials to unlock mission control.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-sm">
                        <AlertCircle className="h-5 w-5" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-mono uppercase tracking-widest text-slate-500 ml-1">Identity // Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-plasma-cyan transition-colors" />
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-plasma-cyan/50 focus:ring-1 focus:ring-plasma-cyan/50 transition-all font-sans"
                                placeholder="pilot@careerforge.ai"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                         <label className="text-xs font-mono uppercase tracking-widest text-slate-500 ml-1">Security Key // Password</label>
                         <div className="relative group">
                            <KeyRound className="absolute left-3 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-plasma-cyan transition-colors" />
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-plasma-cyan/50 focus:ring-1 focus:ring-plasma-cyan/50 transition-all font-sans"
                                placeholder="••••••••••••"
                            />
                        </div>
                    </div>

                    <div className="1 pt-4">
                        <NeonButton 
                            className="w-full h-12 text-lg group" 
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" /> Verifying...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Authenticate <ArrowLeft className="h-5 w-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </NeonButton>
                    </div>
                </form>
                
                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-500">
                        Top clearance? 
                        <Link href="/auth/register" className="text-plasma-cyan hover:text-white ml-2 transition-colors font-bold tracking-wide uppercase text-xs">
                            Initialize Account
                        </Link>
                    </p>
                </div>
            </HolographicCard>
        </div>
    );
}
