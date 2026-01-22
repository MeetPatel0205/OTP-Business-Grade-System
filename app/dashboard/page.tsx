'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
                return;
            }

            // Role-based redirection
            const roles = user.roles?.map(r => r.name) || [];
            // console.log('User roles:', roles); // Debugging

            if (roles.includes('SuperAdmin')) {
                router.replace('/dashboard/superadmin');
            } else if (roles.includes('Admin')) {
                router.replace('/dashboard/admin');
            } else {
                // Default to user dashboard
                router.replace('/dashboard/user');
            }
        }
    }, [user, loading, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
}
