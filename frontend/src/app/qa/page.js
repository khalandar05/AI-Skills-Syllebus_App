"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, FileText, Download } from 'lucide-react';

export default function QAPage() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [qaData, setQaData] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleGenerate = async () => {
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('syllabus_auth_token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const res = await fetch('http://localhost:4000/api/qa/generate', {
                method: 'POST',
                headers: headers,
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                setQaData(data.data);
            } else {
                alert("Failed: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred generating Q&A");
        } finally {
            setLoading(false);
        }
    };

    const downloadJson = () => {
        if (!qaData) return;
        const blob = new Blob([JSON.stringify(qaData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qa-${qaData.title || 'generated'}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="container mx-auto p-10 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Chapter Q&A Generator</h1>
                <p className="text-gray-500">Upload a chapter PDF to generate exam, conceptual, and real-world questions.</p>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Upload Chapter / Unit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="pdf">PDF or Image</Label>
                        <Input id="pdf" type="file" accept=".pdf,image/*" onChange={handleFileChange} />
                    </div>
                    <Button onClick={handleGenerate} disabled={!file || loading} className="gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : <Upload size={16} />}
                        {loading ? "Analyzing & Generating..." : "Generate Questions"}
                    </Button>
                </CardContent>
            </Card>

            {qaData && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">{qaData.title}</h2>
                            <div className="flex gap-2 mt-2">
                                {qaData.focusTopics?.map((t, i) => (
                                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <Button variant="outline" onClick={downloadJson}>
                            <Download size={16} className="mr-2" /> Download JSON
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {qaData.questions?.map((q, idx) => (
                            <Card key={idx} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between">
                                        <div className="flex gap-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold border 
                                                ${q.type?.includes('Exam') ? 'bg-red-50 border-red-200 text-red-600' :
                                                    q.type?.includes('Real-World') ? 'bg-green-50 border-green-200 text-green-600' :
                                                        'bg-gray-100 border-gray-200 text-gray-600'}`}>
                                                {q.type}
                                            </span>
                                            <span className="text-xs text-gray-400 self-center uppercase">{q.difficulty}</span>
                                        </div>
                                        <span className="text-gray-300 font-mono">#{idx + 1}</span>
                                    </div>
                                    <CardTitle className="text-lg mt-2 leading-snug">{q.question}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <details className="text-sm">
                                        <summary className="cursor-pointer text-blue-600 hover:underline font-medium select-none">
                                            Show Answer
                                        </summary>
                                        <div className="mt-2 p-3 bg-slate-50 rounded border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap">
                                            {q.answer || "No answer provided."}
                                        </div>
                                    </details>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
