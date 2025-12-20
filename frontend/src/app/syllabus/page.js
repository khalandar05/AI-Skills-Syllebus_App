"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dash-layout';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, BookOpen, ArrowRight } from 'lucide-react';

export default function SyllabusUploadPage() {
    const router = useRouter();
    const [file, setFile] = useState(null);
    const [rawText, setRawText] = useState('');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('syllabus_auth_token');
        if (!token) router.push('/auth/login');
    }, [router]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleProcess = async (mode) => {
        const token = localStorage.getItem('syllabus_auth_token');
        if (!token) return;

        setUploading(true);
        setProgress(10);
        setStatusText('Analyzing course structure...');
        setError(null);

        try {
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
                formData.append('file', blob, 'pasted-text.txt');
                response = await fetch('/api/syllabus/upload', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });
            }

            const responseText = await response.text();
            let data;
            
            try {
                if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
                    data = JSON.parse(responseText);
                } else {
                    throw new Error("Received non-JSON response");
                }
            } catch (jsonError) {
                console.warn("Non-JSON Response received:", responseText);
                const isTimeout = responseText.includes("Internal Server Error") || 
                                  responseText.includes("Gateway Timeout") ||
                                  response.status === 504;
                const cleanError = isTimeout
                    ? "Server Timeout: The file is taking too long to process. Please try a smaller PDF or a clearer image."
                    : `Server returned invalid response: ${responseText.substring(0, 100)}...`;
                throw new Error(cleanError);
            }

            if (!response.ok) {
                throw new Error(data.error || `Upload failed with status: ${response.status}`);
            }

            setProgress(60);
            setStatusText('Structure extracted. Generating Master Flashcard Deck...');

            const genResponse = await fetch('/api/flashcards/generate-from-syllabus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    syllabusId: data.syllabusId
                })
            });

            if (!genResponse.ok) {
                const errorData = await genResponse.json().catch(() => ({}));
                throw new Error(errorData.error || `Flashcard generation failed with status: ${genResponse.status}`);
            }
            const genData = await genResponse.json();

            setProgress(100);
            setStatusText('Complete. Redirecting...');
            
            localStorage.setItem('temp_flashcard_deck', JSON.stringify(genData.data));
            
            setTimeout(() => {
                router.push('/flashcards');
            }, 800);

        } catch (err) {
            console.warn("Upload Flow Handled Error:", err.message);
            setError(err.message || "An unexpected error occurred.");
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <DashboardLayout title="Import Course Material">
            <div className="max-w-5xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="text-center mb-12 space-y-4">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-2 border border-primary/20 shadow-lg shadow-primary/10">
                        <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-5xl font-heading font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Skill Analysis</h1>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
                        Upload your course material to generate a comprehensive Active Recall Deck covering every unit and topic.
                    </p>
                </div>

                <Card className="rounded-2xl border-border/50 shadow-xl overflow-hidden bg-gradient-to-br from-card to-card/50">
                    <CardContent className="p-8 md:p-12">
                        <Tabs defaultValue="upload" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-8 h-12 p-1 bg-muted/50 rounded-xl border border-border/50">
                                <TabsTrigger value="upload" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md text-base h-full transition-all font-medium">Upload File</TabsTrigger>
                                <TabsTrigger value="text" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md text-base h-full transition-all font-medium">Paste Text</TabsTrigger>
                            </TabsList>

                            <TabsContent value="upload" className="space-y-8 mt-0 outline-none">
                                <div className="group relative flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-2xl p-12 hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer text-muted-foreground hover:text-primary active:scale-[0.99] duration-300 bg-background/50">
                                    <label htmlFor="syllabus" className="cursor-pointer flex flex-col items-center gap-6 w-full z-10">
                                        <div className="p-5 bg-background shadow-md rounded-full group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 border border-border/50">
                                            <Upload className="h-8 w-8 text-primary" />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">Click to upload or drag folder</p>
                                            <p className="text-sm text-muted-foreground">PDF or Images up to 10MB</p>
                                        </div>
                                        {file && (
                                            <div className="flex items-center gap-3 bg-background px-4 py-2 rounded-full shadow-sm border border-border/50 animate-in fade-in zoom-in duration-300">
                                                <div className="p-1 bg-emerald-500/10 rounded-full"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div>
                                                <span className="font-medium text-foreground text-sm">{file.name}</span>
                                            </div>
                                        )}
                                    </label>
                                    <Input id="syllabus" type="file" onChange={handleFileChange} accept=".pdf,image/*,text/plain" className="hidden" />
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                                <Button 
                                    onClick={() => handleProcess('file')} 
                                    disabled={!file || uploading} 
                                    className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 hover:scale-[1.01] transition-all"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="mr-3 h-5 w-5 animate-spin" /> {statusText || 'Processing...'}
                                        </>
                                    ) : (
                                        <>Generate Master Flashcards <ArrowRight className="ml-2 h-5 w-5 opacity-80" /></>
                                    )}
                                </Button>
                            </TabsContent>

                            <TabsContent value="text" className="space-y-6 mt-0 outline-none">
                                <Textarea
                                    placeholder="Paste course content, learning objectives, or topic list here..."
                                    value={rawText}
                                    onChange={(e) => setRawText(e.target.value)}
                                    rows={12}
                                    className="resize-y p-6 text-base leading-relaxed bg-background/50 border-border/60 focus:border-primary/40 rounded-xl shadow-inner"
                                />
                                <Button 
                                    onClick={() => handleProcess('text')} 
                                    disabled={!rawText || uploading} 
                                    className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 hover:scale-[1.01] transition-all"
                                >
                                     {uploading ? (
                                        <>
                                            <Loader2 className="mr-3 h-5 w-5 animate-spin" /> {statusText || 'Processing...'}
                                        </>
                                    ) : (
                                        <>Generate Master Flashcards <ArrowRight className="ml-2 h-5 w-5 opacity-80" /></>
                                    )}
                                </Button>
                            </TabsContent>
                        </Tabs>

                        {uploading && (
                            <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    <span>Analysis</span>
                                    <span>Extraction</span>
                                    <span>Generation</span>
                                </div>
                                <Progress value={progress} className="h-3 rounded-full bg-muted overflow-hidden" indicatorClassName="bg-gradient-to-r from-primary via-purple-500 to-indigo-500 transition-all duration-500" />
                                <p className="text-sm text-center text-muted-foreground font-medium animate-pulse">{statusText}</p>
                            </div>
                        )}

                        {error && (
                            <div className="mt-8 p-4 bg-destructive/5 border border-destructive/20 rounded-xl flex items-start gap-4 text-destructive animate-in shake duration-300">
                                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                                <div className="space-y-1">
                                    <p className="font-bold">Generation Failed</p>
                                    <p className="text-sm opacity-90 leading-relaxed">{error}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
