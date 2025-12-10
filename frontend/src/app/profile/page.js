"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bio: '',
        skills: '',
        jobTitle: '',
        funFact: '',
        profilePhoto: ''
    });

    // 1. Fetch User Data on Mount
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('syllabus_auth_token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            try {
                const res = await fetch('http://localhost:4000/api/user/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setFormData({
                            name: data.user.name || '',
                            email: data.user.email || '',
                            bio: data.user.bio || '',
                            skills: data.user.skills || '',
                            jobTitle: data.user.jobTitle || '',
                            funFact: data.user.funFact || '',
                            profilePhoto: data.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name || 'User')}&background=random`
                        });
                    }
                } else {
                    // Fallback or error
                    console.error("Failed to fetch profile");
                }
            } catch (err) {
                console.error("Profile Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    // 2. Handle Input Changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 3. Save Changes
    const handleSave = async () => {
        setSaving(true);
        const token = localStorage.getItem('syllabus_auth_token');

        try {
            const res = await fetch('http://localhost:4000/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    bio: formData.bio,
                    skills: formData.skills,
                    jobTitle: formData.jobTitle,
                    funFact: formData.funFact
                })
            });

            const data = await res.json();
            if (data.success) {
                alert("Profile updated successfully!");
                // Optionally update localStorage if it's used elsewhere
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({ ...storedUser, name: formData.name }));
            } else {
                alert("Failed to update: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Save Error:", error);
            alert("An error occurred while saving.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="container mx-auto p-10 max-w-2xl">
            <Button variant="ghost" className="mb-4 gap-2" onClick={() => router.back()}>
                <ArrowLeft size={16} /> Back
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col items-center gap-4">
                        <img
                            src={formData.profilePhoto}
                            alt="Profile"
                            className="w-24 h-24 rounded-full border-2 border-primary"
                        />
                        {/* Avatar upload is complex, skipping for now as per prompt "Fix Edit Profile" (usually means text fields first) */}
                    </div>

                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input name="name" value={formData.name} onChange={handleChange} />
                        </div>

                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={formData.email} disabled className="bg-gray-100" />
                        </div>

                        <div className="space-y-2">
                            <Label>Job Title / Role</Label>
                            <Input name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="e.g. Student, Junior Developer" />
                        </div>

                        <div className="space-y-2">
                            <Label>Bio</Label>
                            <Input name="bio" value={formData.bio} onChange={handleChange} placeholder="Short bio..." />
                        </div>

                        <div className="space-y-2">
                            <Label>Skills (Comma separated)</Label>
                            <Input name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, Python..." />
                        </div>

                        <div className="space-y-2">
                            <Label>Fun Fact</Label>
                            <Input name="funFact" value={formData.funFact} onChange={handleChange} placeholder="I love coding at night..." />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button className="w-full gap-2" onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="animate-spin" /> : <Save size={16} />}
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
