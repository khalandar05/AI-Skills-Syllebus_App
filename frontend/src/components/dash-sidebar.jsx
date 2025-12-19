"use client"

import { LayoutDashboard, User, FileText, CheckSquare, Sparkles, LogOut, Code2, BookOpen, Mic, Linkedin, ExternalLink, Award, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';

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
    ]

    return (
        <aside className="w-72 bg-card border-r border-border hidden md:flex flex-col h-screen sticky top-0 z-40">
            {/* Brand Header */}
            <div className="p-6 h-20 flex items-center border-b border-border/40">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/dashboard')}>
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                         <Sparkles className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground font-heading">CareerForge AI</h1>
                        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">PRO</span>
                    </div>
                </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
                <div className="mb-4 px-3 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest font-heading">
                    Platform
                </div>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Button
                            key={item.href}
                            variant="ghost"
                            className={`w-full justify-start gap-3 h-12 px-4 text-sm font-medium transition-all duration-200 rounded-xl mb-1 ${
                                isActive 
                                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25' 
                                : 'text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-foreground'
                            }`}
                            onClick={() => router.push(item.href)}
                        >
                            <item.icon size={20} className={isActive ? 'text-primary-foreground' : 'text-muted-foreground'} />
                            {item.label}
                        </Button>
                    );
                })}

                <div className="mt-10 mb-4 px-3 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest font-heading">
                    External
                </div>
                 {externalItems.map((item) => (
                    <Button
                        key={item.href}
                        variant="ghost"
                        className="w-full justify-start gap-3 h-12 px-4 text-sm font-medium text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-foreground transition-all duration-200 rounded-xl"
                        onClick={() => window.open(item.href, '_blank')}
                    >
                        <item.icon size={20} />
                        {item.label}
                    </Button>
                ))}

            </nav>

            {/* Footer / User */}
            <div className="p-6 border-t border-border/40 bg-slate-50/50 dark:bg-slate-900/20">
                <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 text-muted-foreground hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm h-auto py-3 px-3 transition-all border border-transparent hover:border-border rounded-xl"
                    onClick={() => router.push('/profile')}
                >
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                        <User size={16} />
                    </div>
                    <div className="flex flex-col items-start text-xs overflow-hidden">
                        <span className="font-semibold text-foreground truncate w-full text-left">My Account</span>
                        <span className="text-[10px] text-muted-foreground">Manage Profile</span>
                    </div>
                    <Settings className="ml-auto h-4 w-4 opacity-50" />
                </Button>
            </div>
        </aside>
    );
}

