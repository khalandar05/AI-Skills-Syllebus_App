"use client"

import { LayoutDashboard, User, FileText, CheckSquare, Sparkles, LogOut, Code2, BookOpen, Mic, Linkedin, ExternalLink, Award, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();

    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { label: 'My Projects', icon: Code2, href: '/projects' },
        { label: 'Certificates', icon: Award, href: '/certificates' },
        { label: 'Portfolio', icon: User, href: '/portfolio' },
        { label: 'Resume Builder', icon: FileText, href: '/resume' }, 
        { label: 'Mock Interview', icon: Mic, href: '/mock-interview' },
        { label: 'LinkedIn Post', icon: Linkedin, href: '/linkedin/post' },
    ];

    const externalItems = [
         { label: 'Campus360', icon: ExternalLink, href: 'https://campus360-ai-hmdp.vercel.app/login' },
    ];

    return (
        <motion.aside 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-72 hidden md:flex flex-col h-[calc(100vh-2rem)] m-4 rounded-3xl sticky top-4 z-40 glass-panel border border-white/10"
        >
            {/* HUD Header */}
            <div className="flex items-center gap-3 cursor-pointer group p-6 border-b border-white/5" onClick={() => router.push('/dashboard')}>
                <div className="relative h-12 w-12 rounded-xl bg-cosmic-indigo flex items-center justify-center border border-plasma-cyan/30 shadow-[0_0_15px_rgba(34,211,238,0.2)] group-hover:scale-105 transition-transform overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-plasma-cyan/20 to-transparent opacity-50" />
                        <Sparkles className="h-6 w-6 text-plasma-cyan relative z-10" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-widest text-white font-heading uppercase">Career<span className="text-plasma-cyan">Forge</span></h1>
                    <div className="flex items-center gap-2">
                         <div className="h-1.5 w-1.5 rounded-full bg-aurora-green animate-pulse" />
                         <span className="text-[10px] font-mono text-plasma-cyan tracking-widest">SYSTEM ONLINE</span>
                    </div>
                </div>
            </div>
            
            {/* Navigation HUD */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                <div className="mb-4 px-3 text-[10px] font-bold text-plasma-cyan/50 uppercase tracking-[0.2em] font-mono border-l-2 border-plasma-cyan/20 pl-2">
                    Command Deck
                </div>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Button
                            key={item.href}
                            variant="ghost"
                            className={`w-full justify-start gap-4 h-12 px-4 text-sm font-medium transition-all duration-300 rounded-xl mb-1 relative overflow-hidden group/btn ${
                                isActive 
                                ? 'bg-plasma-cyan/10 text-plasma-cyan border border-plasma-cyan/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5 hover:border hover:border-white/10'
                            }`}
                            onClick={() => router.push(item.href)}
                        >
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-plasma-cyan shadow-[0_0_10px_#22D3EE]" />}
                            <item.icon size={18} className={isActive ? 'text-plasma-cyan drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'text-slate-500 group-hover/btn:text-white transition-colors'} />
                            <span className="relative z-10 tracking-wide">{item.label}</span>
                        </Button>
                    );
                })}

                <div className="mt-8 mb-4 px-3 text-[10px] font-bold text-plasma-cyan/50 uppercase tracking-[0.2em] font-mono border-l-2 border-plasma-cyan/20 pl-2">
                    Uplink
                </div>
                    {externalItems.map((item) => (
                    <Button
                        key={item.href}
                        variant="ghost"
                        className="w-full justify-start gap-4 h-12 px-4 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300 rounded-xl mb-1 group/btn"
                        onClick={() => window.open(item.href, '_blank')}
                    >
                        <item.icon size={18} className="text-slate-500 group-hover/btn:text-white" />
                        <span className="tracking-wide">{item.label}</span>
                    </Button>
                ))}
            </nav>

            {/* User Profile Module */}
            <div className="p-4 m-2 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-md">
                <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 text-slate-300 hover:bg-white/5 hover:text-white h-auto py-3 px-2 transition-all rounded-xl"
                    onClick={() => router.push('/profile')}
                >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold ring-2 ring-black relative">
                        <User size={18} />
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-aurora-green border-2 border-black rounded-full" />
                    </div>
                    <div className="flex flex-col items-start text-xs overflow-hidden">
                        <span className="font-bold text-white tracking-wide truncate w-full text-left">OPERATOR</span>
                        <span className="text-[10px] text-plasma-cyan/70 font-mono">LEVEL 1 ACCESS</span>
                    </div>
                    <Settings className="ml-auto h-4 w-4 opacity-50 hover:opacity-100 hover:text-plasma-cyan transition-opacity" />
                </Button>
            </div>
        </motion.aside>
    );
}

