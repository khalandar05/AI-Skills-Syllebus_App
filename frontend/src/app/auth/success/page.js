"use client";
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('syllabus_auth_token', token);
            document.cookie = `syllabus_auth_token=${token}; path=/; max-age=604800`; // 7 days
            console.log("Token saved, redirecting to dashboard...");
            window.location.href = '/dashboard';
        } else {
            setTimeout(() => router.push('/auth/login?error=no_token'), 2000);
        }
    }, [router, searchParams]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-800">Finalizing Login...</h1>
            <p className="text-gray-500 mt-2">Please wait while we redirect you.</p>
        </div>
    );
}

export default function AuthSuccessPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
