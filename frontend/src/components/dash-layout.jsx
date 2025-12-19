"use client"

import { Sidebar } from "@/components/dash-sidebar";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function DashboardLayout({ children, title = "Dashboard" }) {
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            // eslint-disable-next-line
            setUser(JSON.parse(storedUser));
        } else {
            router.push('/auth/login');
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('syllabus_auth_token');
        router.push('/auth/login');
    };

    return (
        <div className="flex h-screen bg-slate-50/50 dark:bg-background text-foreground">
            <Sidebar />

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Header */}
                <header className="h-20 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground font-heading">{title}</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <ModeToggle />

                        {user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-offset-2 ring-offset-background ring-transparent hover:ring-primary/20 transition-all">
                                        <Avatar className="h-10 w-10 border border-border">
                                            <AvatarImage src={user.profilePhoto} alt={user.name} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">{user.name ? user.name.charAt(0) : "U"}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal p-2">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-bold leading-none">{user.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer rounded-md p-2">
                                        <UserIcon className="mr-2 h-4 w-4" />
                                        <span>Profile Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer rounded-md p-2 hover:bg-red-50 dark:hover:bg-red-950/20">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-black/20">
                    <div className="mx-auto max-w-7xl animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

