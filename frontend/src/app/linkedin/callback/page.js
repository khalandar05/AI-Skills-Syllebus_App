"use client"

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dash-layout';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('processing'); // processing, success, error
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const connectLinkedIn = async (code) => {
            const token = localStorage.getItem('syllabus_auth_token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            try {
                const res = await fetch('http://localhost:4000/api/auth/linkedin/connect', {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ code })
                });

                if (res.status === 401 || res.status === 403) {
                    const errData = await res.json().catch(() => ({ error: 'Unauthorized' }));
                    setStatus('error');
                    setErrorMessage(`Auth Failed: ${errData.error} (Status: ${res.status})`);
                    return;
                }

                const data = await res.json();
                if (data.success) {
                    setStatus('success');
                    setTimeout(() => {
                        router.push('/linkedin/post');
                    }, 2000);
                } else {
                    setStatus('error');
                    setErrorMessage(data.error || "Connection failed on server.");
                }
            } catch (err) {
                setStatus('error');
                setErrorMessage(err.message || "Network error occurred.");
            }
        };

        const handleCallback = async () => {
            const code = searchParams.get('code');
            const error = searchParams.get('error');

            if (error) {
                setStatus('error');
                setErrorMessage(error);
                return;
            }

            if (code) {
                await connectLinkedIn(code);
            } else {
                setStatus('error');
                setErrorMessage("No authorization code found.");
            }
        };

        handleCallback();
    }, [searchParams, router]);

    return (
        <div className="flex flex-col h-[60vh] items-center justify-center">
            <Card className="w-full max-w-md shadow-lg">
                <CardContent className="flex flex-col items-center py-10 space-y-4">
                    {status === 'processing' && (
                        <>
                            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                            <h2 className="text-xl font-semibold">Connecting to LinkedIn...</h2>
                            <p className="text-muted-foreground">Please wait while we verify your account.</p>
                        </>
                    )}
                    {status === 'success' && (
                        <>
                            <CheckCircle className="w-12 h-12 text-green-500" />
                            <h2 className="text-xl font-semibold">Connected Successfully!</h2>
                            <p className="text-muted-foreground">Redirecting you to create a post...</p>
                        </>
                    )}
                    {status === 'error' && (
                        <>
                            <XCircle className="w-12 h-12 text-red-500" />
                            <h2 className="text-xl font-semibold">Connection Failed</h2>
                            <p className="text-muted-foreground text-center text-red-400 px-4">
                                {errorMessage || "We couldn't connect your LinkedIn account."}
                            </p>
                            
                            {errorMessage?.includes("Session Expired") || errorMessage?.includes("Auth Failed") ? (
                                <button 
                                    onClick={() => {
                                        localStorage.removeItem('syllabus_auth_token');
                                        localStorage.removeItem('user');
                                        router.push('/auth/login');
                                    }}
                                    className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-colors shadow-lg shadow-indigo-500/30"
                                >
                                    Log In Again
                                </button>
                            ) : (
                                <button 
                                    onClick={() => router.push('/linkedin/post')}
                                    className="mt-4 text-indigo-600 hover:underline"
                                >
                                    Return to Post Page
                                </button>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function LinkedInCallbackPage() {
    return (
        <DashboardLayout title="Connecting LinkedIn...">
            <Suspense fallback={<div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>}>
                <CallbackContent />
            </Suspense>
        </DashboardLayout>
    );
}
