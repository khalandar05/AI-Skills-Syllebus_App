"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';

export default function SyllabusUploadPage() {
    const router = useRouter();
    const [file, setFile] = useState(null);
    const [rawText, setRawText] = useState('');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const [statusType, setStatusType] = useState('info'); // 'info' | 'success' | 'error'

    useEffect(() => {
        // Quick Auth Check
        const token = localStorage.getItem('syllabus_auth_token');
        if (!token) router.push('/auth/login');
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            // Reset status when file changes
            setStatusText('');
            setStatusType('info');
        }
    };

    const handleProcess = async (mode) => {
        const token = localStorage.getItem('syllabus_auth_token');
        if (!token) {
            alert("Please log in first.");
            return;
        }

        setUploading(true);
        setProgress(10);
        setStatusText('Analyzing content...');
        setStatusType('info');

        try {
            // 1. Upload/Send Data
            let response;
            if (mode === 'file') {
                if (!file) return;
                const formData = new FormData();
                formData.append('file', file);
                response = await fetch('/api/syllabus/upload', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });
            } else {
                if (!rawText.trim()) return;
                const formData = new FormData();
                const blob = new Blob([rawText], { type: 'text/plain' });
                formData.append('file', blob, 'pasted-text.txt'); // Re-use upload endpoint logic
                response = await fetch('/api/syllabus/upload', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });
            }

            if (!response.ok) {
                let errMessage = "Upload failed";
                const errText = await response.text();
                try {
                    const errData = JSON.parse(errText);
                    errMessage = errData.error || (Object.keys(errData).length === 0 ? "Server returned empty error." : JSON.stringify(errData));
                } catch (parseError) {
                    errMessage = `Server Error: ${response.status} ${response.statusText}`;
                }

                // Show error persistently
                setStatusText(errMessage);
                setStatusType('error');
                setUploading(false);
                return;
            }
            const data = await response.json();

            setProgress(40);
            setStatusText(`Extracted ${data.structure.units?.length || 0} units. Generating Projects...`);

            // 2. Generate Projects
            // We use the full structure now, but let's send a summary topic
            const topics = data.structure.units?.flatMap(u => u.topics).map(t => typeof t === 'string' ? t : t.name).slice(0, 5) || ['General'];

            const genResponse = await fetch('/api/projects/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    topic: topics.join(', '),
                    techStack: ['React', 'Node.js', 'PostgreSQL', 'Tailwind'] // Enhanced default
                })
            });

            if (!genResponse.ok) {
                const genErr = await genResponse.json().catch(() => ({}));
                const genMsg = genErr.error || "Generation failed";

                setStatusText(`Error: ${genMsg}`);
                setStatusType('error');
                setUploading(false);
                return;
            }

            const genData = await genResponse.json();

            setProgress(100);
            setStatusText('Success! Redirecting...');
            setStatusType('success');

            // Store for specific project view cache
            localStorage.setItem('lastGeneratedProjects', JSON.stringify(genData.projects));

            setTimeout(() => {
                router.push('/dashboard'); // or /projects
            }, 1000);

        } catch (error) {
            // Only log unexpected runtime errors (network failure etc)
            console.warn("Operation failed:", error.message);
            setStatusText('Error: ' + error.message);
            setStatusType('error');
            setUploading(false);
        }
    };

    return (
        <div className="container mx-auto p-10 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Build Projects from Syllabus</CardTitle>
                    <CardDescription>Upload a PDF, Image, or Paste Text to generate a custom project roadmap.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="upload" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="upload">Upload File</TabsTrigger>
                            <TabsTrigger value="text">Paste Text</TabsTrigger>
                        </TabsList>

                        <TabsContent value="upload" className="space-y-4 pt-4">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="syllabus">Syllabus File (PDF/Image)</Label>
                                <Input id="syllabus" type="file" onChange={handleFileChange} accept=".pdf,image/*,text/plain" />
                            </div>
                            <Button onClick={() => handleProcess('file')} disabled={!file || uploading} className="w-full">
                                {uploading ? 'Processing...' : 'Generate from File'}
                            </Button>
                        </TabsContent>

                        <TabsContent value="text" className="space-y-4 pt-4">
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="rawText">Paste Syllabus Content</Label>
                                <Textarea
                                    id="rawText"
                                    placeholder="Paste your course content here..."
                                    value={rawText}
                                    onChange={(e) => setRawText(e.target.value)}
                                    rows={8}
                                />
                            </div>
                            <Button onClick={() => handleProcess('text')} disabled={!rawText || uploading} className="w-full">
                                {uploading ? 'Processing...' : 'Generate from Text'}
                            </Button>
                        </TabsContent>
                    </Tabs>

                    {(uploading || statusText) && (
                        <div className="mt-6 space-y-2">
                            {uploading && <Progress value={progress} />}
                            <p className={`text-sm text-center ${statusType === 'error' ? 'text-red-600 font-bold' :
                                    statusType === 'success' ? 'text-green-600 font-bold' :
                                        'text-blue-600 animate-pulse'
                                }`}>
                                {statusText}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
