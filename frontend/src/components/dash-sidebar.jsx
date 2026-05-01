"use client"

import { LayoutDashboard, User, FileText, CheckSquare, Sparkles, LogOut, Code2, BookOpen, Mic, Linkedin, ExternalLink, Award, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

export function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const menuItems = useMemo(() => [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { label: 'My Projects', icon: Code2, href: '/projects' },
        { label: 'Certificates', icon: Award, href: '/certificates' },
        { label: 'Portfolio', icon: User, href: '/portfolio' },
        { label: 'Resume Builder', icon: FileText, href: '/resume' }, 
        { label: 'Mock Interview', icon: Mic, href: '/mock-interview' },
        { label: 'LinkedIn Post', icon: Linkedin, href: '/linkedin/post' },
    ], []);

    const externalItems = useMemo(() => [
         { label: 'Campus360', icon: ExternalLink, href: 'https://campus360-ai-hmdp.vercel.app/login' },
    ], []);

    return (
        <aside className="w-64 hidden md:flex flex-col h-screen border-r bg-card text-card-foreground">
            {/* Header */}
            <div className="flex items-center gap-3 cursor-pointer p-6 border-b" onClick={() => router.push('/dashboard')}>
                <div className="relative h-10 w-10 rounded-md bg-primary flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-foreground">CareerForge</h1>
                </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Menu
                </div>
                {menuItems.map((item) => {
                    const isActive = mounted && (pathname === item.href || pathname.startsWith(`${item.href}/`));
                    return (
                        <Button
                            key={item.href}
                            variant="ghost"
                            className={`w-full justify-start gap-3 h-10 px-3 text-sm font-medium transition-colors rounded-md mb-1 ${
                                isActive 
                                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800' 
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            }`}
                            onClick={() => router.push(item.href)}
                        >
                            <item.icon size={18} className={isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-muted-foreground'} />
                            <span>{item.label}</span>
                        </Button>
                    );
                })}

                <div className="mt-8 mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    External
                </div>
                {externalItems.map((item) => (
                    <Button
                        key={item.href}
                        variant="ghost"
                        className="w-full justify-start gap-3 h-10 px-3 text-sm font-medium text-muted-foreground hover:text-accent-foreground hover:bg-accent transition-colors rounded-md mb-1"
                        onClick={() => window.open(item.href, '_blank')}
                    >
                        <item.icon size={18} className="text-muted-foreground" />
                        <span>{item.label}</span>
                    </Button>
                ))}
            </nav>

            {/* User Profile Module */}
            <div className="p-4 border-t">
                <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 h-auto py-3 px-2 transition-colors rounded-md hover:bg-accent"
                    onClick={() => router.push('/profile')}
                >
                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        <User size={16} />
                    </div>
                    <div className="flex flex-col items-start text-sm overflow-hidden flex-1">
                        <span className="font-semibold text-foreground truncate w-full text-left">User Profile</span>
                        <span className="text-xs text-muted-foreground">Manage Account</span>
                    </div>
                    <Settings className="ml-auto h-4 w-4 text-muted-foreground" />
                </Button>
            </div>
        </aside>
    );
}

