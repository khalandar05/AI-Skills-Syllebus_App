"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Github, CheckCircle2 } from 'lucide-react';

// Register Page Component
export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Save token
            localStorage.setItem('syllabus_auth_token', data.token);
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            // Redirect to dashboard
            router.push('/dashboard');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 lg:px-0">
             {/* Left Side - Brand/Art */}
             <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-900 opacity-90" />
                
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <div className="h-8 w-8 rounded-lg bg-muted backdrop-blur mr-3 flex items-center justify-center border border-border">
                        <span className="text-xl">🚀</span>
                    </div>
                    CareerForge AI
                </div>
                
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg font-medium leading-relaxed">
                            &ldquo;I landed my dream internship thanks to the projects I built here. The structured roadmap kept me on track every single day.&rdquo;
                        </p>
                        <footer className="text-sm opacity-80">Alex Chen, CS Student</footer>
                    </blockquote>
                </div>

                {/* Decorative Elements */}
                 <div className="relative z-10 mt-10 grid gap-4 opacity-50">
                    <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4" /> Build Real-World Portfolios</div>
                    <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4" /> Customized Learning Paths</div>
                    <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4" /> Industry-Standard Skills</div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="w-full max-w-md p-8 rounded-2xl bg-card/40  border border-border shadow-2xl">
                    <div className="absolute top-4 right-4 md:top-8 md:right-8">
                        <Link
                            href="/auth/login"
                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                            Login
                        </Link>
                    </div>

                    <div className="flex flex-col space-y-2 text-center mb-8">
                        <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
                            Create an account
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email below to create your account
                        </p>
                    </div>

                    <div className="grid gap-6">
                        <form onSubmit={handleRegister}>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input 
                                        id="name" 
                                        placeholder="John Doe" 
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input 
                                        id="email" 
                                        type="email" 
                                        placeholder="m@example.com" 
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input 
                                        id="password" 
                                        type="password" 
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                
                                {error && (
                                    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                                        {error}
                                    </div>
                                )}

                                <Button className="w-full h-11" type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create account
                                </Button>
                            </div>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-muted/50" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-transparent px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                         <div className="grid gap-2">
                            <Button variant="outline" className="h-11 bg-transparent border-border hover:bg-muted" type="button" disabled={loading} onClick={() => window.location.href = 'http://localhost:4000/api/auth/github'}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Github className="mr-2 h-4 w-4" />}
                                GitHub
                            </Button>
                        </div>

                        <p className="px-8 text-center text-xs text-muted-foreground mt-4">
                            By clicking continue, you agree to our{" "}
                            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
