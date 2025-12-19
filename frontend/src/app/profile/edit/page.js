"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DashboardLayout } from '@/components/dash-layout';
import { User, Save, Loader2, Briefcase, Sparkles, ChevronLeft } from 'lucide-react';

export default function EditProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        jobTitle: '',
        bio: '',
        skills: '',
        funFact: '',
        image: '',
        linkedinUrl: '',
        githubUrl: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('syllabus_auth_token');
                if (!token) {
                    router.push('/auth/login');
                    return;
                }

                const res = await fetch('/api/user/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.user) {
                        setFormData({
                            name: data.user.name || '',
                            jobTitle: data.user.jobTitle || '',
                            bio: data.user.bio || '',
                            skills: data.user.skills || '',
                            funFact: data.user.funFact || '',
                            image: data.user.image || '',
                            linkedinUrl: data.user.linkedinUrl || '',
                            githubUrl: data.user.githubUrl || ''
                        });
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('syllabus_auth_token');
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
                    localStorage.setItem('user', JSON.stringify({ ...localUser, name: formData.name }));
                    router.push('/profile');
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout title="Edit Profile">
            <div className="max-w-4xl mx-auto pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="flex flex-col gap-2">
                     <Button variant="ghost" className="w-fit pl-0 mb-2 text-muted-foreground hover:text-primary" onClick={() => router.back()}>
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Profile
                    </Button>
                    <h1 className="text-3xl font-heading font-bold tracking-tight">Edit Profile</h1>
                    <p className="text-muted-foreground">Update your personal information and portfolio details.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin h-10 w-10 text-primary" />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-8">
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2 font-heading">
                                    <User className="w-5 h-5 text-primary" /> Basic Info
                                </CardTitle>
                                <CardDescription>This information will be displayed on your public profile.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" value={formData.name} onChange={handleChange} placeholder="Your Name" className="bg-muted/30 border-border/60 focus:bg-background" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="jobTitle">Job Title</Label>
                                        <Input id="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="e.g. Junior Full Stack Developer" className="bg-muted/30 border-border/60 focus:bg-background" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="image">Profile Image URL</Label>
                                    <Input id="image" value={formData.image} onChange={handleChange} placeholder="https://..." className="bg-muted/30 border-border/60 focus:bg-background" />
                                    <p className="text-[10px] text-muted-foreground">We recommend using a square image from LinkedIn or GitHub.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border/60 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2 font-heading">
                                    <Sparkles className="w-5 h-5 text-amber-500" /> Portfolio Details
                                </CardTitle>
                                <CardDescription>Showcase your expertise and social presence.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                                        <Input id="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/..." className="bg-muted/30 border-border/60 focus:bg-background" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="githubUrl">GitHub URL</Label>
                                        <Input id="githubUrl" value={formData.githubUrl} onChange={handleChange} placeholder="https://github.com/..." className="bg-muted/30 border-border/60 focus:bg-background" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bio">Professional Bio</Label>
                                    <Textarea id="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..." className="min-h-[120px] bg-muted/30 border-border/60 focus:bg-background resize-none" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="skills">Skills <span className="text-muted-foreground font-normal text-xs">(Comma separated)</span></Label>
                                    <Input id="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, Python, TypeScript..." className="bg-muted/30 border-border/60 focus:bg-background" />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex items-center justify-end gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()} className="h-11 px-6">Cancel</Button>
                            <Button type="submit" disabled={saving} className="h-11 px-8 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                                {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </DashboardLayout>
    );
}
