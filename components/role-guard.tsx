'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
                return;
            }

            const userRoles = user.roles?.map(r => r.name) || [];

            // Allow SuperAdmin to access everything? Usually yes.
            // But let's stick to strict checking as requested, or add SuperAdmin explicitly to all props.
            // For now, check if user has ONE of the allowed roles.
            const hasPermission = userRoles.some(role => allowedRoles.includes(role));

            if (!hasPermission) {
                // If checking SuperAdmin page but user is just User -> Redirect to /dashboard (which redirects to /dashboard/user)
                toast.error("Unauthorized Access");
                router.replace('/dashboard');
            } else {
                setAuthorized(true);
            }
        }
    }, [user, loading, router, allowedRoles]);

    if (loading || !authorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return <>{children}</>;
}

import { toast } from 'sonner';
