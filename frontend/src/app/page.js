"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Book, Code, FileText, Upload } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Syllabus&rarr;Skills
          </h1>
          <div className="space-x-4">
            <Link href="/syllabus"><Button variant="ghost">Upload</Button></Link>
            <Link href="/projects"><Button variant="ghost">Projects</Button></Link>
            <Link href="/auth/login"><Button>Login</Button></Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-10 space-y-10">
        <section className="text-center space-y-4">
          <h2 className="text-5xl font-extrabold tracking-tight text-gray-900">
            Turn your Syllabus into <span className="text-blue-600">Real Skills</span>
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Upload your course syllabus and let our AI generate production-ready project roadmaps, tech stack recommendations, and resume bullet points.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Link href="/syllabus">
              <Button size="lg" className="h-12 px-8 text-lg">
                <Upload className="mr-2 h-5 w-5" /> Start Now
              </Button>
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-t-4 border-blue-500">
            <CardHeader><CardTitle className="flex items-center"><Book className="mr-2 text-blue-500" /> Syllabus Parsing</CardTitle></CardHeader>
            <CardContent>AI extracts units and topics from your course PDF or images instantly.</CardContent>
          </Card>
          <Card className="border-t-4 border-purple-500">
            <CardHeader><CardTitle className="flex items-center"><Code className="mr-2 text-purple-500" /> Project Generator</CardTitle></CardHeader>
            <CardContent>Get real-world project ideas mapped to your curriculum difficulty.</CardContent>
          </Card>
          <Card className="border-t-4 border-green-500">
            <CardHeader><CardTitle className="flex items-center"><FileText className="mr-2 text-green-500" /> Resume Builder</CardTitle></CardHeader>
            <CardContent>Auto-generate STAR format resume bullets for every completed project.</CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
